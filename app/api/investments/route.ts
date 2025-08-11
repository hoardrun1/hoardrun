import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getTypedSession } from '@/lib/auth'

const investmentSchema = z.object({
  type: z.enum(['STOCK', 'BOND', 'REAL_ESTATE', 'CRYPTO']), // Fixed to match Prisma schema
  amount: z.number().positive(),
  risk: z.enum(['LOW', 'MEDIUM', 'HIGH']), // Fixed to match Prisma RiskLevel enum
  description: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getTypedSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    console.error('GET /api/investments error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getTypedSession()

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = investmentSchema.parse(body)

    const account = await prisma.account.findFirst({
      where: { 
        userId: session.user.id,
        isActive: true,
        type: 'INVESTMENT'
      }
    });

    if (!account || validatedData.amount > account.balance) {
      return new NextResponse('Insufficient funds', { status: 400 })
    }

    // Create investment and update user balance in a transaction
    const investment = await prisma.$transaction(async (tx: any) => {
      const newInvestment = await tx.investment.create({
        data: {
          userId: session.user.id,
          ...validatedData
        }
      })

      // Update user balance
      await tx.account.update({
        where: { id: account.id },
        data: {
          balance: {
            decrement: validatedData.amount
          }
        }
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          accountId: account.id,  // Add the account ID
          type: 'WITHDRAWAL', // Using WITHDRAWAL since money is being withdrawn for investment
          amount: validatedData.amount,
          description: `Investment in ${validatedData.type}`,
          status: 'COMPLETED',
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
    const session = await getTypedSession()

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
      updatedInvestment = await prisma.$transaction(async (tx: any) => {
        const completed = await tx.investment.update({
          where: { id },
          data: {
            status: 'CLOSED', // Fixed: COMPLETED doesn't exist, using CLOSED instead
            endDate: new Date(),
          }
        })

        // Return funds to user balance with potential returns
        if (completed.return) { // Fixed: property is 'return' not 'returns'
          const account = await tx.account.findFirst({
            where: {
              userId: session.user.id,
              type: 'INVESTMENT',
              isActive: true
            }
          });

          if (!account) {
            throw new Error('Investment account not found');
          }

          await tx.user.update({
            where: { id: session.user.id },
            data: {
              accounts: {
                update: {
                  where: { id: account.id },
                  data: {
                    balance: {
                      increment: completed.amount + (completed.return || 0) // Fixed: property is 'return' not 'returns'
                    }
                  }
                }
              }
            }
          });

          await tx.transaction.create({
            data: {
              userId: session.user.id,
              accountId: account.id,
              type: 'DEPOSIT', // Using DEPOSIT since money is being returned to account
              amount: completed.amount + (completed.return || 0), // Fixed: property is 'return' not 'returns'
              description: `Investment return from ${completed.type}`,
              status: 'COMPLETED',
            }
          })
        }

        return completed
      })
    } else if (action === 'CANCEL') {
      updatedInvestment = await prisma.investment.update({
        where: { id },
        data: {
          status: 'CLOSED',
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