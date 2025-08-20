import { NextResponse } from 'next/server'
import { z } from 'zod'
import { firebaseAuthService } from '@/lib/firebase-auth-service'
import { logger } from '@/lib/logger'

const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    logger.info('Firebase signup with email verification request received:', { email: body.email })

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

    // Create user and get custom token
    const result = await firebaseAuthService.signUp({
      email,
      password,
      name
    })

    // Return response with instructions for client-side email verification
    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Use the client SDK to send verification email.',
      user: result.user,
      customToken: result.customToken,
      needsEmailVerification: result.needsEmailVerification,
      // Instructions for client to send verification email
      clientInstructions: {
        step1: 'Sign in with custom token using Firebase Client SDK',
        step2: 'Call sendEmailVerification() on the user object',
        step3: 'User will receive verification email from Firebase'
      },
      // Firebase endpoints for client
      firebaseEndpoint: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      // In development, include verification link for testing
      ...(process.env.NODE_ENV === 'development' && result.verificationLink && { 
        verificationLink: result.verificationLink,
        note: 'Verification link included for development testing - in production, use client SDK to send email'
      })
    }, { status: 201 })

  } catch (error: any) {
    logger.error('Firebase signup with email error:', error)
    
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
    message: 'Firebase signup with email verification endpoint is working',
    timestamp: new Date().toISOString(),
    note: 'This endpoint creates users and provides instructions for client-side email verification'
  })
}
