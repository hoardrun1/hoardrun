import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { z } from 'zod'

// Import prisma only on the server side
let prisma;
if (typeof window === 'undefined') {
  const { prisma: prismaClient } = require('@/lib/prisma');
  prisma = prismaClient;
}

const savingsGoalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  targetAmount: z.number().min(1, 'Target amount must be greater than 0'),
  monthlyContribution: z.number().min(1, 'Monthly contribution must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  deadline: z.string().datetime(),
  isAutoSave: z.boolean().default(true),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(savingsGoals)
  } catch (error) {
    console.error('GET /api/savings error:', error)
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
    const validatedData = savingsGoalSchema.parse(body)

    const savingsGoal = await prisma.savingsGoal.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    })

    return NextResponse.json(savingsGoal)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }

    console.error('POST /api/savings error:', error)
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
    const { id, ...updateData } = body

    if (!id) {
      return new NextResponse('Missing goal ID', { status: 400 })
    }

    // Verify ownership
    const existingGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingGoal) {
      return new NextResponse('Savings goal not found', { status: 404 })
    }

    const updatedGoal = await prisma.savingsGoal.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedGoal)
  } catch (error) {
    console.error('PATCH /api/savings error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}