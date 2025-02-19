import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { APIError } from '@/middleware/error-handler'
import { calculateTransactionFee } from '@/lib/banking'
import { sendTransactionNotification } from '@/lib/notifications'
import { RateLimiter } from '@/lib/rate-limiter'

const prisma = new PrismaClient()

// Input validation schemas
const sendMoneySchema = z.object({
  amount: z.number().positive(),
  beneficiaryId: z.string().min(1),
  description: z.string().max(200).optional(),
  category: z.string().optional(),
})

const receiveMoneySchema = z.object({
  amount: z.number().positive(),
  description: z.string().max(200).optional(),
  category: z.string().optional(),
  senderInfo: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
  }).optional(),
})

const requestMoneySchema = z.object({
  amount: z.number().positive(),
  beneficiaryId: z.string().min(1),
  description: z.string().max(200).optional(),
  dueDate: z.string().datetime().optional(),
})

export const sendMoney = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = sendMoneySchema.parse(req.body)

    // Check rate limiting
    if (!RateLimiter.checkLimit(`transfer:${userId}`, 5)) {
      throw new APIError(429, 'Too many transfer attempts', 'RATE_LIMIT_EXCEEDED')
    }

    // Calculate transaction fee
    const fee = calculateTransactionFee(data.amount, 'TRANSFER')
    const totalAmount = data.amount + fee

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

      // Create outgoing transaction
      const outgoingTransaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'TRANSFER',
          amount: -totalAmount,
          description: data.description,
          category: data.category,
          beneficiaryId: data.beneficiaryId,
          status: 'COMPLETED',
          merchant: beneficiary.name,
        },
      })

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: totalAmount } },
      })

      return {
        transaction: outgoingTransaction,
        beneficiary,
        fee,
      }
    })

    // Invalidate caches
    await Promise.all([
      cache.del(`balance:${userId}`),
      cache.delPattern(`transactions:${userId}:*`),
    ])

    // Send notification
    await sendTransactionNotification(userId, {
      type: 'MONEY_SENT',
      amount: data.amount,
      recipient: result.beneficiary.name,
      fee,
    })

    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid transfer data', 'VALIDATION_ERROR', error.errors)
    }
    throw error
  }
}

export const receiveMoney = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = receiveMoneySchema.parse(req.body)

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create incoming transaction
      const incomingTransaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'TRANSFER',
          amount: data.amount,
          description: data.description,
          category: data.category,
          status: 'COMPLETED',
          merchant: data.senderInfo?.name || 'Unknown Sender',
        },
      })

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: data.amount } },
      })

      return incomingTransaction
    })

    // Invalidate caches
    await Promise.all([
      cache.del(`balance:${userId}`),
      cache.delPattern(`transactions:${userId}:*`),
    ])

    // Send notification
    await sendTransactionNotification(userId, {
      type: 'MONEY_RECEIVED',
      amount: data.amount,
      sender: data.senderInfo?.name || 'Unknown Sender',
    })

    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid receive data', 'VALIDATION_ERROR', error.errors)
    }
    throw error
  }
}

export const requestMoney = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = requestMoneySchema.parse(req.body)

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

    // Create money request
    const request = await prisma.moneyRequest.create({
      data: {
        userId,
        beneficiaryId: data.beneficiaryId,
        amount: data.amount,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: 'PENDING',
      },
    })

    // Send notification to beneficiary
    if (beneficiary.email) {
      // Send email notification
      // TODO: Implement email notification
    }

    res.json(request)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid request data', 'VALIDATION_ERROR', error.errors)
    }
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
      },
      orderBy: {
        transactions: {
          _count: 'desc',
        },
      },
    })

    const result = beneficiaries.map(b => ({
      id: b.id,
      name: b.name,
      accountNumber: b.accountNumber,
      bankName: b.bankName,
      email: b.email,
      phoneNumber: b.phoneNumber,
      transactionCount: b._count.transactions,
    }))

    // Cache for 5 minutes
    await cache.set(cacheKey, JSON.stringify(result), 300)

    res.json(result)
  } catch (error) {
    throw error
  }
}

export const getTransferHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const beneficiaryId = req.params.beneficiaryId

    // Try to get from cache first
    const cacheKey = `transfer-history:${userId}:${beneficiaryId}`
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      return res.json(JSON.parse(cachedData))
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        beneficiaryId,
        type: 'TRANSFER',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    // Cache for 5 minutes
    await cache.set(cacheKey, JSON.stringify(transactions), 300)

    res.json(transactions)
  } catch (error) {
    throw error
  }
}

export default {
  sendMoney,
  receiveMoney,
  requestMoney,
  getBeneficiaries,
  getTransferHistory,
} 