import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Email and verification code are required.'
      }, { status: 400 });
    }

    console.log('Email verification request for:', email);

    try {
      // Create AWS Cognito client
      const cognitoClient = new CognitoIdentityProviderClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });

      // Confirm signup with verification code
      const confirmCommand = new ConfirmSignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
      });

      await cognitoClient.send(confirmCommand);

      console.log('Email verification successful for:', email);

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully. You can now sign in.',
        email: email,
      });

    } catch (cognitoError: any) {
      console.error('AWS Cognito verification error:', cognitoError);
      
      // Handle specific Cognito errors
      let errorMessage = 'Email verification failed';
      if (cognitoError.name === 'CodeMismatchException') {
        errorMessage = 'Invalid verification code. Please check your email and try again.';
      } else if (cognitoError.name === 'ExpiredCodeException') {
        errorMessage = 'Verification code has expired. Please request a new one.';
      } else if (cognitoError.name === 'UserNotFoundException') {
        errorMessage = 'User not found. Please sign up first.';
      } else if (cognitoError.name === 'NotAuthorizedException') {
        errorMessage = 'User is already confirmed or verification failed.';
      } else if (cognitoError.message) {
        errorMessage = cognitoError.message;
      }

      return NextResponse.json({
        error: errorMessage,
        message: errorMessage
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Email verification API error:', error);
    
    return NextResponse.json({
      error: 'Verification failed',
      message: 'An unexpected error occurred during email verification.'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email verification endpoint - use POST method with email and code'
  });
}
