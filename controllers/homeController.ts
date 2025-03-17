import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { APIError } from '@/middleware/error-handler'
import { calculatePortfolioValue } from '@/lib/investment'
import { generateAIInsights } from '@/lib/ai'
import { performance } from '@/lib/performance'
import { logger } from '@/lib/logger'

const prisma = new PrismaClient()

// Input validation schemas
const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).optional(),
})

const quickActionSchema = z.object({
  type: z.enum(['transfer', 'invest', 'save', 'pay']),
  amount: z.number().positive(),
  targetId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const dateRange = dateRangeSchema.parse(req.query)

    // Try to get from cache first
    const cacheKey = `dashboard:${userId}:${JSON.stringify(dateRange)}`
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      return res.json(JSON.parse(cachedData))
    }

    // Calculate date ranges
    const { startDate, endDate } = calculateDateRange(dateRange)

    // Get all required data in parallel with performance measurement
    const [
      user,
      transactions,
      investments,
      savingsGoals,
      cards,
      recurringTransactions
    ] = await Promise.all([
      performance.measurePerformance('fetch_user', () =>
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
            lastLogin: true,
          },
        })
      ),
      performance.measurePerformance('fetch_transactions', () =>
        prisma.transaction.findMany({
          where: {
            userId,
            createdAt: { gte: startDate, lte: endDate },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      ),
      performance.measurePerformance('fetch_investments', () =>
        prisma.investment.findMany({
          where: {
            userId,
            status: 'ACTIVE',
          },
        })
      ),
      performance.measurePerformance('fetch_savings', () =>
        prisma.savingsGoal.findMany({
          where: {
            userId,
            isActive: true,
          },
          include: {
            contributions: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        })
      ),
      performance.measurePerformance('fetch_cards', () =>
        prisma.card.findMany({
          where: {
            userId,
            isActive: true,
          },
          select: {
            id: true,
            type: true,
            number: true,
            balance: true,
            limit: true,
          },
        })
      ),
      performance.measurePerformance('fetch_recurring', () =>
        prisma.recurringTransaction.findMany({
          where: {
            userId,
            isActive: true,
          },
        })
      ),
    ])

    if (!user) {
      throw new APIError(404, 'User not found', 'USER_NOT_FOUND')
    }

    // Calculate financial metrics
    const financialSummary = await performance.measurePerformance(
      'calculate_financial_summary',
      async () => {
        const summary = summarizeTransactions(transactions)
        const upcomingTransactions = getUpcomingTransactions(recurringTransactions)
        const topCategories = getTopCategories(transactions)

        return {
          balance: user.balance,
          monthlyIncome: summary.income,
          monthlyExpenses: summary.expenses,
          savingsRate: summary.savingsRate,
          upcomingTransactions,
          topCategories,
          changePercentages: {
            balance: calculatePercentageChange(user.balance, summary.previousBalance),
            income: calculatePercentageChange(summary.income, summary.previousIncome),
            expenses: calculatePercentageChange(summary.expenses, summary.previousExpenses),
            savings: calculatePercentageChange(summary.savingsRate, summary.previousSavingsRate),
          },
        }
      }
    )

    // Calculate portfolio value and performance
    const portfolioSummary = {
      totalValue: calculatePortfolioValue(investments),
      activeInvestments: investments.length,
      performance: investments.reduce((sum, inv) => sum + (inv.return || 0), 0),
      distribution: investments.reduce((dist, inv) => {
        dist[inv.type] = (dist[inv.type] || 0) + inv.amount
        return dist
      }, {} as Record<string, number>),
    }

    // Process savings goals
    const savingsSummary = {
      totalSaved: savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0),
      totalTargets: savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0),
      activeGoals: savingsGoals.length,
      nextMilestones: savingsGoals
        .map(goal => ({
          name: goal.name,
          remaining: goal.targetAmount - goal.currentAmount,
          progress: (goal.currentAmount / goal.targetAmount) * 100,
          estimatedCompletion: goal.deadline,
        }))
        .sort((a, b) => a.remaining - b.remaining)
        .slice(0, 3),
    }

    // Generate AI insights
    const aiInsights = await generateAIInsights({
      transactions,
      investments,
      savingsGoals,
      financialSummary,
      portfolioSummary,
      savingsSummary,
    })

    // Prepare quick actions based on user behavior and goals
    const quickActions = [
      {
        type: 'save',
        title: 'Quick Save',
        amount: Math.round(financialSummary.monthlyIncome * 0.1), // 10% of monthly income
        description: 'Save 10% of your monthly income',
      },
      {
        type: 'invest',
        title: 'Invest Now',
        amount: Math.round(financialSummary.monthlyIncome * 0.2), // 20% of monthly income
        description: 'Invest in your future',
      },
      {
        type: 'transfer',
        title: 'Recent Transfer',
        amount: transactions.find(t => t.type === 'TRANSFER')?.amount || 0,
        description: 'Repeat your last transfer',
      },
    ]

    const result = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        lastLogin: user.lastLogin,
      },
      financialSummary,
      portfolioSummary,
      savingsSummary,
      recentTransactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        category: t.category,
        date: t.createdAt,
        merchant: t.merchant,
        status: t.status,
      })),
      activeCards: cards.map(c => ({
        id: c.id,
        type: c.type,
        number: `**** **** **** ${c.number.slice(-4)}`,
        balance: c.balance,
        limit: c.limit,
      })),
      aiInsights,
      quickActions,
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, JSON.stringify(result), 300)

    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Dashboard data error:', error)
    throw error
  }
}

