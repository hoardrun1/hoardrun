import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cognitoAuthService } from '@/lib/aws-cognito-auth-service'
import { logger } from '@/lib/logger'

const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    logger.info('Cognito signup request received:', { email: body.email })

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

    // Create user with Cognito
    const result = await cognitoAuthService.signUp({
      email,
      password,
      name
    })

    return NextResponse.json({
      success: true,
      message: result.needsVerification 
        ? 'Account created successfully. Please check your email for verification code.'
        : 'Account created and verified successfully.',
      user: result.user,
      needsVerification: result.needsVerification,
      session: result.session
    }, { status: 201 })

  } catch (error: any) {
    logger.error('Cognito signup error:', error)
    
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
    message: 'AWS Cognito signup endpoint is working',
    timestamp: new Date().toISOString()
  })
}
