import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminAuth } from '@/lib/firebase-admin'

const verifyEmailSchema = z.object({
  actionCode: z.string().min(1, 'Action code is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Firebase email verification request received')

    const validation = verifyEmailSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }

    const { actionCode } = validation.data

    // Check and apply the email verification action code
    const actionCodeInfo = await adminAuth.checkActionCode(actionCode)
    await adminAuth.applyActionCode(actionCode)

    // Get the email from the action code result
    const email = actionCodeInfo.data?.email

    if (!email) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Get user by email and update verification status
    const userRecord = await adminAuth.getUserByEmail(email)
    await adminAuth.updateUser(userRecord.uid, {
      emailVerified: true
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        emailVerified: true
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Firebase email verification error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to verify email',
        code: error.code || 'EMAIL_VERIFICATION_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Firebase email verification endpoint is working',
    timestamp: new Date().toISOString()
  })
}
