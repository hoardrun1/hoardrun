import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCustomSession } from '@/lib/auth-session'
import { generateAccountNumber } from '@/lib/banking'

// Define account types as a constant for better maintainability
const ACCOUNT_TYPES = ['SAVINGS', 'CHECKING', 'INVESTMENT'] as const
type AccountType = typeof ACCOUNT_TYPES[number]

const createAccountSchema = z.object({
  type: z.enum(ACCOUNT_TYPES),
  currency: z.string().min(3).max(3).default('USD'),
})

export async function POST(request: Request) {
  try {
    const session = await getCustomSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, currency } = createAccountSchema.parse(body)

    const accountNumber = await generateAccountNumber()

    const account = await prisma.account.create({
      data: {
        userId: session.user.id,
        type,
        number: accountNumber,
        currency,
        isActive: true, // Set default value
      },
      include: {
        cards: true,
      },
    })

    return NextResponse.json({
      message: 'Account created successfully',
      account,
    }, { status: 201 })

  } catch (error) {
    console.error('Account creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getCustomSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as AccountType | null
    const isActiveParam = searchParams.get('isActive')
    const isActive = isActiveParam === 'true' ? true : 
                    isActiveParam === 'false' ? false : null

    // Validate type if provided
    if (type && !ACCOUNT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      )
    }

    const where = {
      userId: session.user?.id ?? '',
      ...(type && { type }),
      ...(isActive !== null && { isActive }),
    }

    const accounts = await prisma.account.findMany({
      where,
      include: {
        cards: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ accounts })

  } catch (error) {
    console.error('Get accounts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
