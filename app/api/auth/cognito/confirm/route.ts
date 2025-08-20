import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cognitoAuthService } from '@/lib/aws-cognito-auth-service'
import { logger } from '@/lib/logger'

const confirmSchema = z.object({
  email: z.string().email('Invalid email format'),
  confirmationCode: z.string().min(6, 'Confirmation code must be at least 6 characters'),
})

const resendSchema = z.object({
  email: z.string().email('Invalid email format'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'confirm') {
      return await handleConfirmSignUp(data)
    } else if (action === 'resend') {
      return await handleResendCode(data)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "confirm" or "resend"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    logger.error('Cognito confirmation error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process confirmation',
        code: error.code || 'CONFIRMATION_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}

async function handleConfirmSignUp(data: any) {
  const validation = confirmSchema.safeParse(data)
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        error: 'Invalid input data',
        details: validation.error.errors 
      },
      { status: 400 }
    )
  }

  const { email, confirmationCode } = validation.data

  const result = await cognitoAuthService.confirmSignUp(email, confirmationCode)

  return NextResponse.json({
    success: true,
    message: 'Email verified successfully',
    user: result.user,
    confirmed: result.confirmed
  }, { status: 200 })
}

async function handleResendCode(data: any) {
  const validation = resendSchema.safeParse(data)
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        error: 'Invalid input data',
        details: validation.error.errors 
      },
      { status: 400 }
    )
  }

  const { email } = validation.data

  const result = await cognitoAuthService.resendConfirmationCode(email)

  return NextResponse.json({
    success: true,
    message: 'Confirmation code sent successfully',
    codeSent: result.codeSent
  }, { status: 200 })
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'AWS Cognito confirmation endpoint is working',
    timestamp: new Date().toISOString(),
    actions: {
      confirm: 'POST with { "action": "confirm", "email": "...", "confirmationCode": "..." }',
      resend: 'POST with { "action": "resend", "email": "..." }'
    }
  })
}
