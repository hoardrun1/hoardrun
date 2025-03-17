import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { InvestmentStatus, InvestmentType, Prisma, Transaction } from '@prisma/client'

// Define report types as a union type for better type safety
type ReportType = 'transactions' | 'spending' | 'income' | 'investment' | 'tax'

// Validation schema for query parameters
const reportQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  category: z.string().optional(),
  report: z.enum(['transactions', 'spending', 'income', 'investment', 'tax'])
})

type ReportQueryParams = z.infer<typeof reportQuerySchema>

interface PerformancePoint {
  period: string
  value: number
  change: number
}

interface InvestmentWithPerformance {
  id: string
  type: InvestmentType
  amount: number
  returns: number | null
  status: InvestmentStatus
  createdAt: Date
  performance: {
    history: PerformancePoint[]
    metrics: {
      totalReturn: number
      currentValue: number
      initialValue: number
      annualizedReturn: number
    }
  }
}

interface InvestmentWithTransactions extends Prisma.InvestmentGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
      }
    },
    Transaction: true;
  }
}> {}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = reportQuerySchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      type: searchParams.get('type'),
      category: searchParams.get('category'),
      report: searchParams.get('report')
    })

    const reportHandlers: Record<ReportType, (userId: string, params: ReportQueryParams) => Promise<any>> = {
      transactions: getTransactionReport,
      spending: getSpendingAnalysis,
      income: getIncomeAnalysis,
      investment: getInvestmentReport,
      tax: getTaxReport
    }

    const handler = reportHandlers[queryParams.report as ReportType]
    if (!handler) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    const reportData = await handler(session.user.id, queryParams)
    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Report generation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function getTransactionReport(userId: string, params: ReportQueryParams) {
  return await prisma.transaction.findMany({
    where: {
      userId,
      createdAt: {
        gte: params.startDate ? new Date(params.startDate) : undefined,
        lte: params.endDate ? new Date(params.endDate) : undefined
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

async function getSpendingAnalysis(userId: string, params: ReportQueryParams) {
  return await prisma.transaction.groupBy({
    by: ['type', 'status'],
    where: {
      userId,
      type: {
        in: ['WITHDRAWAL', 'PAYMENT']
      },
      createdAt: {
        gte: params.startDate ? new Date(params.startDate) : undefined,
        lte: params.endDate ? new Date(params.endDate) : undefined
      }
    },
    _sum: { amount: true }
  })
}

async function getIncomeAnalysis(userId: string, params: ReportQueryParams) {
  return await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      userId,
      type: 'DEPOSIT',
      createdAt: {
        gte: params.startDate ? new Date(params.startDate) : undefined,
        lte: params.endDate ? new Date(params.endDate) : undefined
      }
    },
    _sum: { amount: true }
  })
}

async function getInvestmentReport(userId: string, params: ReportQueryParams): Promise<InvestmentWithPerformance[]> {
  const investments = await prisma.investment.findMany({
    where: {
      userId,
      createdAt: {
        gte: params.startDate ? new Date(params.startDate) : undefined,
        lte: params.endDate ? new Date(params.endDate) : undefined
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      transactions: {
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          createdAt: true
        }
      }
    }
  });

  return investments.map((investment) => {
    const performanceHistory = calculatePerformanceHistory(investment);
    const { metrics } = calculateMetrics(investment, performanceHistory);
    
    // Create a clean investment object without the transactions
    const { Transaction: transactions, user, ...baseInvestment } = investment as InvestmentWithTransactions;
    
    return {
      ...baseInvestment,
      performance: {
        history: performanceHistory,
        metrics
      }
    };
  });
}

function calculatePerformanceHistory(investment: any): PerformancePoint[] {
  if (!investment.Transaction || investment.Transaction.length === 0) {
    return [];
  }

  return investment.Transaction.reduce((
    acc: PerformancePoint[],
    transaction: Transaction,
    index: number
  ): PerformancePoint[] => {
    const previousValue = index > 0 ? acc[index - 1].value : investment.amount;
    const date = transaction.createdAt.toISOString().split('T')[0];
    
    const value = transaction.type === 'WITHDRAWAL' 
      ? previousValue - transaction.amount
      : previousValue + transaction.amount;

    acc.push({
      period: date,
      value,
      change: ((value - previousValue) / previousValue) * 100
    });
    
    return acc;
  }, [] as PerformancePoint[]);
}

function calculateMetrics(
  investment: any, 
  performanceHistory: PerformancePoint[]
) {
  const initialValue = investment.amount;
  const currentValue = performanceHistory.length > 0 
    ? performanceHistory[performanceHistory.length - 1].value 
    : investment.amount + (investment.returns ?? 0);
  
  const totalReturn = ((currentValue - initialValue) / initialValue) * 100;
  const annualizedReturn = calculateAnnualizedReturn(initialValue, currentValue, investment.createdAt);

  return {
    metrics: {
      totalReturn,
      currentValue,
      initialValue,
      annualizedReturn
    }
  };
}

function calculateAnnualizedReturn(initial: number, current: number, startDate: Date): number {
  const years = (new Date().getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
  return years > 0 ? (Math.pow(current / initial, 1 / years) - 1) * 100 : 0
}

async function getTaxReport(userId: string, params: ReportQueryParams) {
  return await prisma.transaction.groupBy({
    by: ['type', 'status'],
    where: {
      userId,
      createdAt: {
        gte: params.startDate ? new Date(params.startDate) : undefined,
        lte: params.endDate ? new Date(params.endDate) : undefined
      }
    },
    _sum: { amount: true }
  })
}
