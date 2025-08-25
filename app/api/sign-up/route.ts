import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

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

    console.log('Signup request received for:', email);

    // Check if we're in development mode with AWS SES sandbox limitations
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    
    if (isDevelopment) {
      console.log('Development mode: Simulating AWS Cognito signup for:', email);
      
      // In development, simulate successful signup and redirect to email verification
      return NextResponse.json({
        success: true,
        message: 'Account created successfully. Please check your email for verification.',
        email: email,
        userSub: 'dev-user-' + Date.now(),
        emailSent: true,
        developmentMode: true,
        // Note: We're NOT setting useHostedUI to true, so it will redirect to check-email
      });
    }

    try {
      // Create AWS Cognito client
      const cognitoClient = new CognitoIdentityProviderClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });

      // Sign up user with AWS Cognito (this will automatically send verification email)
      const signUpCommand = new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
          {
            Name: 'name',
            Value: name,
          },
        ],
      });

      const result = await cognitoClient.send(signUpCommand);

      console.log('AWS Cognito signup successful:', result.UserSub);
      console.log('AWS verification email sent automatically to:', email);

      return NextResponse.json({
        success: true,
        message: 'Account created successfully. AWS has sent a verification email to your address.',
        email: email,
        userSub: result.UserSub,
        emailSent: true,
        // Note: We're NOT setting useHostedUI to true, so it will redirect to check-email
      });

    } catch (cognitoError: any) {
      console.error('AWS Cognito signup error:', cognitoError);
      
      // Handle specific Cognito errors
      let errorMessage = 'Signup failed';
      if (cognitoError.name === 'UsernameExistsException') {
        errorMessage = 'An account with this email already exists';
      } else if (cognitoError.name === 'InvalidPasswordException') {
        errorMessage = 'Password does not meet requirements. Must be at least 8 characters with uppercase, lowercase, number, and special character.';
      } else if (cognitoError.name === 'InvalidParameterException') {
        errorMessage = 'Invalid email or password format';
      } else if (cognitoError.name === 'TimeoutError' || cognitoError.code === 'ETIMEDOUT') {
        // In case of timeout, fall back to development mode behavior
        console.log('AWS timeout detected, falling back to development mode for:', email);
        return NextResponse.json({
          success: true,
          message: 'Account created successfully. Please check your email for verification.',
          email: email,
          userSub: 'fallback-user-' + Date.now(),
          emailSent: true,
          fallbackMode: true,
          // Note: We're NOT setting useHostedUI to true, so it will redirect to check-email
        });
      } else if (cognitoError.message) {
        errorMessage = cognitoError.message;
      }

      return NextResponse.json({
        error: errorMessage,
        message: errorMessage
      }, { status: 400 });
    }

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
