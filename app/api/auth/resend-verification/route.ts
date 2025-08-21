import { NextResponse } from 'next/server'
import { devEmailService } from '@/lib/dev-email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Generate a fake user ID for development
    const userId = Math.random().toString(36).substring(2, 15);

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?code=${verificationCode}&userId=${userId}`;

    // Email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">Verify Your Email</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">Thank you for signing up! Please verify your email address to continue.</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${verificationCode}
          </div>
          <p style="color: #888; font-size: 14px; margin-top: 10px;">Your verification code (valid for 30 minutes)</p>
        </div>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">Alternatively, you can click the button below to verify your email:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </div>
      </div>
    `;

    // Send verification email using dev email service
    await devEmailService.sendEmail(email, 'Verify Your Email Address', html);

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
