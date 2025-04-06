import { NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/mailgun-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Generate a fake user ID for development
    const userId = Math.random().toString(36).substring(2, 15);

    // Send verification email
    const verificationCode = await sendVerificationEmail(email, userId);

    console.log(`Resending verification email to: ${email}`)

    return NextResponse.json({
      message: 'Verification email sent successfully',
      email,
      // Include verification code in development mode for testing
      verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
    })

  } catch (error) {
    console.error('Error resending verification email:', error)
    return NextResponse.json({
      message: 'Failed to resend verification email',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
