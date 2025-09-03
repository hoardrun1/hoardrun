import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getCustomSession } from '@/lib/auth-session'

const contributionSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  type: z.enum(['MANUAL', 'AUTO', 'BONUS']).default('MANUAL'),
  description: z.string().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCustomSession()

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = contributionSchema.parse(body)

    // Verify goal ownership and existence
    const savingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!savingsGoal) {
      return new NextResponse('Savings goal not found', { status: 404 })
    }

    // Get user's account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    })

    if (!account) {
      return new NextResponse('Account not found', { status: 404 })
    }

    if (account.balance < validatedData.amount) {
      return new NextResponse('Insufficient funds', { status: 400 })
    }

    // Process contribution in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create contribution record
      const contribution = await tx.savingsContribution.create({
        data: {
          goalId: params.id,
          amount: validatedData.amount,
          type: validatedData.type,
          description: validatedData.description,
        },
      })

      // Update goal's current amount and check if completed
      const newAmount = savingsGoal.currentAmount + validatedData.amount
      const isCompleted = newAmount >= savingsGoal.targetAmount

      const updatedGoal = await tx.savingsGoal.update({
        where: { id: params.id },
        data: {
          currentAmount: newAmount,
          status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        },
      })

      // Update account balance
      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: {
          balance: account.balance - validatedData.amount,
        },
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'TRANSFER',
          amount: validatedData.amount,
          description: `Contribution to savings goal: ${savingsGoal.name}`,
          category: 'SAVINGS',
          status: 'COMPLETED',
        },
      })

      return {
        contribution,
        goal: updatedGoal,
        account: updatedAccount,
        transaction,
      }
    })

    return NextResponse.json(result.goal)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }

    console.error('POST /api/savings/[id]/contribute error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 