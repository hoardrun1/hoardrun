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
    logger.info('Firebase signup request received:', { email: body.email })

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

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: result.user,
      customToken: result.customToken,
      // Instructions for client
      firebaseEndpoint: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`
    }, { status: 201 })

  } catch (error: any) {
    logger.error('Firebase signup error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create account',
        code: error.code || 'SIGNUP_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}
