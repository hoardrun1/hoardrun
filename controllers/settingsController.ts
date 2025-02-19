import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { APIError } from '@/middleware/error-handler'
import { passwordPolicy } from '@/lib/password-policy'
import { biometricAuth } from '@/lib/biometric-auth'
import { deviceFingerprint } from '@/lib/device-fingerprint'
import { mfa } from '@/lib/mfa'
import { logger } from '@/lib/logger'
import { RateLimiter } from '@/lib/rate-limiter'
import { sendNotification } from '@/lib/notifications'

const prisma = new PrismaClient()

// Input validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  avatar: z.string().optional(), // Base64 image data
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
  }).optional(),
})

const updateSecuritySchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).optional(),
  twoFactorEnabled: z.boolean().optional(),
  biometricEnabled: z.boolean().optional(),
  deviceTrustDuration: z.number().min(1).max(90).optional(), // days
  loginNotifications: z.boolean().optional(),
  transactionNotifications: z.boolean().optional(),
})

const updatePreferencesSchema = z.object({
  defaultAccount: z.string().optional(),
  defaultCard: z.string().optional(),
  autoInvest: z.boolean().optional(),
  autoSave: z.boolean().optional(),
  budgetAlerts: z.boolean().optional(),
  lowBalanceAlert: z.number().positive().optional(),
  monthlyReports: z.boolean().optional(),
  transactionLimits: z.object({
    daily: z.number().positive().optional(),
    monthly: z.number().positive().optional(),
  }).optional(),
})

export const getSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    // Try to get from cache first
    const cacheKey = `settings:${userId}`
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      return res.json(JSON.parse(cachedData))
    }

    // Get user settings with all related data
    const [user, preferences, security, devices, mfaStatus] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          phoneNumber: true,
          language: true,
          timezone: true,
          currency: true,
          theme: true,
          avatar: true,
          lastLogin: true,
          createdAt: true,
        },
      }),
      prisma.userPreferences.findUnique({
        where: { userId },
      }),
      prisma.userSecurity.findUnique({
        where: { userId },
        select: {
          twoFactorEnabled: true,
          biometricEnabled: true,
          lastPasswordChange: true,
          loginAttempts: true,
          securityScore: true,
          deviceTrustDuration: true,
          loginNotifications: true,
          transactionNotifications: true,
        },
      }),
      deviceFingerprint.getDevicesByUser(userId),
      mfa.getMFADevices(userId),
    ])

    if (!user) {
      throw new APIError(404, 'User not found', 'USER_NOT_FOUND')
    }

    // Get biometric status
    const biometricStatus = await biometricAuth.getBiometricStatus(userId)

    // Calculate security score
    const securityScore = calculateSecurityScore({
      hasMFA: security?.twoFactorEnabled || false,
      hasBiometric: security?.biometricEnabled || false,
      passwordAge: security?.lastPasswordChange
        ? Math.floor((Date.now() - security.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      hasStrongPassword: true, // We enforce this during password creation
      hasBackupCodes: true, // We generate these during MFA setup
      hasRecoveryEmail: !!user.email,
      hasRecoveryPhone: !!user.phoneNumber,
    })

    const result = {
      profile: {
        ...user,
        avatar: user.avatar ? `${process.env.ASSET_URL}/avatars/${user.avatar}` : null,
      },
      preferences: preferences || {},
      security: {
        ...security,
        securityScore,
        biometricStatus,
        mfaDevices: mfaStatus,
        trustedDevices: devices.filter(d => d.isTrusted),
      },
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, JSON.stringify(result), 300)

    res.json(result)
  } catch (error) {
    logger.error('Get settings error:', error)
    throw error
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = updateProfileSchema.parse(req.body)

    // Check if email is being changed
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser && existingUser.id !== userId) {
        throw new APIError(400, 'Email already in use', 'EMAIL_IN_USE')
      }
    }

    // Handle avatar upload if provided
    let avatarUrl = undefined
    if (data.avatar) {
      avatarUrl = await uploadAvatar(userId, data.avatar)
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        avatar: avatarUrl,
      },
    })

    // Invalidate cache
    await cache.delPattern(`settings:${userId}*`)

    // Send notification if email changed
    if (data.email) {
      await sendNotification(userId, {
        type: 'EMAIL_CHANGED',
        oldEmail: req.user!.email,
        newEmail: data.email,
      })
    }

    res.json({
      message: 'Profile updated successfully',
      profile: {
        ...updatedUser,
        avatar: avatarUrl ? `${process.env.ASSET_URL}/avatars/${avatarUrl}` : null,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Update profile error:', error)
    throw error
  }
}

export const updateSecurity = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = updateSecuritySchema.parse(req.body)

    // Check rate limiting
    if (!RateLimiter.checkLimit(`security-update:${userId}`, 5)) {
      throw new APIError(429, 'Too many security update attempts', 'RATE_LIMIT_EXCEEDED')
    }

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user || !await passwordPolicy.verifyPassword(data.currentPassword, user.password)) {
      throw new APIError(401, 'Current password is incorrect', 'INVALID_PASSWORD')
    }

    // Update security settings
    const updates: any = {}

    if (data.newPassword) {
      // Validate new password
      const passwordValidation = await passwordPolicy.validatePassword(data.newPassword, userId)
      if (!passwordValidation.isStrong) {
        throw new APIError(400, 'Password too weak', 'WEAK_PASSWORD', passwordValidation.feedback)
      }
      updates.password = await passwordPolicy.hashPassword(data.newPassword)
      updates.lastPasswordChange = new Date()
    }

    if (data.twoFactorEnabled !== undefined) {
      updates.twoFactorEnabled = data.twoFactorEnabled
    }

    if (data.biometricEnabled !== undefined) {
      updates.biometricEnabled = data.biometricEnabled
    }

    if (data.deviceTrustDuration !== undefined) {
      updates.deviceTrustDuration = data.deviceTrustDuration
    }

    if (data.loginNotifications !== undefined) {
      updates.loginNotifications = data.loginNotifications
    }

    if (data.transactionNotifications !== undefined) {
      updates.transactionNotifications = data.transactionNotifications
    }

    // Update security settings
    const security = await prisma.userSecurity.upsert({
      where: { userId },
      update: updates,
      create: {
        userId,
        ...updates,
      },
    })

    // Invalidate cache
    await cache.delPattern(`settings:${userId}*`)

    // Send notification
    await sendNotification(userId, {
      type: 'SECURITY_UPDATED',
      changes: Object.keys(updates),
    })

    res.json({
      message: 'Security settings updated successfully',
      security,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Update security error:', error)
    throw error
  }
}

