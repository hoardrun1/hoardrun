import { NextResponse } from 'next/server';
import { VerificationTokenService } from '@/lib/verification-tokens';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, email, newPassword } = body;

    if (!token || !email || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Token, email, and new password are required'
      }, { status: 400 });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 8 characters long'
      }, { status: 400 });
    }

    // Verify the token
    const tokenVerification = VerificationTokenService.verifyToken(token, email);

    if (!tokenVerification.valid) {
      return NextResponse.json({
        success: false,
        error: tokenVerification.message,
        expired: tokenVerification.expired
      }, { status: 400 });
    }

    // Check if it's a password reset token
    if (tokenVerification.type !== 'password_reset') {
      return NextResponse.json({
        success: false,
        error: 'Invalid token type'
      }, { status: 400 });
    }

    // Consume the token (mark as used)
    const tokenConsumed = VerificationTokenService.consumeToken(token, email);
    if (!tokenConsumed) {
      return NextResponse.json({
        success: false,
        error: 'Failed to consume reset token'
      }, { status: 500 });
    }

    // For Google OAuth users, password reset would need to be handled
    // by the deployed backend. For now, we'll just consume the token.

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({
      success: false,
      error: 'Password reset failed'
    }, { status: 500 });
  }
}
