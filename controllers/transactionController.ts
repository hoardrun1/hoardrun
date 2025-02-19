import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { calculateTransactionFee } from '@/lib/banking'
import { sendTransactionNotification } from '@/lib/notifications'

const prisma = new PrismaClient()

// Input validation schemas
const sendMoneySchema = z.object({
  amount: z.number().positive(),
  beneficiaryId: z.string().min(1),
  description: z.string().max(200).optional(),
})

const receiveMoneySchema = z.object({
  amount: z.number().positive(),
  description: z.string().max(200).optional(),
})

const transactionParamsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'INVESTMENT']).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const params = transactionParamsSchema.parse(req.query)
    const { page, limit, type, status, startDate, endDate } = params

    // Calculate offset
    const offset = (page - 1) * limit

    // Try to get from cache first
    const cacheKey = `transactions:${userId}:${JSON.stringify(params)}`
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      return res.json(JSON.parse(cachedData))
    }

    // Build where clause
    const where = {
      userId,
      ...(type && { type }),
      ...(status && { status }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          beneficiary: {
            select: {
              id: true,
              name: true,
              accountNumber: true,
              bankName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    const result = {
      transactions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    }

    // Cache for 1 minute
    await cache.set(cacheKey, JSON.stringify(result), 60)

    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message })
    }
    console.error('Get transactions error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const sendMoney = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { amount, beneficiaryId, description } = sendMoneySchema.parse(req.body)

    // Calculate transaction fee
    const fee = calculateTransactionFee(amount, 'TRANSFER')
    const totalAmount = amount + fee

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Check user balance
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      })

      if (!user || user.balance < totalAmount) {
        throw new Error('Insufficient funds')
      }

      // Check beneficiary exists
      const beneficiary = await prisma.beneficiary.findFirst({
        where: { id: beneficiaryId, userId },
      })

      if (!beneficiary) {
        throw new Error('Beneficiary not found')
      }

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'TRANSFER',
          amount: -totalAmount,
          description,
          beneficiaryId,
          status: 'COMPLETED',
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

      return transaction
    })

    // Invalidate caches
    await Promise.all([
      cache.del(`balance:${userId}`),
      cache.delPattern(`transactions:${userId}:*`),
    ])

    // Send notification
    await sendTransactionNotification(userId, {
      type: 'TRANSFER',
      amount: totalAmount,
      beneficiary: result.beneficiary!.name,
      status: 'COMPLETED',
    })

    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message })
    }
    console.error('Send money error:', error)
    res.status(500).json({ message: error instanceof Error ? error.message : 'Internal server error' })
  }
}

export const receiveMoney = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { amount, description } = receiveMoneySchema.parse(req.body)

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'DEPOSIT',
          amount,
          description,
          status: 'COMPLETED',
        },
      })

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
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
      type: 'DEPOSIT',
      amount,
      status: 'COMPLETED',
    })

    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message })
    }
    console.error('Receive money error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    // Try to get from cache first
    const cacheKey = `transaction-stats:${userId}`
    const cachedStats = await cache.get(cacheKey)
    if (cachedStats) {
      return res.json(JSON.parse(cachedStats))
    }

    // Calculate date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get transaction statistics
    const stats = await prisma.$transaction([
      // Total transactions count
      prisma.transaction.count({
        where: { userId },
      }),

      // Monthly income
      prisma.transaction.aggregate({
        where: {
          userId,
          type: { in: ['DEPOSIT', 'TRANSFER'] },
          amount: { gt: 0 },
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),

      // Monthly expenses
      prisma.transaction.aggregate({
        where: {
          userId,
          type: { in: ['WITHDRAWAL', 'TRANSFER'] },
          amount: { lt: 0 },
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),

      // 30-day transaction trend
      prisma.transaction.groupBy({
        by: ['createdAt'],
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    const result = {
      totalTransactions: stats[0],
      monthlyIncome: stats[1]._sum.amount || 0,
      monthlyExpenses: Math.abs(stats[2]._sum.amount || 0),
      trend: stats[3].map(day => ({
        date: day.createdAt,
        amount: day._sum.amount,
      })),
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, JSON.stringify(result), 300)

    res.json(result)
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 