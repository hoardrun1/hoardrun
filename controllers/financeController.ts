import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { APIError } from '@/middleware/error-handler'
import { performance } from '@/lib/performance'
import { logger } from '@/lib/logger'
import { generateAIInsights } from '@/lib/ai'

const prisma = new PrismaClient()

// Input validation schemas
const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).optional(),
})

const categorySchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().optional(),
  color: z.string().optional(),
  budget: z.number().positive().optional(),
})

const budgetSchema = z.object({
  categoryId: z.string(),
  amount: z.number().positive(),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  rollover: z.boolean().default(false),
})

export const getFinancialOverview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const params = dateRangeSchema.parse(req.query)

    return await performance.measurePerformance(
      'getFinancialOverview',
      async () => {
        // Calculate date range
        const { startDate, endDate } = calculateDateRange(params)

        // Try to get from cache first
        const cacheKey = `finance-overview:${userId}:${startDate.toISOString()}:${endDate.toISOString()}`
        const cachedData = await cache.getCachedData(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        // Get all required data in parallel
        const [
          transactions,
          recurringTransactions,
          budgets,
          savingsGoals,
          investments
        ] = await Promise.all([
          prisma.transaction.findMany({
            where: {
              userId,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              category: true,
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.recurringTransaction.findMany({
            where: {
              userId,
              isActive: true,
            },
          }),
          prisma.budget.findMany({
            where: {
              userId,
              startDate: { lte: endDate },
              OR: [
                { endDate: null },
                { endDate: { gte: startDate } },
              ],
            },
            include: {
              category: true,
            },
          }),
          prisma.savingsGoal.findMany({
            where: {
              userId,
              isActive: true,
            },
          }),
          prisma.investment.findMany({
            where: {
              userId,
              status: 'ACTIVE',
            },
          }),
        ])

        // Summarize transactions
        const summary = summarizeTransactions(transactions)

        // Get upcoming transactions
        const upcoming = getUpcomingTransactions(recurringTransactions)

        // Calculate budget progress
        const budgetProgress = budgets.map(budget => {
          const spent = transactions
            .filter(t => t.categoryId === budget.categoryId)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)

          return {
            ...budget,
            spent,
            remaining: budget.amount - spent,
            progress: (spent / budget.amount) * 100,
          }
        })

        // Get top spending categories
        const topCategories = getTopCategories(transactions)

        // Generate AI insights
        const insights = await generateAIInsights({
          transactions,
          budgets: budgetProgress,
          savingsGoals,
          investments,
          summary,
        })

        const result = {
          summary,
          budgets: budgetProgress,
          topCategories,
          upcoming,
          insights,
          recentTransactions: transactions.slice(0, 10),
        }

        // Cache the result
        await cache.cacheData(cacheKey, result, {
          ttl: 300, // 5 minutes
          tags: ['finance', `user:${userId}`],
        })

        return res.json(result)
      },
      { userId }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid parameters', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Get financial overview error:', error)
    throw error
  }
}

export const getCategoryAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const params = dateRangeSchema.parse(req.query)

    return await performance.measurePerformance(
      'getCategoryAnalytics',
      async () => {
        const { startDate, endDate } = calculateDateRange(params)

        // Try to get from cache first
        const cacheKey = `category-analytics:${userId}:${startDate.toISOString()}:${endDate.toISOString()}`
        const cachedData = await cache.getCachedData(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        // Get transactions with categories
        const transactions = await prisma.transaction.findMany({
          where: {
            userId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            category: true,
          },
        })

        // Group transactions by category
        const categoryGroups = transactions.reduce((groups, transaction) => {
          const categoryId = transaction.categoryId
          if (!groups[categoryId]) {
            groups[categoryId] = {
              category: transaction.category,
              total: 0,
              count: 0,
              transactions: [],
            }
          }
          groups[categoryId].total += Math.abs(transaction.amount)
          groups[categoryId].count++
          groups[categoryId].transactions.push(transaction)
          return groups
        }, {} as Record<string, any>)

        // Calculate analytics for each category
        const totalSpent = Object.values(categoryGroups).reduce(
          (sum: number, group: any) => sum + group.total,
          0
        )

        const analytics = Object.values(categoryGroups).map((group: any) => ({
          category: group.category,
          total: group.total,
          percentage: (group.total / totalSpent) * 100,
          transactionCount: group.count,
          averageAmount: group.total / group.count,
          trend: calculateCategoryTrend(group.transactions, startDate, endDate),
        }))

        const result = {
          categories: analytics,
          summary: {
            totalSpent,
            categoryCount: analytics.length,
            topCategory: analytics.sort((a: any, b: any) => b.total - a.total)[0],
          },
        }

        // Cache the result
        await cache.cacheData(cacheKey, result, {
          ttl: 300, // 5 minutes
          tags: ['finance', `user:${userId}`, 'categories'],
        })

        return res.json(result)
      },
      { userId }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid parameters', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Get category analytics error:', error)
    throw error
  }
}

