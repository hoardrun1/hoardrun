import { NextResponse } from 'next/server'

// Mock financial metrics data
const mockFinancialMetrics = {
  totalBalance: 45750.25,
  monthlyIncome: 8500.00,
  monthlyExpenses: 4320.75,
  savingsRate: 49.2,
  netWorth: 125000.00,
  creditScore: 785,
  debtToIncomeRatio: 0.15,
  emergencyFundMonths: 6.2,
  investmentGrowth: {
    monthly: 3.2,
    yearly: 12.8,
    allTime: 24.5
  },
  budgetUtilization: 78.5,
  categories: {
    housing: { budgeted: 2000, spent: 1850, percentage: 92.5 },
    food: { budgeted: 800, spent: 720, percentage: 90 },
    transportation: { budgeted: 500, spent: 380, percentage: 76 },
    entertainment: { budgeted: 300, spent: 420, percentage: 140 },
    healthcare: { budgeted: 200, spent: 150, percentage: 75 },
    shopping: { budgeted: 400, spent: 350, percentage: 87.5 }
  },
  monthlyTrend: [
    { month: 'Jan', income: 8200, expenses: 4100, savings: 4100 },
    { month: 'Feb', income: 8300, expenses: 4250, savings: 4050 },
    { month: 'Mar', income: 8400, expenses: 4180, savings: 4220 },
    { month: 'Apr', income: 8500, expenses: 4320, savings: 4180 },
    { month: 'May', income: 8600, expenses: 4280, savings: 4320 },
    { month: 'Jun', income: 8500, expenses: 4150, savings: 4350 }
  ],
  goals: {
    emergencyFund: {
      target: 25000,
      current: 15500,
      percentage: 62
    },
    retirement: {
      target: 1000000,
      current: 85000,
      percentage: 8.5
    },
    vacation: {
      target: 5000,
      current: 2800,
      percentage: 56
    }
  },
  recentTransactions: [
    {
      id: '1',
      description: 'Grocery Store',
      amount: -125.50,
      category: 'Food & Dining',
      date: '2024-01-15',
      type: 'expense'
    },
    {
      id: '2',
      description: 'Salary Deposit',
      amount: 4250.00,
      category: 'Income',
      date: '2024-01-15',
      type: 'income'
    },
    {
      id: '3',
      description: 'Gas Station',
      amount: -45.20,
      category: 'Transportation',
      date: '2024-01-14',
      type: 'expense'
    }
  ]
}

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150))
    
    return NextResponse.json({
      success: true,
      data: mockFinancialMetrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch financial metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Mock updating financial metrics
    const updatedMetrics = {
      ...mockFinancialMetrics,
      ...body,
      lastUpdated: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      data: updatedMetrics
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update financial metrics' },
      { status: 500 }
    )
  }
}
