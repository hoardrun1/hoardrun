import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminAuth } from '@/lib/firebase-admin'

const sendVerificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Firebase send email verification request received')

    const validation = sendVerificationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }

    const { userId } = validation.data

    // Get user by UID
    const userRecord = await adminAuth.getUser(userId)

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userRecord.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 409 }
      )
    }

    // Generate email verification link
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001'}/verify-email`,
      handleCodeInApp: true,
    }

    const verificationLink = await adminAuth.generateEmailVerificationLink(
      userRecord.email!,
      actionCodeSettings
    )

    // In a real application, you would send this link via email
    // For now, we'll log it for testing
    console.log(`Email verification link for ${userRecord.email}: ${verificationLink}`)

    return NextResponse.json({
      success: true,
      message: 'Email verification sent successfully',
      // For testing purposes, include the link in the response
      verificationLink: verificationLink
    }, { status: 200 })

  } catch (error: any) {
    console.error('Firebase send email verification error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to send email verification',
        code: error.code || 'SEND_VERIFICATION_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Firebase send email verification endpoint is working',
    timestamp: new Date().toISOString()
  })
}
