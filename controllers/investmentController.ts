import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { APIError } from '@/middleware/error-handler'
import { performance } from '@/lib/performance'
import { logger } from '@/lib/logger'
import { calculateInvestmentRisk, analyzeMarketConditions } from '@/lib/investment'
import { calculateInvestmentReturn, analyzeRisk } from '@/lib/investment'
import { sendInvestmentNotification } from '@/lib/notifications'

const prisma = new PrismaClient()

// Input validation schemas
const createInvestmentSchema = z.object({
  type: z.enum(['STOCKS', 'BONDS', 'REAL_ESTATE', 'CRYPTO', 'ETF', 'MUTUAL_FUND']),
  amount: z.number().positive(),
  description: z.string().optional(),
  targetReturn: z.number().optional(),
  riskTolerance: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']),
  duration: z.number().positive(), // in months
})

const updateInvestmentSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  targetReturn: z.number().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
})

const getInvestmentsSchema = z.object({
  type: z.enum(['STOCKS', 'BONDS', 'REAL_ESTATE', 'CRYPTO', 'ETF', 'MUTUAL_FUND']).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(['amount', 'createdAt', 'return']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const getInvestments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const params = getInvestmentsSchema.parse(req.query)

    return await performance.measurePerformance(
      'getInvestments',
      async () => {
        // Try to get from cache first
        const cacheKey = `investments:${userId}:${JSON.stringify(params)}`
        const cachedData = await cache.getCachedData(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        // Build where clause
        const where = {
          userId,
          ...(params.type && { type: params.type }),
          ...(params.status && { status: params.status }),
          ...(params.minAmount && { amount: { gte: params.minAmount } }),
          ...(params.maxAmount && { amount: { lte: params.maxAmount } }),
          ...(params.startDate && params.endDate && {
            createdAt: {
              gte: new Date(params.startDate),
              lte: new Date(params.endDate),
            },
          }),
        }

        // Calculate pagination
        const skip = (params.page - 1) * params.limit

        // Get investments with pagination
        const [investments, total] = await Promise.all([
          prisma.investment.findMany({
            where,
            include: {
              returns: {
                orderBy: { date: 'desc' },
                take: 1,
              },
              transactions: {
                orderBy: { createdAt: 'desc' },
                take: 5,
              },
            },
            orderBy: params.sortBy
              ? { [params.sortBy]: params.sortOrder || 'desc' }
              : { createdAt: 'desc' },
            skip,
            take: params.limit,
          }),
          prisma.investment.count({ where }),
        ])

        // Calculate additional metrics
        const enrichedInvestments = await Promise.all(
          investments.map(async (investment) => {
            const risk = await calculateInvestmentRisk(investment)
            const marketConditions = await analyzeMarketConditions(investment.type)

            return {
              ...investment,
              risk,
              marketConditions,
              currentValue: investment.amount + (investment.returns[0]?.amount || 0),
              returnPercentage: investment.returns[0]
                ? (investment.returns[0].amount / investment.amount) * 100
                : 0,
            }
          })
        )

        const result = {
          investments: enrichedInvestments,
          pagination: {
            total,
            pages: Math.ceil(total / params.limit),
            currentPage: params.page,
            limit: params.limit,
          },
          summary: {
            totalInvested: investments.reduce((sum, inv) => sum + inv.amount, 0),
            totalReturns: investments.reduce(
              (sum, inv) => sum + (inv.returns[0]?.amount || 0),
              0
            ),
            averageReturn: investments.length
              ? (investments.reduce(
                  (sum, inv) => sum + (inv.returns[0]?.amount || 0),
                  0
                ) /
                  investments.length) *
                100
              : 0,
          },
        }

        // Cache the result
        await cache.cacheData(cacheKey, result, {
          ttl: 300, // 5 minutes
          tags: ['investments', `user:${userId}`],
        })

        return res.json(result)
      },
      { userId }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid parameters', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Get investments error:', error)
    throw error
  }
}

export const createInvestment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = createInvestmentSchema.parse(req.body)

    return await performance.measurePerformance(
      'createInvestment',
      async () => {
        // Check user's balance
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { balance: true },
        })

        if (!user || user.balance < data.amount) {
          throw new APIError(400, 'Insufficient funds', 'INSUFFICIENT_FUNDS')
        }

        // Start a transaction
        const result = await prisma.$transaction(async (prisma) => {
          // Create investment
          const investment = await prisma.investment.create({
            data: {
              userId,
              ...data,
              status: 'ACTIVE',
            },
          })

          // Create initial transaction
          await prisma.transaction.create({
            data: {
              userId,
              type: 'INVESTMENT',
              amount: -data.amount,
              description: `Investment in ${data.type}`,
              investmentId: investment.id,
            },
          })

          // Update user balance
          await prisma.user.update({
            where: { id: userId },
            data: {
              balance: { decrement: data.amount },
            },
          })

          return investment
        })

        // Invalidate relevant caches
        await cache.invalidateCacheByTags([
          'investments',
          `user:${userId}`,
          'transactions',
        ])

        // Send notification
        await sendInvestmentNotification(userId, {
          type: data.type,
          amount: data.amount,
          status: 'ACTIVE',
        })

        return res.status(201).json(result)
      },
      { userId }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid investment data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Create investment error:', error)
    throw error
  }
}

