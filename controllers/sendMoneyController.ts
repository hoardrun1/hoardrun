import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { APIError } from '@/middleware/error-handler'
import { calculateTransactionFee } from '@/lib/banking'
import { fraudDetection } from '@/lib/fraud-detection'
import { deviceFingerprint } from '@/lib/device-fingerprint'
import { performance } from '@/lib/performance'
import { logger } from '@/lib/logger'
import { RateLimiter } from '@/lib/rate-limiter'
import { sendTransactionNotification } from '@/lib/notifications'

const prisma = new PrismaClient()

// Input validation schemas
const sendMoneySchema = z.object({
  amount: z.number().positive(),
  beneficiaryId: z.string().min(1),
  description: z.string().max(200).optional(),
  category: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  deviceInfo: z.object({
    deviceId: z.string(),
    ip: z.string(),
    location: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }).optional(),
  }),
})

const beneficiarySchema = z.object({
  name: z.string().min(1),
  accountNumber: z.string().min(1),
  bankName: z.string().optional(),
  bankCode: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
})

const transferLimits = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 1000000,
  DAILY_LIMIT: 50000,
  MONTHLY_LIMIT: 500000,
  HIGH_RISK_THRESHOLD: 10000,
}

export const sendMoney = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = sendMoneySchema.parse(req.body)

    // Check rate limiting
    if (!await RateLimiter.checkLimit(`transfer:${userId}`, 5)) {
      throw new APIError(429, 'Too many transfer attempts', 'RATE_LIMIT_EXCEEDED')
    }

    // Validate amount limits
    if (data.amount < transferLimits.MIN_AMOUNT || data.amount > transferLimits.MAX_AMOUNT) {
      throw new APIError(400, 'Invalid transfer amount', 'INVALID_AMOUNT')
    }

    // Check daily and monthly limits
    const [dailyTotal, monthlyTotal] = await Promise.all([
      getDailyTransferTotal(userId),
      getMonthlyTransferTotal(userId),
    ])

    if (dailyTotal + data.amount > transferLimits.DAILY_LIMIT) {
      throw new APIError(400, 'Daily transfer limit exceeded', 'DAILY_LIMIT_EXCEEDED')
    }

    if (monthlyTotal + data.amount > transferLimits.MONTHLY_LIMIT) {
      throw new APIError(400, 'Monthly transfer limit exceeded', 'MONTHLY_LIMIT_EXCEEDED')
    }

    // Calculate transaction fee
    const fee = calculateTransactionFee(data.amount, 'TRANSFER')
    const totalAmount = data.amount + fee

    // Perform fraud detection
    const fraudCheck = await fraudDetection.checkTransaction({
      userId,
      amount: data.amount,
      type: 'TRANSFER',
      deviceId: data.deviceInfo.deviceId,
      ip: data.deviceInfo.ip,
      location: data.deviceInfo.location,
    })

    if (!fraudCheck.isAllowed) {
      throw new APIError(403, 'Transaction blocked due to suspicious activity', 'FRAUD_DETECTED')
    }

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Check user balance
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      })

      if (!user || user.balance < totalAmount) {
        throw new APIError(400, 'Insufficient funds', 'INSUFFICIENT_FUNDS')
      }

      // Check beneficiary exists and is active
      const beneficiary = await prisma.beneficiary.findFirst({
        where: {
          id: data.beneficiaryId,
          userId,
          isActive: true,
        },
      })

      if (!beneficiary) {
        throw new APIError(404, 'Beneficiary not found or inactive', 'BENEFICIARY_NOT_FOUND')
      }

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'TRANSFER',
          amount: -totalAmount,
          description: data.description,
          category: data.category,
          beneficiaryId: data.beneficiaryId,
          status: 'COMPLETED',
          fee,
          metadata: {
            deviceInfo: data.deviceInfo,
            riskScore: fraudCheck.riskScore,
          },
        },
        include: {
          beneficiary: {
            select: {
              name: true,
              accountNumber: true,
              bankName: true,
            },
          },
        },
      })

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: totalAmount } },
      })

      // Create recurring schedule if requested
      if (data.isRecurring && data.recurringFrequency) {
        await prisma.recurringTransaction.create({
          data: {
            userId,
            type: 'TRANSFER',
            amount: data.amount,
            beneficiaryId: data.beneficiaryId,
            frequency: data.recurringFrequency,
            description: data.description,
            category: data.category,
            nextExecutionDate: calculateNextExecutionDate(
              data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
              data.recurringFrequency
            ),
            isActive: true,
          },
        })
      }

      return {
        transaction,
        beneficiary,
        fee,
      }
    })

    // Invalidate caches
    await Promise.all([
      cache.del(`balance:${userId}`),
      cache.delPattern(`transactions:${userId}:*`),
    ])

    // Send notifications
    await sendTransactionNotification(userId, {
      type: 'MONEY_SENT',
      amount: data.amount,
      recipient: result.beneficiary.name,
      fee,
      status: 'COMPLETED',
    })

    res.json({
      message: 'Transfer completed successfully',
      transaction: result.transaction,
      fee: result.fee,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Send money error:', error)
    throw error
  }
}

