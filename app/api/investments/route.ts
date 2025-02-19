import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]/route'
import { z } from 'zod'

const investmentSchema = z.object({
  type: z.enum(['STOCKS', 'BONDS', 'REAL_ESTATE', 'CRYPTO', 'ETF', 'MUTUAL_FUND']),
  amount: z.number().positive(),
  risk: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']),
  description: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const investments = await prisma.investment.findMany({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(investments)
  } catch (error) {
    console.error('GET /api/investments error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = investmentSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    if (validatedData.amount > user.balance) {
      return new NextResponse('Insufficient funds', { status: 400 })
    }

    // Create investment and update user balance in a transaction
    const investment = await prisma.$transaction(async (tx) => {
      const newInvestment = await tx.investment.create({
        data: {
          userId: session.user.id,
          ...validatedData
        }
      })

      // Update user balance
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          balance: user.balance - validatedData.amount
        }
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'INVESTMENT',
          amount: validatedData.amount,
          description: `Investment in ${validatedData.type}`,
          category: 'INVESTMENT',
          status: 'COMPLETED'
        }
      })

      return newInvestment
    })

    return NextResponse.json(investment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 })
    }
    
    console.error('POST /api/investments error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { id, action } = body

    if (!id || !action) {
      return new NextResponse('Investment ID and action are required', { status: 400 })
    }

    const investment = await prisma.investment.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!investment) {
      return new NextResponse('Investment not found', { status: 404 })
    }

    let updatedInvestment

    if (action === 'COMPLETE') {
      updatedInvestment = await prisma.$transaction(async (tx) => {
        const completed = await tx.investment.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            endDate: new Date(),
          }
        })

        // Return funds to user balance with potential returns
        if (completed.return) {
          await tx.user.update({
            where: { id: session.user.id },
            data: {
              balance: {
                increment: completed.amount + completed.return
              }
            }
          })

          await tx.transaction.create({
            data: {
              userId: session.user.id,
              type: 'INVESTMENT',
              amount: completed.amount + completed.return,
              description: `Investment return from ${completed.type}`,
              category: 'INVESTMENT_RETURN',
              status: 'COMPLETED'
            }
          })
        }

        return completed
      })
    } else if (action === 'CANCEL') {
      updatedInvestment = await prisma.investment.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          endDate: new Date()
        }
      })
    }

    return NextResponse.json(updatedInvestment)
  } catch (error) {
    console.error('PATCH /api/investments error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 