import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { APIError } from '@/middleware/error-handler'
import { calculateTransactionFee } from '@/lib/banking'
import { fraudDetection } from '@/lib/fraud-detection'
import { performance } from '@/lib/performance'
import { logger } from '@/lib/logger'
import { RateLimiter } from '@/lib/rate-limiter'
import { sendTransactionNotification } from '@/lib/notifications'
import { generateQRCode } from '@/lib/qr'

const prisma = new PrismaClient()

// Input validation schemas
const receiveMoneySchema = z.object({
  amount: z.number().positive(),
  description: z.string().max(200).optional(),
  category: z.string().optional(),
  senderInfo: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
  }).optional(),
  deviceInfo: z.object({
    deviceId: z.string(),
    ip: z.string(),
    location: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }).optional(),
  }),
})

const paymentRequestSchema = z.object({
  amount: z.number().positive(),
  description: z.string().max(200).optional(),
  category: z.string().optional(),
  recipientId: z.string().optional(),
  expiresIn: z.number().min(5).max(60 * 24).optional(), // minutes, default 24 hours
  allowPartial: z.boolean().optional(),
  minimumAmount: z.number().positive().optional(),
})

const receiveLimits = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 1000000,
  DAILY_LIMIT: 100000,
  MONTHLY_LIMIT: 1000000,
  HIGH_RISK_THRESHOLD: 10000,
}

export const receiveMoney = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = receiveMoneySchema.parse(req.body)

    // Check rate limiting
    if (!RateLimiter.checkLimit(`receive:${userId}`, 10)) {
      throw new APIError(429, 'Too many receive attempts', 'RATE_LIMIT_EXCEEDED')
    }

    // Validate amount limits
    if (data.amount < receiveLimits.MIN_AMOUNT || data.amount > receiveLimits.MAX_AMOUNT) {
      throw new APIError(400, 'Invalid receive amount', 'INVALID_AMOUNT')
    }

    // Check daily and monthly limits
    const [dailyTotal, monthlyTotal] = await Promise.all([
      getDailyReceiveTotal(userId),
      getMonthlyReceiveTotal(userId),
    ])

    if (dailyTotal + data.amount > receiveLimits.DAILY_LIMIT) {
      throw new APIError(400, 'Daily receive limit exceeded', 'DAILY_LIMIT_EXCEEDED')
    }

    if (monthlyTotal + data.amount > receiveLimits.MONTHLY_LIMIT) {
      throw new APIError(400, 'Monthly receive limit exceeded', 'MONTHLY_LIMIT_EXCEEDED')
    }

    // Calculate transaction fee
    const fee = calculateTransactionFee(data.amount, 'RECEIVE')
    const netAmount = data.amount - fee

    // Perform fraud detection
    const fraudCheck = await fraudDetection.checkTransaction({
      userId,
      amount: data.amount,
      type: 'RECEIVE',
      deviceId: data.deviceInfo.deviceId,
      ip: data.deviceInfo.ip,
      location: data.deviceInfo.location,
    })

    if (!fraudCheck.isAllowed) {
      throw new APIError(403, 'Transaction blocked due to suspicious activity', 'FRAUD_DETECTED')
    }

    // Create transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'RECEIVE',
          amount: netAmount,
          description: data.description,
          category: data.category,
          status: 'COMPLETED',
          fee,
          metadata: {
            senderInfo: data.senderInfo,
            deviceInfo: data.deviceInfo,
            riskScore: fraudCheck.riskScore,
          },
        },
      })

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: netAmount } },
      })

      return transaction
    })

    // Invalidate caches
    await Promise.all([
      cache.del(`balance:${userId}`),
      cache.delPattern(`transactions:${userId}:*`),
    ])

    // Send notification
    await sendTransactionNotification(userId, {
      type: 'MONEY_RECEIVED',
      amount: netAmount,
      sender: data.senderInfo?.name || 'Unknown',
      fee,
      status: 'COMPLETED',
    })

    res.json({
      message: 'Money received successfully',
      transaction: result,
      fee,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Receive money error:', error)
    throw error
  }
}

export const createPaymentRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = paymentRequestSchema.parse(req.body)

    // Check rate limiting
    if (!RateLimiter.checkLimit(`payment-request:${userId}`, 20)) {
      throw new APIError(429, 'Too many payment requests', 'RATE_LIMIT_EXCEEDED')
    }

    // Validate recipient if provided
    if (data.recipientId) {
      const recipient = await prisma.user.findUnique({
        where: { id: data.recipientId },
      })
      if (!recipient) {
        throw new APIError(404, 'Recipient not found', 'RECIPIENT_NOT_FOUND')
      }
    }

    // Validate partial payment settings
    if (data.allowPartial && data.minimumAmount) {
      if (data.minimumAmount > data.amount) {
        throw new APIError(400, 'Minimum amount cannot exceed total amount', 'INVALID_AMOUNT')
      }
    }

    // Generate payment request
    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId,
        recipientId: data.recipientId,
        amount: data.amount,
        description: data.description,
        category: data.category,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + (data.expiresIn || 24 * 60) * 60 * 1000),
        allowPartial: data.allowPartial || false,
        minimumAmount: data.minimumAmount,
      },
    })

    // Generate QR code
    const qrCode = await generateQRCode({
      type: 'PAYMENT_REQUEST',
      id: paymentRequest.id,
      amount: data.amount,
      recipient: {
        id: userId,
        name: req.user!.name,
      },
    })

    // Send notification to recipient if specified
    if (data.recipientId) {
      await sendTransactionNotification(data.recipientId, {
        type: 'PAYMENT_REQUEST',
        amount: data.amount,
        requester: req.user!.name,
        description: data.description,
        expiresAt: paymentRequest.expiresAt,
      })
    }

    res.json({
      message: 'Payment request created successfully',
      paymentRequest: {
        ...paymentRequest,
        qrCode,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Create payment request error:', error)
    throw error
  }
}

export const getPaymentRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const status = req.query.status as string
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const offset = (page - 1) * limit

    // Build where clause
    const where = {
      OR: [
        { userId },
        { recipientId: userId },
      ],
      ...(status && { status }),
    }

    // Get payment requests
    const [requests, total] = await Promise.all([
      prisma.paymentRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          recipient: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.paymentRequest.count({ where }),
    ])

    res.json({
      requests,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    logger.error('Get payment requests error:', error)
    throw error
  }
}

// Helper functions
const getDailyReceiveTotal = async (userId: string): Promise<number> => {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const receives = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'RECEIVE',
      createdAt: { gte: startOfDay },
    },
    select: { amount: true },
  })

  return receives.reduce((sum, t) => sum + t.amount, 0)
}

const getMonthlyReceiveTotal = async (userId: string): Promise<number> => {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const receives = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'RECEIVE',
      createdAt: { gte: startOfMonth },
    },
    select: { amount: true },
  })

  return receives.reduce((sum, t) => sum + t.amount, 0)
}

export default {
  receiveMoney,
  createPaymentRequest,
  getPaymentRequests,
} 