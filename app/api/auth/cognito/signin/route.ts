import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cognitoAuthService } from '@/lib/aws-cognito-auth-service'
import { logger } from '@/lib/logger'

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    logger.info('Cognito signin request received:', { email: body.email })

    const validation = signInSchema.safeParse(body)
    
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

    // Sign in user with Cognito
    const result = await cognitoAuthService.signIn({
      email,
      password
    })

    return NextResponse.json({
      success: true,
      message: 'Sign in successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }, { status: 200 })

  } catch (error: any) {
    logger.error('Cognito signin error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to sign in',
        code: error.code || 'SIGNIN_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'AWS Cognito signin endpoint is working',
    timestamp: new Date().toISOString()
  })
}
