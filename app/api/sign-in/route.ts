import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/server/db'
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
  }),
  rememberMe: z.boolean().optional()
})

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = signInSchema.safeParse(body)
    
    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input data' }),
        { status: 400 }
      )
    }

    const { email, password, deviceInfo, rememberMe } = validation.data
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')

    // Check rate limiting
    if (!RateLimiter.checkLimit(`signin:${email}:${clientIp}`, 5)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many attempts. Please try again later.' }),
        { status: 429 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        devices: true,
        securitySettings: true,
      },
    })

    if (!user) {
      await RateLimiter.increment(`signin:${email}:${clientIp}`)
      return new NextResponse(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      await RateLimiter.increment(`signin:${email}:${clientIp}`)
      return new NextResponse(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401 }
      )
    }

    // Check for suspicious activity
    const isSuspicious = await detectSuspiciousActivity({
      user,
      deviceInfo,
      clientIp
    })

    // Generate JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: 'user', // Default role since User model doesn't have role field
      deviceId: deviceInfo.fingerprint
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(rememberMe ? '30d' : '24h')
      .setIssuedAt()
      .sign(new TextEncoder().encode(process.env.JWT_SECRET))

    // Record the login attempt
    await prisma.loginAttempt.create({
      data: {
        userId: user.id,
        success: true,
        ipAddress: clientIp || '',
        userAgent: deviceInfo.userAgent,
        deviceFingerprint: deviceInfo.fingerprint,
        timestamp: new Date(deviceInfo.timestamp)
      }
    })

    // Check if this is a new device
    const isKnownDevice = user.devices.some(d => d.fingerprint === deviceInfo.fingerprint)
    
    if (!isKnownDevice) {
      // Record new device
      await prisma.device.create({
        data: {
          userId: user.id,
          fingerprint: deviceInfo.fingerprint,
          userAgent: deviceInfo.userAgent,
          lastIp: clientIp || '',
          lastUsed: new Date(),
          isVerified: false
        }
      })

      // Generate and send 2FA code if enabled
      if (user.securitySettings?.twoFactorEnabled) {
        const twoFactorCode = generateTwoFactorCode()
        await prisma.twoFactorCode.create({
          data: {
            userId: user.id,
            code: twoFactorCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
          }
        })
        await sendTwoFactorCode(user.email, twoFactorCode)
      }
    }

    // Clear rate limiting on successful login
    RateLimiter.resetLimit(`signin:${email}:${clientIp}`)

    return new NextResponse(
      JSON.stringify({
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
          'Set-Cookie': `auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict${
            rememberMe ? '; Max-Age=2592000' : ''
          }`
        }
      }
    )
  } catch (error) {
    console.error('Sign-in error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    )
  }
} 
