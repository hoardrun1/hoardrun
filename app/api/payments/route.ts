import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/server/db'
// import { AppError, ErrorCode } from '@/lib/error-handling'

// Payment validation schema
const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  methodId: z.string(),
  description: z.string().optional()
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    // Process payment logic here
    const payment = await prisma.transaction.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        type: 'PAYMENT',
        status: 'PENDING'
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Return mock payment methods since model doesn't exist
    const paymentMethods = [
      { id: '1', type: 'CARD', name: 'Default Card' },
      { id: '2', type: 'BANK', name: 'Default Bank Account' }
    ]

    return NextResponse.json(paymentMethods)
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}
