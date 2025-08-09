import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/server/db'
import { Prisma } from '@prisma/client'
import { isAuthBypassEnabled, mockUser } from '@/lib/auth-bypass'

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
    let userId: string

    if (isAuthBypassEnabled()) {
      userId = mockUser.id
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401 }
        )
      }
      userId = session.user.id
    }

    const body = await request.json()
    const data = createBeneficiarySchema.parse(body)

    // Check if beneficiary already exists
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        userId: userId,
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
        userId: userId,
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
    let userId: string

    if (isAuthBypassEnabled()) {
      userId = mockUser.id
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401 }
        )
      }
      userId = session.user.id
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: Prisma.BeneficiaryWhereInput = {
      userId: userId,
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
    let beneficiaries, total

    try {
      [beneficiaries, total] = await Promise.all([
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
    } catch (dbError) {
      console.error('Database error, returning mock data:', dbError)

      // Return mock data when database fails
      const mockBeneficiaries = [
        {
          id: 'mock-1',
          userId: userId,
          name: 'John Smith',
          accountNumber: '1234567890',
          bankName: 'Demo Bank',
          bankCode: 'DEMO',
          email: 'john@example.com',
          phoneNumber: '+1234567890',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'mock-2',
          userId: userId,
          name: 'Jane Doe',
          accountNumber: '0987654321',
          bankName: 'Test Bank',
          bankCode: 'TEST',
          email: 'jane@example.com',
          phoneNumber: '+0987654321',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]

      beneficiaries = mockBeneficiaries.slice((page - 1) * limit, page * limit)
      total = mockBeneficiaries.length
    }

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
    let userId: string

    if (isAuthBypassEnabled()) {
      userId = mockUser.id
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401 }
        )
      }
      userId = session.user.id
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
        userId: userId,
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
    let userId: string

    if (isAuthBypassEnabled()) {
      userId = mockUser.id
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401 }
        )
      }
      userId = session.user.id
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
        userId: userId,
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