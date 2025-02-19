import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { APIError } from '@/middleware/error-handler'
import { passwordPolicy } from '@/lib/password-policy'
import { biometricAuth } from '@/lib/biometric-auth'
import { deviceFingerprint } from '@/lib/device-fingerprint'
import { fraudDetection } from '@/lib/fraud-detection'
import { generateToken, verifyToken } from '@/lib/jwt'
import { sendVerificationEmail, sendLoginNotification } from '@/lib/notifications'
import { RateLimiter } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'

const prisma = new PrismaClient()

// Input validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  deviceInfo: z.object({
    deviceId: z.string(),
    userAgent: z.string(),
    ip: z.string(),
    components: z.record(z.any()),
  }),
})

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  deviceInfo: z.object({
    deviceId: z.string(),
    userAgent: z.string(),
    ip: z.string(),
    components: z.record(z.any()),
  }),
})

const verifyEmailSchema = z.object({
  userId: z.string(),
  code: z.string().length(6),
})

const verifySigninSchema = z.object({
  userId: z.string(),
  code: z.string().length(6),
  deviceInfo: z.object({
    deviceId: z.string(),
    userAgent: z.string(),
    ip: z.string(),
  }),
})

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, deviceInfo } = signupSchema.parse(req.body)

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      throw new APIError(400, 'Email already registered', 'EMAIL_IN_USE')
    }

    // Validate password strength
    const passwordValidation = await passwordPolicy.validatePassword(password, '', true)
    if (!passwordValidation.isStrong) {
      throw new APIError(400, 'Password too weak', 'WEAK_PASSWORD', passwordValidation.feedback)
    }

    // Generate device fingerprint
    const fingerprint = await deviceFingerprint.generateFingerprint(deviceInfo.components)

    // Hash password
    const hashedPassword = await passwordPolicy.hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        emailVerified: false,
      },
    })

    // Generate verification code
    const verificationCode = Math.random().toString().slice(2, 8)
    await cache.set(
      `verification:${user.id}`,
      verificationCode,
      15 * 60 // 15 minutes
    )

    // Send verification email
    await sendVerificationEmail(email, verificationCode)

    // Associate device with user
    await deviceFingerprint.associateWithUser(user.id, fingerprint.id)

    // Generate temporary token
    const token = await generateToken(user.id, {
      type: 'TEMPORARY',
      expiresIn: '15m',
    })

    res.json({
      message: 'Signup successful. Please verify your email.',
      userId: user.id,
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    throw error
  }
}

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password, deviceInfo } = signinSchema.parse(req.body)

    // Check rate limiting
    if (!RateLimiter.checkLimit(`signin:${email}`, 5)) {
      throw new APIError(429, 'Too many signin attempts', 'RATE_LIMIT_EXCEEDED')
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        security: true,
      },
    })

    if (!user) {
      throw new APIError(401, 'Invalid credentials', 'INVALID_CREDENTIALS')
    }

    // Verify password
    const isValidPassword = await passwordPolicy.verifyPassword(password, user.password)
    if (!isValidPassword) {
      await RateLimiter.increment(`signin:${email}`)
      throw new APIError(401, 'Invalid credentials', 'INVALID_CREDENTIALS')
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new APIError(403, 'Email not verified', 'EMAIL_NOT_VERIFIED')
    }

    // Generate device fingerprint
    const fingerprint = await deviceFingerprint.generateFingerprint(
      deviceInfo.components,
      user.id
    )

    // Check for suspicious activity
    const fraudCheck = await fraudDetection.checkTransaction({
      userId: user.id,
      type: 'LOGIN',
      amount: 0,
      deviceId: deviceInfo.deviceId,
      ip: deviceInfo.ip,
    })

    // Determine if additional verification is needed
    const requiresVerification =
      fraudCheck.requiresVerification ||
      !await deviceFingerprint.isDeviceTrusted(fingerprint.id)

    if (requiresVerification) {
      // Generate verification code
      const verificationCode = Math.random().toString().slice(2, 8)
      await cache.set(
        `signin-verification:${user.id}`,
        verificationCode,
        15 * 60 // 15 minutes
      )

      // Send verification code
      await sendLoginNotification(user.email, verificationCode, {
        deviceInfo: deviceInfo,
        location: 'Unknown', // Add location detection
      })

      // Generate temporary token
      const token = await generateToken(user.id, {
        type: 'TEMPORARY',
        expiresIn: '15m',
      })

      return res.json({
        requiresVerification: true,
        userId: user.id,
        token,
      })
    }

    // Generate session token
    const token = await generateToken(user.id, {
      type: 'SESSION',
      expiresIn: '7d',
    })

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    })

    res.json({
      message: 'Signin successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    throw error
  }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { userId, code } = verifyEmailSchema.parse(req.body)

    // Get stored verification code
    const storedCode = await cache.get(`verification:${userId}`)
    if (!storedCode || storedCode !== code) {
      throw new APIError(400, 'Invalid verification code', 'INVALID_CODE')
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
      },
    })

    // Clear verification code
    await cache.del(`verification:${userId}`)

    // Generate session token
    const token = await generateToken(userId, {
      type: 'SESSION',
      expiresIn: '7d',
    })

    res.json({
      message: 'Email verified successfully',
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    throw error
  }
}

export const verifySignin = async (req: Request, res: Response) => {
  try {
    const { userId, code, deviceInfo } = verifySigninSchema.parse(req.body)

    // Get stored verification code
    const storedCode = await cache.get(`signin-verification:${userId}`)
    if (!storedCode || storedCode !== code) {
      throw new APIError(400, 'Invalid verification code', 'INVALID_CODE')
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new APIError(404, 'User not found', 'USER_NOT_FOUND')
    }

    // Clear verification code
    await cache.del(`signin-verification:${userId}`)

    // Trust device
    await deviceFingerprint.trustDevice(deviceInfo.deviceId, {
      userId,
      deviceInfo,
    })

    // Generate session token
    const token = await generateToken(userId, {
      type: 'SESSION',
      expiresIn: '7d',
    })

    // Update last login
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
      },
    })

    res.json({
      message: 'Signin verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    throw error
  }
}

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    // Check rate limiting
    if (!RateLimiter.checkLimit(`resend-verification:${userId}`, 3)) {
      throw new APIError(429, 'Too many resend attempts', 'RATE_LIMIT_EXCEEDED')
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new APIError(404, 'User not found', 'USER_NOT_FOUND')
    }

    // Generate new verification code
    const verificationCode = Math.random().toString().slice(2, 8)
    await cache.set(
      `verification:${userId}`,
      verificationCode,
      15 * 60 // 15 minutes
    )

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode)

    res.json({
      message: 'Verification code resent successfully',
    })
  } catch (error) {
    throw error
  }
}

export default {
  signup,
  signin,
  verifyEmail,
  verifySignin,
  resendVerification,
} 