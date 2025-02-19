import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { APIError } from '@/middleware/error-handler'
import { performance } from '@/lib/performance'
import { logger } from '@/lib/logger'
import { calculateSavingsInterest, generateSavingsRecommendations } from '@/lib/savings'

const prisma = new PrismaClient()

// Input validation schemas
const createSavingsGoalSchema = z.object({
  name: z.string().min(1).max(100),
  targetAmount: z.number().positive(),
  monthlyContribution: z.number().positive(),
  category: z.string(),
  deadline: z.string().datetime(),
  isAutoSave: z.boolean().default(true),
  autoInvest: z.boolean().default(false),
  investmentThreshold: z.number().optional(),
})

const updateSavingsGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetAmount: z.number().positive().optional(),
  monthlyContribution: z.number().positive().optional(),
  category: z.string().optional(),
  deadline: z.string().datetime().optional(),
  isAutoSave: z.boolean().optional(),
  autoInvest: z.boolean().optional(),
  investmentThreshold: z.number().optional(),
  isActive: z.boolean().optional(),
})

const contributionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['MANUAL', 'AUTO', 'INTEREST', 'BONUS']),
})

export const getSavingsGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    return await performance.measurePerformance(
      'getSavingsGoals',
      async () => {
        // Try to get from cache first
        const cacheKey = `savings-goals:${userId}`
        const cachedData = await cache.getCachedData(cacheKey)
        if (cachedData) {
          return res.json(cachedData)
        }

        // Get savings goals with contributions
        const goals = await prisma.savingsGoal.findMany({
          where: {
            userId,
            isActive: true,
          },
          include: {
            contributions: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        // Calculate progress and projections for each goal
        const enrichedGoals = goals.map(goal => {
          const totalContributions = goal.contributions.reduce(
            (sum, c) => sum + c.amount,
            0
          )
          const progress = (totalContributions / goal.targetAmount) * 100
          const remainingAmount = goal.targetAmount - totalContributions
          const monthsLeft = calculateMonthsLeft(goal.deadline)
          const requiredMonthlyContribution = monthsLeft > 0
            ? remainingAmount / monthsLeft
            : 0

          return {
            ...goal,
            currentAmount: totalContributions,
            progress,
            remainingAmount,
            monthsLeft,
            isOnTrack: goal.monthlyContribution >= requiredMonthlyContribution,
            projectedCompletion: calculateProjectedCompletion(
              totalContributions,
              goal.monthlyContribution,
              goal.targetAmount
            ),
          }
        })

        const result = {
          goals: enrichedGoals,
          summary: {
            totalSaved: enrichedGoals.reduce((sum, g) => sum + g.currentAmount, 0),
            totalTarget: enrichedGoals.reduce((sum, g) => sum + g.targetAmount, 0),
            averageProgress: enrichedGoals.length
              ? enrichedGoals.reduce((sum, g) => sum + g.progress, 0) / enrichedGoals.length
              : 0,
            goalsOnTrack: enrichedGoals.filter(g => g.isOnTrack).length,
          },
        }

        // Cache the result
        await cache.cacheData(cacheKey, result, {
          ttl: 300, // 5 minutes
          tags: ['savings', `user:${userId}`],
        })

        return res.json(result)
      },
      { userId }
    )
  } catch (error) {
    logger.error('Get savings goals error:', error)
    throw error
  }
}

export const createSavingsGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = createSavingsGoalSchema.parse(req.body)

    return await performance.measurePerformance(
      'createSavingsGoal',
      async () => {
        // Create savings goal
        const goal = await prisma.savingsGoal.create({
          data: {
            userId,
            ...data,
            currentAmount: 0,
          },
        })

        // Invalidate relevant caches
        await cache.invalidateCacheByTags(['savings', `user:${userId}`])

        return res.status(201).json(goal)
      },
      { userId }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid goal data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Create savings goal error:', error)
    throw error
  }
}

export const updateSavingsGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const goalId = req.params.id
    const data = updateSavingsGoalSchema.parse(req.body)

    return await performance.measurePerformance(
      'updateSavingsGoal',
      async () => {
        // Check if goal exists and belongs to user
        const goal = await prisma.savingsGoal.findFirst({
          where: {
            id: goalId,
            userId,
          },
        })

        if (!goal) {
          throw new APIError(404, 'Savings goal not found', 'NOT_FOUND')
        }

        // Update goal
        const updatedGoal = await prisma.savingsGoal.update({
          where: { id: goalId },
          data,
          include: {
            contributions: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        })

        // Invalidate relevant caches
        await cache.invalidateCacheByTags([
          'savings',
          `user:${userId}`,
          `savings-goal:${goalId}`,
        ])

        return res.json(updatedGoal)
      },
      { userId }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid update data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Update savings goal error:', error)
    throw error
  }
}

