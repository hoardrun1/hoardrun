import { NextResponse } from 'next/server'
import { z } from 'zod'
import { firebaseAuthService } from '@/lib/firebase-auth-service'
import { logger } from '@/lib/logger'

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    logger.info('Firebase signin request received:', { email: body.email })

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

    // Sign in user and get custom token
    const result = await firebaseAuthService.signIn({
      email,
      password
    })

    return NextResponse.json({
      success: true,
      message: 'Sign in successful',
      user: result.user,
      customToken: result.customToken,
      // Instructions for client
      firebaseEndpoint: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`
    }, { status: 200 })

  } catch (error: any) {
    logger.error('Firebase signin error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to sign in',
        code: error.code || 'SIGNIN_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}
