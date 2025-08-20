import { NextResponse } from 'next/server'
import { z } from 'zod'
import { firebaseAuthService } from '@/lib/firebase-auth-service'
import { logger } from '@/lib/logger'

const verifyEmailSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
})

const resendVerificationSchema = z.object({
  email: z.string().email('Valid email is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'verify') {
      return await handleVerifyEmail(data)
    } else if (action === 'resend') {
      return await handleResendVerification(data)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "verify" or "resend"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    logger.error('Email verification error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process email verification',
        code: error.code || 'VERIFICATION_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}

async function handleVerifyEmail(data: any) {
  const validation = verifyEmailSchema.safeParse(data)
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        error: 'Invalid input data',
        details: validation.error.errors 
      },
      { status: 400 }
    )
  }

  const { idToken } = validation.data

  const result = await firebaseAuthService.verifyEmail(idToken)

  return NextResponse.json({
    success: true,
    message: result.verified ? 'Email verified successfully' : 'Email not yet verified',
    user: result.user,
    verified: result.verified
  }, { status: 200 })
}

async function handleResendVerification(data: any) {
  const validation = resendVerificationSchema.safeParse(data)
  
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

  const result = await firebaseAuthService.resendEmailVerification(email)

  return NextResponse.json({
    success: true,
    message: 'Verification email sent successfully',
    // In development, include verification link for testing
    ...(process.env.NODE_ENV === 'development' && { 
      verificationLink: result.verificationLink,
      note: 'Verification link included for development testing'
    })
  }, { status: 200 })
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Firebase email verification endpoint is working',
    timestamp: new Date().toISOString(),
    actions: {
      verify: 'POST with { "action": "verify", "idToken": "..." }',
      resend: 'POST with { "action": "resend", "email": "..." }'
    }
  })
}
