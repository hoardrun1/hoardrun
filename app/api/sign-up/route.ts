import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Email, password, and name are required.'
      }, { status: 400 });
    }

    // Basic validation
    if (password.length < 8) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters',
        message: 'Password must be at least 8 characters'
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

    // For now, we'll simulate a successful signup and always redirect to check-email
    // In a real implementation, you would:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Store user in database
    // 4. Send verification email
    
    console.log('Signup request received for:', email);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Always return success and redirect to email verification
    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification.',
      email: email,
      // Note: We're NOT setting useHostedUI to true, so it will redirect to check-email
    });

  } catch (error: any) {
    console.error('Sign-up API error:', error);
    
    return NextResponse.json({
      error: 'Signup failed',
      message: 'An unexpected error occurred during signup.'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Sign-up endpoint - use POST method'
  });
}
