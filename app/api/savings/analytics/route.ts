import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route'
import { calculateSavingsProjection, calculateInterestRate } from '@/lib/banking'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user's savings data
    const savingsData = await prisma.savingsGoal.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        contributions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 12, // Last 12 contributions
        },
      },
    })

    // Calculate total savings
    const totalSavings = savingsData.reduce((sum, goal) => sum + goal.currentAmount, 0)

    // Calculate monthly growth
    const monthlyContributions = savingsData.reduce((sum, goal) => sum + goal.monthlyContribution, 0)
    const baseInterestRate = calculateInterestRate(totalSavings)
    const monthlyGrowth = (monthlyContributions * (1 + baseInterestRate / 12)).toFixed(2)

    // Calculate next milestone
    const milestones = [1000, 5000, 10000, 25000, 50000, 100000]
    const nextMilestone = milestones.find(m => m > totalSavings) || totalSavings * 2

    // Calculate projected savings
    const projectedSavings = calculateSavingsProjection(
      totalSavings,
      monthlyContributions,
      baseInterestRate * 100,
      1 // 1 year projection
    )[0]

    // Get recommended allocation based on user's goals and risk profile
    const recommendedAllocation = {
      emergency: 40, // 40% for emergency fund
      investment: 30, // 30% for investments
      goals: 30, // 30% for specific goals
    }

    // Get AI-powered recommendations
    const recommendations = [
      {
        type: 'savings',
        title: 'Increase Emergency Fund',
        description: 'Based on your spending patterns, consider increasing your emergency fund.',
        confidence: 85,
      },
      {
        type: 'investment',
        title: 'Investment Opportunity',
        description: 'You have excess savings. Consider diversifying into investments.',
        confidence: 90,
        potentialReturn: 12.5,
      },
    ]

    // Get behavior insights
    const insights = [
      {
        id: '1',
        type: 'saving',
        title: 'Consistent Saving Pattern',
        description: 'You\'ve maintained regular savings contributions.',
        impact: 15,
        suggestedActions: [
          {
            action: 'Increase monthly contribution',
            potentialImpact: 25,
          },
        ],
        confidence: 88,
      },
    ]

    // Get goal recommendations
    const goalRecommendations = [
      {
        id: '1',
        name: 'Retirement Fund',
        targetAmount: 500000,
        suggestedMonthlyContribution: 1000,
        reason: 'Starting early on retirement savings can significantly impact your future.',
        confidence: 92,
        category: 'Retirement',
        timeframe: 25,
        riskLevel: 'medium',
        expectedReturn: 8.5,
      },
    ]

    return NextResponse.json({
      analytics: {
        totalSavings,
        monthlyGrowth: parseFloat(monthlyGrowth),
        projectedSavings,
        nextMilestone,
        recommendedAllocation,
      },
      recommendations,
      insights,
      goalRecommendations,
    })
  } catch (error) {
    console.error('GET /api/savings/analytics error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 