const invalidateUserCache = async (userId: string) => {
  await Promise.all([
    cache.delPattern(`dashboard:${userId}:*`),
    cache.delPattern(`transactions:${userId}:*`),
    cache.delPattern(`accounts:${userId}:*`)
  ]);
};

export const executeQuickAction = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const action = quickActionSchema.parse(req.body)

    let result
    switch (action.type) {
      case 'transfer':
        result = await prisma.transaction.create({
          data: {
            userId,
            type: 'TRANSFER',
            amount: -action.amount,
            description: action.metadata?.description,
            beneficiaryId: action.targetId,
            status: 'COMPLETED',
          },
        })
        break

      case 'invest':
        result = await prisma.investment.create({
          data: {
            userId,
            type: action.metadata?.investmentType || 'ETF',
            amount: action.amount,
            risk: action.metadata?.risk || 'MODERATE',
            status: 'ACTIVE',
          },
        })
        break

      case 'save':
        result = await prisma.savingsContribution.create({
          data: {
            goalId: action.targetId!,
            amount: action.amount,
            type: 'MANUAL',
          },
        })
        break

      default:
        throw new APIError(400, 'Invalid action type', 'INVALID_ACTION')
    }

    // Invalidate all relevant user cache
    await invalidateUserCache(userId)

    res.json({
      message: 'Quick action executed successfully',
      result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid input data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Quick action error:', error)
    throw error
  }
}

// Helper functions
const calculateDateRange = (params: z.infer<typeof dateRangeSchema>) => {
  const now = new Date()
  let startDate = new Date()
  let endDate = now

  if (params.startDate && params.endDate) {
    startDate = new Date(params.startDate)
    endDate = new Date(params.endDate)
  } else if (params.period) {
    switch (params.period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }
  } else {
    // Default to last 30 days
    startDate.setDate(now.getDate() - 30)
  }

  return { startDate, endDate }
}

const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

const summarizeTransactions = (transactions: any[]) => {
  const summary = {
    income: 0,
    expenses: 0,
    savingsRate: 0,
    previousBalance: 0,
    previousIncome: 0,
    previousExpenses: 0,
    previousSavingsRate: 0,
  }

  transactions.forEach(t => {
    if (t.amount > 0) {
      summary.income += t.amount
    } else {
      summary.expenses += Math.abs(t.amount)
    }
  })

  summary.savingsRate = summary.income > 0 
    ? ((summary.income - summary.expenses) / summary.income) * 100 
    : 0

  return summary
}

const getUpcomingTransactions = (recurringTransactions: any[]) => {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  return recurringTransactions
    .map(rt => {
      const nextDate = calculateNextOccurrence(rt.lastExecuted, rt.frequency)
      if (nextDate <= thirtyDaysFromNow) {
        return {
          ...rt,
          nextDate,
        }
      }
      return null
    })
    .filter(Boolean)
    .sort((a, b) => a!.nextDate.getTime() - b!.nextDate.getTime())
}

const calculateNextOccurrence = (lastDate: Date, frequency: string): Date => {
  const next = new Date(lastDate)
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

const getTopCategories = (transactions: any[]) => {
  const categories = transactions.reduce((acc, t) => {
    if (!t.category) return acc
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
    return acc
  }, {} as Record<string, number>)

  return Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)) * 100,
    }))
}

export default {
  getDashboardData,
  executeQuickAction,
} 