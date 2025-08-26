import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userId } = body;

    if (!email || !userId) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Email and userId are required.'
      }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Invalid email format',
        message: 'Please enter a valid email address'
      }, { status: 400 });
    }

    console.log('Sending verification email to:', email);

    try {
      // Use the existing email service
      const verificationCode = await sendVerificationEmail(email, userId);
      
      console.log('Verification email sent successfully to:', email);
      
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully',
        email: email,
        codeGenerated: true
      });

    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      
      return NextResponse.json({
        error: 'Failed to send verification email',
        message: 'Unable to send verification email. Please check your email configuration.',
        details: emailError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Send verification email API error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while sending verification email.'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send verification email endpoint - use POST method',
    requiredFields: ['email', 'userId'],
    example: {
      email: 'user@example.com',
      userId: 'user-123'
    }
  });
}