export const addBeneficiary = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = beneficiarySchema.parse(req.body)

    // Check if beneficiary already exists
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        userId,
        accountNumber: data.accountNumber,
        isActive: true,
      },
    })

    if (existingBeneficiary) {
      throw new APIError(400, 'Beneficiary already exists', 'BENEFICIARY_EXISTS')
    }

    // Create beneficiary
    const beneficiary = await prisma.beneficiary.create({
      data: {
        userId,
        ...data,
        isActive: true,
      },
    })

    // Invalidate beneficiaries cache
    await cache.delPattern(`beneficiaries:${userId}:*`)

    res.json({
      message: 'Beneficiary added successfully',
      beneficiary,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Add beneficiary error:', error)
    throw error
  }
}

export const getBeneficiaries = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const searchQuery = req.query.q as string

    // Try to get from cache first
    const cacheKey = `beneficiaries:${userId}:${searchQuery || ''}`
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      return res.json(JSON.parse(cachedData))
    }

    // Build where clause
    const where = {
      userId,
      isActive: true,
      ...(searchQuery && {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { accountNumber: { contains: searchQuery } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
        ],
      }),
    }

    // Get beneficiaries with transaction count
    const beneficiaries = await prisma.beneficiary.findMany({
      where,
      include: {
        _count: {
          select: { transactions: true },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            amount: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { transactions: { _count: 'desc' } },
        { createdAt: 'desc' },
      ],
    })

    const result = beneficiaries.map(b => ({
      id: b.id,
      name: b.name,
      accountNumber: b.accountNumber,
      bankName: b.bankName,
      email: b.email,
      phoneNumber: b.phoneNumber,
      transactionCount: b._count.transactions,
      lastTransaction: b.transactions[0] || null,
    }))

    // Cache for 5 minutes
    await cache.set(cacheKey, JSON.stringify(result), 300)

    res.json(result)
  } catch (error) {
    logger.error('Get beneficiaries error:', error)
    throw error
  }
}

export const getTransferHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const beneficiaryId = req.params.beneficiaryId
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const offset = (page - 1) * limit

    // Get transfer history
    const [transfers, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          beneficiaryId,
          type: 'TRANSFER',
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          beneficiary: {
            select: {
              name: true,
              accountNumber: true,
              bankName: true,
            },
          },
        },
      }),
      prisma.transaction.count({
        where: {
          userId,
          beneficiaryId,
          type: 'TRANSFER',
        },
      }),
    ])

    res.json({
      transfers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    logger.error('Get transfer history error:', error)
    throw error
  }
}

// Helper functions
const getDailyTransferTotal = async (userId: string): Promise<number> => {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const transfers = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'TRANSFER',
      createdAt: { gte: startOfDay },
    },
    select: { amount: true },
  })

  return Math.abs(transfers.reduce((sum, t) => sum + t.amount, 0))
}

const getMonthlyTransferTotal = async (userId: string): Promise<number> => {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const transfers = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'TRANSFER',
      createdAt: { gte: startOfMonth },
    },
    select: { amount: true },
  })

  return Math.abs(transfers.reduce((sum, t) => sum + t.amount, 0))
}

const calculateNextExecutionDate = (
  startDate: Date,
  frequency: string
): Date => {
  const next = new Date(startDate)
  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + 1)
      break
    case 'WEEKLY':
      next.setDate(next.getDate() + 7)
      break
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1)
      break
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  return next
}

export default {
  sendMoney,
  addBeneficiary,
  getBeneficiaries,
  getTransferHistory,
} 