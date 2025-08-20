import { NextResponse } from 'next/server';
import { Web3FormsService } from '@/lib/web3forms-service';
import { VerificationTokenService } from '@/lib/verification-tokens';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // For Google OAuth users, we'll send verification emails regardless
    // since they're managed by the deployed backend, not local storage

    // Generate verification token
    const { token } = VerificationTokenService.generateToken(email, 'email_verification');

    // Get base URL from request
    const baseUrl = new URL(request.url).origin;

    // Send verification email using Web3Forms
    const emailResult = await Web3FormsService.sendVerificationEmail(
      email,
      name || 'User',
      token,
      baseUrl
    );

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: emailResult.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Send verification email error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send verification email'
    }, { status: 500 });
  }
}
