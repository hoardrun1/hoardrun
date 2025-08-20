import { NextResponse } from 'next/server';
import { VerificationTokenService } from '@/lib/verification-tokens';
import { Web3FormsService } from '@/lib/web3forms-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json({
        success: false,
        error: 'Token and email are required'
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

    // Check if it's an email verification token
    if (tokenVerification.type !== 'email_verification') {
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
        error: 'Failed to consume verification token'
      }, { status: 500 });
    }

    // For Google OAuth users, we'll just mark the token as consumed
    // The actual user verification is handled by the deployed backend

    // Send welcome email
    try {
      await Web3FormsService.sendWelcomeEmail(email, 'User');
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail the verification if welcome email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        email: email,
        emailVerified: true
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Email verification failed'
    }, { status: 500 });
  }
}
