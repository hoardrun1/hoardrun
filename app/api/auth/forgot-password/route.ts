import { NextResponse } from 'next/server';
import { Web3FormsService } from '@/lib/web3forms-service';
import { VerificationTokenService } from '@/lib/verification-tokens';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Generate password reset token (we'll send email regardless for security)
    const { token } = VerificationTokenService.generateToken(email, 'password_reset');

    // Get base URL from request
    const baseUrl = new URL(request.url).origin;

    // Send password reset email using Web3Forms
    const emailResult = await Web3FormsService.sendPasswordResetEmail(
      email,
      'User',
      token,
      baseUrl
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.message);
      // Don't reveal the error to the user for security
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  }
}
