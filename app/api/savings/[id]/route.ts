import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth-config'
import { z } from 'zod'

const updateSavingsGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  targetAmount: z.number().min(1, 'Target amount must be greater than 0').optional(),
  monthlyContribution: z.number().min(1, 'Monthly contribution must be greater than 0').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  deadline: z.string().datetime().optional(),
  isAutoSave: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
})

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const savingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        contributions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    })

    if (!savingsGoal) {
      return new NextResponse('Savings goal not found', { status: 404 })
    }

    return NextResponse.json(savingsGoal)
  } catch (error) {
    console.error('GET /api/savings/[id] error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateSavingsGoalSchema.parse(body)

    // Verify ownership
    const existingGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingGoal) {
      return new NextResponse('Savings goal not found', { status: 404 })
    }

    const updatedGoal = await prisma.savingsGoal.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(updatedGoal)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }

    console.error('PATCH /api/savings/[id] error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify ownership
    const existingGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingGoal) {
      return new NextResponse('Savings goal not found', { status: 404 })
    }

    // If there are contributions, we need to handle them in a transaction
    if (existingGoal.currentAmount > 0) {
      const result = await prisma.$transaction(async (tx) => {
        // Get user's account
        const account = await tx.account.findFirst({
          where: {
            userId: session.user.id,
            isActive: true,
          },
        })

        if (!account) {
          throw new Error('Account not found')
        }

        // Return funds to account
        await tx.account.update({
          where: { id: account.id },
          data: {
            balance: account.balance + existingGoal.currentAmount,
          },
        })

        // Create transaction record for the refund
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            type: 'REFUND',
            amount: existingGoal.currentAmount,
            description: `Refund from deleted savings goal: ${existingGoal.name}`,
            category: 'SAVINGS',
            status: 'COMPLETED',
          },
        })

        // Delete the goal (this will cascade delete contributions)
        return await tx.savingsGoal.delete({
          where: { id: params.id },
        })
      })

      return NextResponse.json(result)
    } else {
      // If no contributions, simply delete the goal
      const deletedGoal = await prisma.savingsGoal.delete({
        where: { id: params.id },
      })

      return NextResponse.json(deletedGoal)
    }
  } catch (error) {
    console.error('DELETE /api/savings/[id] error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 