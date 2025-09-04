import { NextResponse } from 'next/server'

// Mock AI insights data
const mockAIInsights = {
  summary: {
    overallScore: 8.2,
    financialHealth: 'Good',
    riskLevel: 'Low',
    recommendation: 'Continue current savings strategy with minor adjustments'
  },
  insights: [
    {
      id: '1',
      type: 'spending',
      priority: 'high',
      title: 'Entertainment Overspending Alert',
      description: 'You\'ve exceeded your entertainment budget by 40% this month. Consider reducing dining out or subscription services.',
      impact: 'negative',
      actionable: true,
      suggestedAction: 'Set a weekly entertainment limit of $75',
      potentialSavings: 120,
      category: 'Entertainment'
    },
    {
      id: '2',
      type: 'savings',
      priority: 'medium',
      title: 'Great Transportation Savings',
      description: 'You\'re 24% under budget on transportation this month. This could be redirected to your emergency fund.',
      impact: 'positive',
      actionable: true,
      suggestedAction: 'Transfer $120 to emergency fund',
      potentialSavings: 120,
      category: 'Transportation'
    },
    {
      id: '3',
      type: 'investment',
      priority: 'medium',
      title: 'Investment Opportunity',
      description: 'Based on your current savings rate, you could increase your retirement contributions by $200/month.',
      impact: 'positive',
      actionable: true,
      suggestedAction: 'Increase 401k contribution by 2%',
      potentialSavings: 2400,
      category: 'Retirement'
    },
    {
      id: '4',
      type: 'goal',
      priority: 'low',
      title: 'Emergency Fund Progress',
      description: 'You\'re on track to reach your emergency fund goal in 8 months at the current savings rate.',
      impact: 'positive',
      actionable: false,
      suggestedAction: null,
      potentialSavings: 0,
      category: 'Emergency Fund'
    },
    {
      id: '5',
      type: 'trend',
      priority: 'medium',
      title: 'Seasonal Spending Pattern',
      description: 'Your spending typically increases by 15% during holiday months. Plan ahead for November-December.',
      impact: 'neutral',
      actionable: true,
      suggestedAction: 'Set aside $300 for holiday expenses',
      potentialSavings: 0,
      category: 'Planning'
    }
  ],
  recommendations: [
    {
      id: '1',
      title: 'Optimize Budget Allocation',
      description: 'Reallocate $100 from transportation to entertainment to better match your spending patterns.',
      priority: 'high',
      estimatedImpact: 'Reduce budget variance by 25%',
      timeToImplement: '5 minutes',
      difficulty: 'Easy'
    },
    {
      id: '2',
      title: 'Automate Savings',
      description: 'Set up automatic transfers to your emergency fund on payday to maintain consistent savings.',
      priority: 'medium',
      estimatedImpact: 'Increase savings consistency by 40%',
      timeToImplement: '15 minutes',
      difficulty: 'Easy'
    },
    {
      id: '3',
      title: 'Review Subscriptions',
      description: 'Cancel unused subscriptions to free up $45/month for your vacation fund.',
      priority: 'medium',
      estimatedImpact: 'Save $540 annually',
      timeToImplement: '30 minutes',
      difficulty: 'Medium'
    }
  ],
  trends: {
    spendingTrend: 'stable',
    savingsGrowth: 'increasing',
    budgetAdherence: 'improving',
    goalProgress: 'on-track'
  },
  alerts: [
    {
      id: '1',
      type: 'warning',
      message: 'Entertainment spending is 40% over budget',
      severity: 'medium',
      actionRequired: true
    },
    {
      id: '2',
      type: 'success',
      message: 'Emergency fund goal 62% complete',
      severity: 'low',
      actionRequired: false
    }
  ],
  personalizedTips: [
    'Based on your spending patterns, Tuesday is your lowest spending day. Consider scheduling major purchases then.',
    'Your grocery spending is most efficient when you shop once per week rather than multiple small trips.',
    'You tend to overspend on weekends. Setting a weekend budget could help control expenses.'
  ]
}

export async function GET() {
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Return the insights array directly to match frontend expectations
    return NextResponse.json(mockAIInsights.insights)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI insights' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { timeframe, categories, includeRecommendations } = body
    
    // Mock generating custom insights based on parameters
    const customInsights = {
      ...mockAIInsights,
      timeframe: timeframe || 'current_month',
      filteredCategories: categories || [],
      includeRecommendations: includeRecommendations !== false,
      customGenerated: true,
      generatedAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      data: customInsights
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate custom AI insights' },
      { status: 500 }
    )
  }
}
