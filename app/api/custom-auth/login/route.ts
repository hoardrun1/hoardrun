import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { RateLimiter } from '@/lib/rate-limiter'
import { generateTwoFactorCode } from '@/lib/auth'
import { sendTwoFactorCode } from '@/lib/email'
import { detectSuspiciousActivity } from '@/lib/security'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  deviceInfo: z.object({
    fingerprint: z.string(),
    userAgent: z.string(),
    timestamp: z.string(),
    components: z.record(z.any()).optional()
  }).optional(),
  rememberMe: z.boolean().optional()
})

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    console.log('Login request body:', { ...body, password: '***hidden***' })
    
    const validation = signInSchema.safeParse(body)
    
    if (!validation.success) {
      console.log('Validation errors:', validation.error.errors)
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validation.error.errors 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const { email, password, deviceInfo, rememberMe } = validation.data
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Create default device info if not provided
    const finalDeviceInfo = deviceInfo || {
      fingerprint: `default-${Date.now()}`,
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      components: {}
    }

    // Check rate limiting using the correct method
    const rateLimitKey = `signin:${email}:${clientIp}`
    const isAllowed = await RateLimiter.checkLimit(rateLimitKey, 5)
    
    if (!isAllowed) {
      const lockoutTime = RateLimiter.getLockoutTime(rateLimitKey)
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many failed attempts. Please try again later.',
          retryAfter: lockoutTime ? Math.ceil((lockoutTime.getTime() - Date.now()) / 1000) : 900
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Find user with debugging
    console.log('Looking for user with email:', email.toLowerCase())
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        devices: true,
        securitySettings: true,
      },
    })

    console.log('User found:', user ? { id: user.id, email: user.email, hasPassword: !!user.password } : 'No user found')

    if (!user) {
      console.log('User not found for email:', email.toLowerCase())
      // Don't reset rate limit on failed login - let it accumulate
      return new NextResponse(
        JSON.stringify({ error: 'Invalid email or password' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Debug password verification
    console.log('Attempting password verification...')
    console.log('Password provided length:', password.length)
    console.log('Stored password hash exists:', !!user.password)
    console.log('Stored password hash starts with $2a$ or $2b$:', user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$'))
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('Password verification result:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('Password verification failed for user:', user.email)
      
      // Additional debugging - try manual hash to compare
      if (process.env.NODE_ENV === 'development') {
        try {
          const testHash = await bcrypt.hash(password, 12)
          console.log('Test hash for provided password:', testHash)
          console.log('Stored hash:', user.password)
          
          // Test if stored password might be plain text (security issue!)
          const isPlainText = password === user.password
          console.log('Is stored password plain text?:', isPlainText)
          
          if (isPlainText) {
            console.error('SECURITY WARNING: Password appears to be stored as plain text!')
          }
        } catch (error) {
          console.error('Error creating test hash:', error)
        }
      }
      
      // Don't reset rate limit on failed login - let it accumulate
      return new NextResponse(
        JSON.stringify({ error: 'Invalid email or password' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Password verification successful for user:', user.email)

    // Check for suspicious activity (optional feature)
    let isSuspicious = false
    try {
      if (detectSuspiciousActivity) {
        isSuspicious = await detectSuspiciousActivity({
          user,
          deviceInfo: finalDeviceInfo,
          clientIp
        })
      }
    } catch (error) {
      console.warn('Could not check suspicious activity:', error)
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set')
    }

    const token = await new SignJWT({ 
      userId: user.id,
      email: user.email,
      role: 'user', // Default role since User model doesn't have role field
      deviceId: finalDeviceInfo.fingerprint
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(rememberMe ? '30d' : '24h')
      .setIssuedAt()
      .sign(new TextEncoder().encode(jwtSecret))

    // Record the login attempt
    try {
      await prisma.loginAttempt.create({
        data: {
          userId: user.id,
          success: true,
          ipAddress: clientIp,
          userAgent: finalDeviceInfo.userAgent,
          deviceFingerprint: finalDeviceInfo.fingerprint,
          timestamp: new Date(finalDeviceInfo.timestamp)
        }
      })
    } catch (error) {
      console.warn('Could not record login attempt:', error)
    }

    // Check if this is a new device
    const isKnownDevice = user.devices && user.devices.some(d => d.fingerprint === finalDeviceInfo.fingerprint)
    
    if (!isKnownDevice) {
      // Record new device
      try {
        await prisma.device.create({
          data: {
            userId: user.id,
            fingerprint: finalDeviceInfo.fingerprint,
            userAgent: finalDeviceInfo.userAgent,
            lastIp: clientIp,
            lastUsed: new Date(),
            isVerified: false
          }
        })
      } catch (error) {
        console.warn('Could not record new device:', error)
      }

      // Generate and send 2FA code if enabled
      if (user.securitySettings?.twoFactorEnabled) {
        try {
          const twoFactorCode = generateTwoFactorCode()
          await prisma.twoFactorCode.create({
            data: {
              userId: user.id,
              code: twoFactorCode,
              expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
            }
          })
          await sendTwoFactorCode(user.email, twoFactorCode)
        } catch (error) {
          console.warn('Could not send 2FA code:', error)
        }
      }
    }

    // Reset rate limiting on successful login
    RateLimiter.resetLimit(rateLimitKey)

    const cookieValue = `auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict${
      rememberMe ? '; Max-Age=2592000' : ''
    }`

    console.log('Login successful for user:', user.email)

    return new NextResponse(
      JSON.stringify({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'user' // Default role since User model doesn't have role field
        },
        requiresVerification: !isKnownDevice && user.securitySettings?.twoFactorEnabled,
        isSuspicious
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieValue
        }
      }
    )
  } catch (error) {
    console.error('Sign-in error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}