export const addContribution = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const goalId = req.params.id
    const data = contributionSchema.parse(req.body)

    return await performance.measurePerformance(
      'addContribution',
      async () => {
        // Start a transaction
        const result = await prisma.$transaction(async (prisma) => {
          // Check if goal exists and belongs to user
          const goal = await prisma.savingsGoal.findFirst({
            where: {
              id: goalId,
              userId,
            },
          })

          if (!goal) {
            throw new APIError(404, 'Savings goal not found', 'NOT_FOUND')
          }

          // Create contribution
          const contribution = await prisma.savingsContribution.create({
            data: {
              goalId,
              ...data,
            },
          })

          // Update goal's current amount
          await prisma.savingsGoal.update({
            where: { id: goalId },
            data: {
              currentAmount: { increment: data.amount },
            },
          })

          // Check if goal is completed
          const updatedGoal = await prisma.savingsGoal.findUnique({
            where: { id: goalId },
          })

          if (updatedGoal && updatedGoal.currentAmount >= updatedGoal.targetAmount) {
            await prisma.savingsGoal.update({
              where: { id: goalId },
              data: { isActive: false },
            })
          }

          return contribution
        })

        // Invalidate relevant caches
        await cache.invalidateCacheByTags([
          'savings',
          `user:${userId}`,
          `savings-goal:${goalId}`,
        ])

        return res.status(201).json(result)
      },
      { userId }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid contribution data', 'VALIDATION_ERROR', error.errors)
    }
    logger.error('Add contribution error:', error)
    throw error
  }
}

export const processAutoSave = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    return await performance.measurePerformance(
      'processAutoSave',
      async () => {
        // Get active goals with auto-save enabled
        const goals = await prisma.savingsGoal.findMany({
          where: {
            userId,
            isActive: true,
            isAutoSave: true,
          },
        })

        // Process auto-save for each goal
        const results = await Promise.all(
          goals.map(async (goal) => {
            try {
              // Create auto contribution
              const contribution = await prisma.savingsContribution.create({
                data: {
                  goalId: goal.id,
                  amount: goal.monthlyContribution,
                  type: 'AUTO',
                },
              })

              // Update goal's current amount
              await prisma.savingsGoal.update({
                where: { id: goal.id },
                data: {
                  currentAmount: { increment: goal.monthlyContribution },
                },
              })

              return {
                goalId: goal.id,
                status: 'success',
                contribution,
              }
            } catch (error) {
              return {
                goalId: goal.id,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            }
          })
        )

        // Invalidate relevant caches
        await cache.invalidateCacheByTags(['savings', `user:${userId}`])

        return res.json({
          processed: results.length,
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'failed').length,
          results,
        })
      },
      { userId }
    )
  } catch (error) {
    logger.error('Process auto-save error:', error)
    throw error
  }
}

export const getGoalRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    return await performance.measurePerformance(
      'getGoalRecommendations',
      async () => {
        // Get user's financial data
        const [user, transactions, goals] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true },
          }),
          prisma.transaction.findMany({
            where: {
              userId,
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          }),
          prisma.savingsGoal.findMany({
            where: { userId },
          }),
        ])

        if (!user) {
          throw new APIError(404, 'User not found', 'USER_NOT_FOUND')
        }

        // Calculate monthly metrics
        const monthlyIncome = transactions
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0)

        const monthlyExpenses = Math.abs(
          transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0)
        )

        // Generate recommendations
        const recommendations = generateSavingsRecommendations(
          monthlyIncome,
          monthlyExpenses,
          goals,
          transactions
        )

        return res.json(recommendations)
      },
      { userId }
    )
  } catch (error) {
    logger.error('Get goal recommendations error:', error)
    throw error
  }
}

// Helper functions
const calculateMonthsLeft = (deadline: string | Date): number => {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffMonths = (deadlineDate.getFullYear() - now.getFullYear()) * 12 +
    (deadlineDate.getMonth() - now.getMonth())
  return Math.max(0, diffMonths)
}

const calculateProjectedCompletion = (
  currentAmount: number,
  monthlyContribution: number,
  targetAmount: number
): Date => {
  if (monthlyContribution <= 0) return new Date()
  
  const remainingAmount = targetAmount - currentAmount
  const monthsNeeded = Math.ceil(remainingAmount / monthlyContribution)
  
  const projectedDate = new Date()
  projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded)
  return projectedDate
}

export default {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  addContribution,
  processAutoSave,
  getGoalRecommendations,
} 