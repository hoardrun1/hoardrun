import { NextResponse } from 'next/server'
import { z } from 'zod'
import { firebaseAuthService } from '@/lib/firebase-auth-service'
import { logger } from '@/lib/logger'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  deviceInfo: z.object({
    fingerprint: z.string(),
    userAgent: z.string(),
    timestamp: z.number(),
  }).optional(),
  rememberMe: z.boolean().optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    logger.info('Sign-in request received:', { email: body.email })

    const validation = signInSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: validation.error.errors
      }, { status: 400 })
    }

    const { email, password } = validation.data

    // Use Firebase authentication service
    const result = await firebaseAuthService.signIn({
      email,
      password
    })

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: result.user,
      customToken: result.customToken,
      // Instructions for client
      firebaseEndpoint: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`
    }, { status: 200 })

  } catch (error: any) {
    logger.error('Sign-in error:', error)

    return NextResponse.json({
      error: error.message || 'Failed to sign in',
      code: error.code || 'SIGNIN_ERROR'
    }, { status: error.statusCode || 500 })
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Firebase signin endpoint is working',
    timestamp: new Date().toISOString(),
    note: 'This endpoint now uses Firebase authentication'
  })
}
