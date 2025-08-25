import { NextResponse } from 'next/server'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Firebase signup request received (Firebase removed):', { email: body.email })

    const validation = signUpSchema.safeParse(body)

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

    // Firebase removed - return success for compatibility
    console.log(`Sign up requested for user: ${email} with name: ${name || 'Not provided'}`)

    return NextResponse.json({
      success: true,
      message: 'Account creation functionality disabled (Firebase removed)',
      user: {
        id: email,
        email: email,
        name: name || 'User',
        emailVerified: true
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Signup error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to create account',
        code: error.code || 'SIGNUP_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Firebase signup endpoint is working',
    timestamp: new Date().toISOString(),
    note: 'This endpoint is temporarily simplified for testing'
  })
}
