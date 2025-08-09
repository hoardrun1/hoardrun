import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import {
  processTransaction,
  validateTransactionAmount,
  validateBeneficiary,
  getTransactionHistory,
} from '@/lib/banking'
import { TransactionType } from '@prisma/client'

const createTransactionSchema = z.object({
  accountId: z.string(),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'REFUND', 'FEE']), // Fixed to match Prisma TransactionType enum
  amount: z.number().positive(),
  description: z.string().optional(),
  beneficiaryId: z.string().optional(),
  currency: z.string().default('USD'),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      accountId,
      type,
      amount,
      description,
      beneficiaryId,
    } = createTransactionSchema.parse(body)

    // Validate transaction amount
    await validateTransactionAmount(amount)

    // Validate beneficiary if it's a transfer
    if (type === 'TRANSFER' && beneficiaryId) {
      await validateBeneficiary(session.user.id, beneficiaryId)
    }

    // Process transaction
    const result = await processTransaction(
      session.user.id,
      accountId,
      type as TransactionType,
      amount,
      description,
      beneficiaryId
    )

    return new NextResponse(
      JSON.stringify({
        message: 'Transaction processed successfully',
        transaction: result.transaction,
        newBalance: result.newBalance,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Transaction error:', error)
    
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input data', details: error.errors }),
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: 400 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const type = searchParams.get('type') as TransactionType | undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined

    if (!accountId) {
      return new NextResponse(
        JSON.stringify({ error: 'Account ID is required' }),
        { status: 400 }
      )
    }

    const result = await getTransactionHistory(
      accountId,
      session.user.id,
      page,
      limit,
      type,
      startDate,
      endDate
    )

    return new NextResponse(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Get transactions error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
} 