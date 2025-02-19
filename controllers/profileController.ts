import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { APIError } from '@/middleware/error-handler'
import { uploadImage, deleteImage } from '@/lib/storage'
import { biometricAuth } from '@/lib/biometric-auth'
import { logger } from '@/lib/logger'

const prisma = new PrismaClient()

// Input validation schemas
const createProfileSchema = z.object({
  userId: z.string(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  occupation: z.string().optional(),
  income: z.number().optional(),
  preferences: z.object({
    language: z.string().optional(),
    currency: z.string().optional(),
    timezone: z.string().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
    }).optional(),
  }).optional(),
  biometricData: z.object({
    faceData: z.string().optional(),
    fingerprintData: z.string().optional(),
  }).optional(),
  avatar: z.string().optional(), // Base64 image data
})

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  occupation: z.string().optional(),
  income: z.number().optional(),
  preferences: z.object({
    language: z.string().optional(),
    currency: z.string().optional(),
    timezone: z.string().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
    }).optional(),
  }).optional(),
  avatar: z.string().optional(), // Base64 image data
})

export const createProfile = async (req: Request, res: Response) => {
  try {
    const data = createProfileSchema.parse(req.body)
    const userId = req.user!.id

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new APIError(404, 'User not found', 'USER_NOT_FOUND')
    }

    // Handle avatar upload if provided
    let avatarUrl: string | undefined
    if (data.avatar) {
      avatarUrl = await uploadImage(data.avatar, `avatars/${userId}`)
    }

    // Handle biometric enrollment if provided
    if (data.biometricData) {
      if (data.biometricData.faceData) {
        await biometricAuth.enrollFace(
          userId,
          data.biometricData.faceData,
          req.headers['x-device-id'] as string
        )
      }

      if (data.biometricData.fingerprintData) {
        await biometricAuth.enrollFingerprint(
          userId,
          data.biometricData.fingerprintData,
          req.headers['x-device-id'] as string
        )
      }
    }

    // Create profile
    const profile = await prisma.userProfile.create({
      data: {
        userId,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        address: data.address,
        occupation: data.occupation,
        income: data.income,
        avatarUrl,
      },
    })

    // Create preferences
    if (data.preferences) {
      await prisma.userPreferences.create({
        data: {
          userId,
          ...data.preferences,
        },
      })
    }

    // Cache profile data
    await cache.set(
      `profile:${userId}`,
      JSON.stringify(profile),
      24 * 60 * 60 // 24 hours
    )

    res.json({
      message: 'Profile created successfully',
      profile,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    throw error
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const data = updateProfileSchema.parse(req.body)
    const userId = req.user!.id

    // Get existing profile
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!existingProfile) {
      throw new APIError(404, 'Profile not found', 'PROFILE_NOT_FOUND')
    }

    // Handle avatar update if provided
    let avatarUrl = existingProfile.avatarUrl
    if (data.avatar) {
      // Delete old avatar if exists
      if (existingProfile.avatarUrl) {
        await deleteImage(existingProfile.avatarUrl)
      }
      avatarUrl = await uploadImage(data.avatar, `avatars/${userId}`)
    }

    // Update profile
    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        address: data.address,
        occupation: data.occupation,
        income: data.income,
        avatarUrl,
      },
    })

    // Update preferences if provided
    if (data.preferences) {
      await prisma.userPreferences.upsert({
        where: { userId },
        update: data.preferences,
        create: {
          userId,
          ...data.preferences,
        },
      })
    }

    // Update user name if provided
    if (data.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: data.name },
      })
    }

    // Invalidate cache
    await cache.del(`profile:${userId}`)

    res.json({
      message: 'Profile updated successfully',
      profile,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    throw error
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    // Try to get from cache first
    const cachedProfile = await cache.get(`profile:${userId}`)
    if (cachedProfile) {
      return res.json(JSON.parse(cachedProfile))
    }

    // Get profile with preferences and biometric status
    const [profile, preferences, biometricStatus] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId },
      }),
      prisma.userPreferences.findUnique({
        where: { userId },
      }),
      biometricAuth.getBiometricStatus(userId),
    ])

    if (!profile) {
      throw new APIError(404, 'Profile not found', 'PROFILE_NOT_FOUND')
    }

    const result = {
      ...profile,
      preferences,
      biometricStatus,
    }

    // Cache for 24 hours
    await cache.set(`profile:${userId}`, JSON.stringify(result), 24 * 60 * 60)

    res.json(result)
  } catch (error) {
    throw error
  }
}

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    // Get profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      throw new APIError(404, 'Profile not found', 'PROFILE_NOT_FOUND')
    }

    // Delete avatar if exists
    if (profile.avatarUrl) {
      await deleteImage(profile.avatarUrl)
    }

    // Delete profile and related data
    await prisma.$transaction([
      prisma.userPreferences.delete({
        where: { userId },
      }),
      prisma.userProfile.delete({
        where: { userId },
      }),
    ])

    // Remove biometric data
    await Promise.all([
      biometricAuth.removeBiometricData(userId, 'face'),
      biometricAuth.removeBiometricData(userId, 'fingerprint'),
    ])

    // Invalidate cache
    await cache.del(`profile:${userId}`)

    res.json({
      message: 'Profile deleted successfully',
    })
  } catch (error) {
    throw error
  }
}

export default {
  createProfile,
  updateProfile,
  getProfile,
  deleteProfile,
} 