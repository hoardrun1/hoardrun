import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateAccountNumber } from '@/lib/banking'

const createAccountSchema = z.object({
  type: z.enum(['SAVINGS', 'CHECKING', 'INVESTMENT']),
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
    const { type, currency } = createAccountSchema.parse(body)

    // Generate unique account number
    const accountNumber = await generateAccountNumber()

    // Create new account
    const account = await prisma.account.create({
      data: {
        userId: session.user.id,
        type,
        number: accountNumber,
        currency,
      },
      include: {
        cards: true,
      },
    })

    return new NextResponse(
      JSON.stringify({
        message: 'Account created successfully',
        account,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Account creation error:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input data', details: error.errors }),
        { status: 400 }
      )
    }
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
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
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive') === 'true'

    // Build where clause
    const where = {
      userId: session.user.id,
      ...(type && { type: type as 'SAVINGS' | 'CHECKING' | 'INVESTMENT' }),
      ...(isActive !== null && { isActive }),
    }

    // Get user's accounts
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

    return new NextResponse(
      JSON.stringify({ accounts }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Get accounts error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
} 