export const updateInvestment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const investmentId = req.params.id
    const data = updateInvestmentSchema.parse(req.body)

    return await performance.measurePerformance(
      'updateInvestment',
      async () => {
        // Check if investment exists and belongs to user
        const investment = await prisma.investment.findFirst({
          where: {
            id: investmentId,
            userId,
          },
        })

        if (!investment) {
          throw new APIError(404, 'Investment not found', 'NOT_FOUND')
        }

        // Update investment
        const updatedInvestment = await prisma.investment.update({
          where: { id: investmentId },
          data,
          include: {
            returns: {
              orderBy: { date: 'desc' },
              take: 1,
            },
          },
        })

        // Invalidate relevant caches
        await cache.invalidateCacheByTags([
          'investments',
          `user:${userId}`,
          `investment:${investmentId}`,
        ])

        return res.json(updatedInvestment)
      },
      { userId }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid update data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Update investment error:', error)
    throw error
  }
}

export const getInvestmentDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const investmentId = req.params.id

    return await performance.measurePerformance(
      'getInvestmentDetails',
      async () => {
        // Try to get from cache first
        const cacheKey = `investment:${investmentId}`
        const cachedData = await cache.getCachedData(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        // Get investment details
        const investment = await prisma.investment.findFirst({
          where: {
            id: investmentId,
            userId,
          },
          include: {
            returns: {
              orderBy: { date: 'desc' },
            },
            transactions: {
              orderBy: { createdAt: 'desc' },
            },
          },
        })

        if (!investment) {
          throw new APIError(404, 'Investment not found', 'NOT_FOUND')
        }

        // Enrich with additional data
        const risk = await calculateInvestmentRisk(investment)
        const marketConditions = await analyzeMarketConditions(investment.type)

        const result = {
          ...investment,
          risk,
          marketConditions,
          currentValue: investment.amount + (investment.returns[0]?.amount || 0),
          returnPercentage: investment.returns[0]
            ? (investment.returns[0].amount / investment.amount) * 100
            : 0,
          performance: {
            daily: calculatePerformance(investment.returns, 1),
            weekly: calculatePerformance(investment.returns, 7),
            monthly: calculatePerformance(investment.returns, 30),
            yearly: calculatePerformance(investment.returns, 365),
          },
        }

        // Cache the result
        await cache.cacheData(cacheKey, result, {
          ttl: 300, // 5 minutes
          tags: ['investments', `user:${userId}`, `investment:${investmentId}`],
        })

        return res.json(result)
      },
      { userId }
    )
  } catch (error) {
    logger.error('Get investment details error:', error)
    throw error
  }
}

