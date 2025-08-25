import { NextResponse } from 'next/server'
import { z } from 'zod'

const sendVerificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Send email verification request received (Firebase removed)')

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

    // Firebase removed - return success for compatibility
    console.log(`Email verification requested for user: ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Email verification functionality disabled (Firebase removed)',
    }, { status: 200 })

  } catch (error: any) {
    console.error('Send email verification error:', error)

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
    message: 'Send email verification endpoint is working (Firebase removed)',
    timestamp: new Date().toISOString()
  })
}
