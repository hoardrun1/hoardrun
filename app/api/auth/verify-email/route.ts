import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

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

    // Confirm sign up with AWS Cognito
    const confirmSignUpCommand = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });

    await cognitoClient.send(confirmSignUpCommand);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now sign in.',
    });

  } catch (error: any) {
    console.error('Email verification API error:', error);
    
    let errorMessage = 'Email verification failed';
    if (error.name === 'CodeMismatchException') {
      errorMessage = 'Invalid verification code';
    } else if (error.name === 'ExpiredCodeException') {
      errorMessage = 'Verification code has expired';
    } else if (error.name === 'UserNotFoundException') {
      errorMessage = 'User not found';
    } else if (error.name === 'NotAuthorizedException') {
      errorMessage = 'User is already confirmed';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      error: errorMessage,
      message: errorMessage
    }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email verification endpoint - use POST method'
  });
}