export const manageCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = categorySchema.parse(req.body)

    return await performance.measurePerformance(
      'manageCategories',
      async () => {
        // Create or update category
        const category = await prisma.category.upsert({
          where: {
            userId_name: {
              userId,
              name: data.name,
            },
          },
          update: {
            type: data.type,
            icon: data.icon,
            color: data.color,
            budget: data.budget,
          },
          create: {
            userId,
            ...data,
          },
        })

        // Invalidate relevant caches
        await cache.invalidateCacheByTags(['finance', `user:${userId}`, 'categories'])

        return res.json(category)
      },
      { userId }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid category data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Manage categories error:', error)
    throw error
  }
}

export const getBudgetAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const params = dateRangeSchema.parse(req.query)

    return await performance.measurePerformance(
      'getBudgetAnalytics',
      async () => {
        const { startDate, endDate } = calculateDateRange(params)

        // Try to get from cache first
        const cacheKey = `budget-analytics:${userId}:${startDate.toISOString()}:${endDate.toISOString()}`
        const cachedData = await cache.getCachedData(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        // Get budgets and transactions
        const [budgets, transactions] = await Promise.all([
          prisma.budget.findMany({
            where: {
              userId,
              startDate: { lte: endDate },
              OR: [
                { endDate: null },
                { endDate: { gte: startDate } },
              ],
            },
            include: {
              category: true,
            },
          }),
          prisma.transaction.findMany({
            where: {
              userId,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
        ])

        // Calculate budget analytics
        const analytics = budgets.map(budget => {
          const spent = transactions
            .filter(t => t.categoryId === budget.categoryId)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)

          const remaining = budget.amount - spent
          const progress = (spent / budget.amount) * 100
          const status = progress > 100 ? 'exceeded' : progress > 80 ? 'warning' : 'ok'

          return {
            ...budget,
            spent,
            remaining,
            progress,
            status,
            projectedOverspend: calculateProjectedOverspend(
              spent,
              budget.amount,
              startDate,
              endDate
            ),
          }
        })

        const result = {
          budgets: analytics,
          summary: {
            totalBudgeted: budgets.reduce((sum, b) => sum + b.amount, 0),
            totalSpent: analytics.reduce((sum, b) => sum + b.spent, 0),
            overBudgetCount: analytics.filter(b => b.progress > 100).length,
            atRiskCount: analytics.filter(b => b.progress > 80 && b.progress <= 100).length,
          },
        }

        // Cache the result
        await cache.cacheData(cacheKey, result, {
          ttl: 300, // 5 minutes
          tags: ['finance', `user:${userId}`, 'budgets'],
        })

        return res.json(result)
      },
      { userId }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid parameters', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Get budget analytics error:', error)
    throw error
  }
}

// Helper functions
const calculateDateRange = (params: z.infer<typeof dateRangeSchema>) => {
  const endDate = new Date()
  let startDate = new Date()

  if (params.startDate && params.endDate) {
    return {
      startDate: new Date(params.startDate),
      endDate: new Date(params.endDate),
    }
  }

  switch (params.period) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1)
      break
    case 'week':
      startDate.setDate(startDate.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
    default:
      // Default to last 30 days
      startDate.setDate(startDate.getDate() - 30)
  }

  return { startDate, endDate }
}

const summarizeTransactions = (transactions: any[]) => {
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  )

  return {
    income,
    expenses,
    balance: income - expenses,
    transactionCount: transactions.length,
    averageTransaction: transactions.length
      ? Math.abs(transactions.reduce((sum, t) => sum + t.amount, 0)) / transactions.length
      : 0,
  }
}

const getUpcomingTransactions = (recurringTransactions: any[]) => {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  return recurringTransactions
    .map(rt => {
      const nextDate = calculateNextOccurrence(new Date(rt.lastProcessed), rt.frequency)
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
  const categoryTotals = transactions.reduce((totals, t) => {
    const categoryId = t.categoryId
    if (!totals[categoryId]) {
      totals[categoryId] = {
        category: t.category,
        total: 0,
        count: 0,
      }
    }
    totals[categoryId].total += Math.abs(t.amount)
    totals[categoryId].count++
    return totals
  }, {})

  return Object.values(categoryTotals)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 5)
}

const calculateCategoryTrend = (
  transactions: any[],
  startDate: Date,
  endDate: Date
): number => {
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const midPoint = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2)

  const firstHalf = transactions
    .filter(t => new Date(t.createdAt) < midPoint)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const secondHalf = transactions
    .filter(t => new Date(t.createdAt) >= midPoint)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return ((secondHalf - firstHalf) / firstHalf) * 100
}

const calculateProjectedOverspend = (
  spent: number,
  budget: number,
  startDate: Date,
  endDate: Date
): number => {
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (elapsedDays === 0) return 0

  const dailyRate = spent / elapsedDays
  const projectedTotal = dailyRate * totalDays

  return Math.max(0, projectedTotal - budget)
}

export default {
  getFinancialOverview,
  getCategoryAnalytics,
  manageCategories,
  getBudgetAnalytics,
} 