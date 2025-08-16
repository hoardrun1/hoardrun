import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { logger } from '@/lib/logger'

const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
})

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function GET() {
  return NextResponse.json({
    message: 'Firebase Mock Test API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /signup': 'Test signup without Firebase',
      'POST /signin': 'Test signin without Firebase',
      'POST /test-db': 'Test database connection'
    }
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'signup':
        return await handleMockSignup(data)
      case 'signin':
        return await handleMockSignin(data)
      case 'test-db':
        return await testDatabaseConnection()
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: signup, signin, or test-db' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    logger.error('Firebase mock test error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Test failed',
        code: error.code || 'TEST_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}

async function handleMockSignup(data: any) {
  const validation = signUpSchema.safeParse(data)
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        error: 'Invalid input data',
        details: validation.error.errors 
      },
      { status: 400 }
    )
  }

  const { email, password, name } = validation.data

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || email.split('@')[0],
        emailVerified: false
      }
    })

    // Mock custom token (in real implementation, this would be from Firebase)
    const mockCustomToken = `mock_custom_token_${user.id}_${Date.now()}`

    return NextResponse.json({
      success: true,
      message: 'Mock signup successful - user created in database',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      },
      customToken: mockCustomToken,
      note: 'This is a mock response. In production, customToken would be from Firebase.'
    }, { status: 201 })

  } catch (error: any) {
    logger.error('Mock signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create user account' },
      { status: 500 }
    )
  }
}

async function handleMockSignin(data: any) {
  const validation = signInSchema.safeParse(data)
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        error: 'Invalid input data',
        details: validation.error.errors 
      },
      { status: 400 }
    )
  }

  const { email, password } = validation.data

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Mock custom token
    const mockCustomToken = `mock_custom_token_${user.id}_${Date.now()}`

    return NextResponse.json({
      success: true,
      message: 'Mock signin successful - credentials verified',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      },
      customToken: mockCustomToken,
      note: 'This is a mock response. In production, customToken would be from Firebase.'
    }, { status: 200 })

  } catch (error: any) {
    logger.error('Mock signin error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}

async function testDatabaseConnection() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      stats: {
        totalUsers: userCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    logger.error('Database test error:', error)
    return NextResponse.json(
      { error: 'Database connection failed', details: error.message },
      { status: 500 }
    )
  }
}