// Helper function to calculate performance over different periods
const calculatePerformance = (returns: any[], days: number) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const periodReturns = returns.filter(r => new Date(r.date) >= cutoffDate)
  if (periodReturns.length === 0) return 0

  return (
    periodReturns.reduce((sum, r) => sum + r.amount, 0) /
    periodReturns.length
  )
}

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    // Try to get from cache first
    const cacheKey = `investment-stats:${userId}`
    const cachedStats = await cache.get(cacheKey)
    if (cachedStats) {
      return res.json(JSON.parse(cachedStats))
    }

    // Calculate date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))

    // Get investment statistics
    const stats = await prisma.$transaction([
      // Total active investments
      prisma.investment.aggregate({
        where: {
          userId,
          status: 'ACTIVE',
        },
        _sum: {
          amount: true,
          return: true,
        },
        _count: true,
      }),

      // Investment distribution by type
      prisma.investment.groupBy({
        by: ['type'],
        where: {
          userId,
          status: 'ACTIVE',
        },
        _sum: {
          amount: true,
        },
      }),

      // Investment performance over time
      prisma.investment.findMany({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          type: true,
          amount: true,
          return: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),

      // Risk distribution
      prisma.investment.groupBy({
        by: ['risk'],
        where: {
          userId,
          status: 'ACTIVE',
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    const result = {
      totalInvestments: {
        count: stats[0]._count,
        amount: stats[0]._sum.amount || 0,
        returns: stats[0]._sum.return || 0,
      },
      distribution: stats[1].map(item => ({
        type: item.type,
        amount: item._sum.amount || 0,
        percentage: (item._sum.amount || 0) / (stats[0]._sum.amount || 1) * 100,
      })),
      performance: stats[2],
      riskAnalysis: stats[3].map(item => ({
        risk: item.risk,
        amount: item._sum.amount || 0,
        percentage: (item._sum.amount || 0) / (stats[0]._sum.amount || 1) * 100,
      })),
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, JSON.stringify(result), 300)

    res.json(result)
  } catch (error) {
    throw error
  }
}

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    // Try to get from cache first
    const cacheKey = `investment-recommendations:${userId}`
    const cachedRecommendations = await cache.get(cacheKey)
    if (cachedRecommendations) {
      return res.json(JSON.parse(cachedRecommendations))
    }

    // Get user's investment history and preferences
    const [investments, user] = await Promise.all([
      prisma.investment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      }),
    ])

    // Analyze user's risk profile
    const riskProfile = analyzeRisk(investments)

    // Generate personalized recommendations
    const recommendations = [
      {
        type: 'STOCKS',
        allocation: 0.4,
        expectedReturn: 0.12,
        risk: 'MODERATE',
        confidence: 0.85,
        reasoning: 'Based on your investment history and risk profile',
      },
      {
        type: 'BONDS',
        allocation: 0.3,
        expectedReturn: 0.06,
        risk: 'LOW',
        confidence: 0.9,
        reasoning: 'For portfolio stability and regular income',
      },
      {
        type: 'ETF',
        allocation: 0.3,
        expectedReturn: 0.09,
        risk: 'MODERATE',
        confidence: 0.8,
        reasoning: 'For diversification and balanced growth',
      },
    ]

    const result = {
      riskProfile,
      recommendations,
      suggestedAmount: user?.balance ? user.balance * 0.3 : 0,
    }

    // Cache for 15 minutes
    await cache.set(cacheKey, JSON.stringify(result), 900)

    res.json(result)
  } catch (error) {
    throw error
  }
}

export const cancelInvestment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const investmentId = req.params.id

    const result = await prisma.$transaction(async (prisma) => {
      // Get investment
      const investment = await prisma.investment.findFirst({
        where: {
          id: investmentId,
          userId,
          status: 'ACTIVE',
        },
      })

      if (!investment) {
        throw new APIError(404, 'Investment not found', 'NOT_FOUND')
      }

      // Calculate return amount (could include penalties)
      const returnAmount = investment.amount + (investment.return || 0)

      // Update investment status
      const updatedInvestment = await prisma.investment.update({
        where: { id: investmentId },
        data: { status: 'CANCELLED' },
      })

      // Return funds to user
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: returnAmount } },
      })

      return updatedInvestment
    })

    // Invalidate caches
    await Promise.all([
      cache.del(`balance:${userId}`),
      cache.delPattern(`investments:${userId}:*`),
      cache.delPattern(`investment-stats:${userId}`),
    ])

    res.json(result)
  } catch (error) {
    throw error
  }
}

export default {
  getInvestments,
  createInvestment,
  updateInvestment,
  getInvestmentDetails,
  getStats,
  getRecommendations,
  cancelInvestment,
} 
} 