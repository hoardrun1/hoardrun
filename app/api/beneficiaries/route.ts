import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const createBeneficiarySchema = z.object({
  name: z.string().min(2),
  accountNumber: z.string().min(10),
  bankName: z.string().min(2),
  bankCode: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
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
    const data = createBeneficiarySchema.parse(body)

    // Check if beneficiary already exists
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        userId: session.user.id,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
      },
    })

    if (existingBeneficiary) {
      return new NextResponse(
        JSON.stringify({ error: 'Beneficiary already exists' }),
        { status: 409 }
      )
    }

    // Create new beneficiary
    const beneficiary = await prisma.beneficiary.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return new NextResponse(
      JSON.stringify({
        message: 'Beneficiary added successfully',
        beneficiary,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Add beneficiary error:', error)
    
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
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: Prisma.BeneficiaryWhereInput = {
      userId: session.user.id,
      ...(isActive !== null && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { accountNumber: { contains: search } },
          { bankName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    // Get beneficiaries with pagination
    const [beneficiaries, total] = await Promise.all([
      prisma.beneficiary.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.beneficiary.count({ where }),
    ])

    return new NextResponse(
      JSON.stringify({
        beneficiaries,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Get beneficiaries error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const data = createBeneficiarySchema.partial().parse(body)

    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Beneficiary ID is required' }),
        { status: 400 }
      )
    }

    // Check if beneficiary exists and belongs to user
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: id as string,
        userId: session.user.id,
      },
    })

    if (!existingBeneficiary) {
      return new NextResponse(
        JSON.stringify({ error: 'Beneficiary not found' }),
        { status: 404 }
      )
    }

    // Update beneficiary
    const beneficiary = await prisma.beneficiary.update({
      where: { id: id as string },
      data,
    })

    return new NextResponse(
      JSON.stringify({
        message: 'Beneficiary updated successfully',
        beneficiary,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Update beneficiary error:', error)
    
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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Beneficiary ID is required' }),
        { status: 400 }
      )
    }

    // Check if beneficiary exists and belongs to user
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingBeneficiary) {
      return new NextResponse(
        JSON.stringify({ error: 'Beneficiary not found' }),
        { status: 404 }
      )
    }

    // Soft delete by marking as inactive
    await prisma.beneficiary.update({
      where: { id },
      data: { isActive: false },
    })

    return new NextResponse(
      JSON.stringify({
        message: 'Beneficiary deleted successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Delete beneficiary error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
} 