export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = updatePreferencesSchema.parse(req.body)

    // Validate referenced IDs
    if (data.defaultAccount) {
      const account = await prisma.bankAccount.findFirst({
        where: { id: data.defaultAccount, userId },
      })
      if (!account) {
        throw new APIError(404, 'Default account not found', 'ACCOUNT_NOT_FOUND')
      }
    }

    if (data.defaultCard) {
      const card = await prisma.card.findFirst({
        where: { id: data.defaultCard, userId },
      })
      if (!card) {
        throw new APIError(404, 'Default card not found', 'CARD_NOT_FOUND')
      }
    }

    // Update preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    })

    // Invalidate cache
    await cache.delPattern(`settings:${userId}*`)

    res.json({
      message: 'Preferences updated successfully',
      preferences,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Update preferences error:', error)
    throw error
  }
}

export const getSecurityLog = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const offset = (page - 1) * limit

    // Get security events
    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          device: {
            select: {
              deviceId: true,
              deviceType: true,
              location: true,
            },
          },
        },
      }),
      prisma.securityEvent.count({
        where: { userId },
      }),
    ])

    res.json({
      events,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    logger.error('Get security log error:', error)
    throw error
  }
}

// Helper functions
const calculateSecurityScore = (factors: {
  hasMFA: boolean
  hasBiometric: boolean
  passwordAge: number
  hasStrongPassword: boolean
  hasBackupCodes: boolean
  hasRecoveryEmail: boolean
  hasRecoveryPhone: boolean
}): number => {
  let score = 0

  // Base security features (50 points)
  if (factors.hasStrongPassword) score += 20
  if (factors.hasMFA) score += 20
  if (factors.hasBiometric) score += 10

  // Recovery options (20 points)
  if (factors.hasBackupCodes) score += 5
  if (factors.hasRecoveryEmail) score += 10
  if (factors.hasRecoveryPhone) score += 5

  // Password freshness (10 points)
  if (factors.passwordAge < 90) score += 10
  else if (factors.passwordAge < 180) score += 5

  // Additional security measures (20 points)
  if (factors.hasMFA && factors.hasBiometric) score += 10
  if (factors.hasRecoveryEmail && factors.hasRecoveryPhone) score += 10

  return Math.min(score, 100)
}

const uploadAvatar = async (userId: string, base64Image: string): Promise<string> => {
  try {
    // Implementation depends on your file storage solution
    // This is a placeholder
    return `${userId}-${Date.now()}.jpg`
  } catch (error) {
    logger.error('Avatar upload error:', error)
    throw new APIError(500, 'Failed to upload avatar', 'UPLOAD_FAILED')
  }
}

export default {
  getSettings,
  updateProfile,
  updateSecurity,
  updatePreferences,
  getSecurityLog,
} 