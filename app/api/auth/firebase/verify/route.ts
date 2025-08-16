import { NextResponse } from 'next/server'
import { z } from 'zod'
import { firebaseAuthService } from '@/lib/firebase-auth-service'
import { logger } from '@/lib/logger'

const verifySchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    logger.info('Firebase token verification request received')

    const validation = verifySchema.safeParse(body)
    
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

    // Verify token and get/create user
    const user = await firebaseAuthService.getOrCreateUserFromToken(idToken)

    return NextResponse.json({
      success: true,
      message: 'Token verified successfully',
      user
    }, { status: 200 })

  } catch (error: any) {
    logger.error('Firebase token verification error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to verify token',
        code: error.code || 'VERIFICATION_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Firebase verification endpoint is working',
    timestamp: new Date().toISOString()
  })
}
