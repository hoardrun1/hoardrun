import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Email is required.'
      }, { status: 400 });
    }

    console.log('Resend verification request for:', email);

    try {
      // Create AWS Cognito client
      const cognitoClient = new CognitoIdentityProviderClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });

      // Resend confirmation code
      const resendCommand = new ResendConfirmationCodeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        Username: email,
      });

      const result = await cognitoClient.send(resendCommand);

      console.log('Verification email resent successfully to:', email);

      return NextResponse.json({
        success: true,
        message: 'Verification email has been resent. Please check your email.',
        email: email,
        deliveryMedium: result.CodeDeliveryDetails?.DeliveryMedium || 'EMAIL',
      });

    } catch (cognitoError: any) {
      console.error('AWS Cognito resend verification error:', cognitoError);
      
      // Handle specific Cognito errors
      let errorMessage = 'Failed to resend verification email';
      if (cognitoError.name === 'UserNotFoundException') {
        errorMessage = 'User not found. Please sign up first.';
      } else if (cognitoError.name === 'InvalidParameterException') {
        errorMessage = 'User is already confirmed.';
      } else if (cognitoError.name === 'LimitExceededException') {
        errorMessage = 'Too many requests. Please wait before requesting another verification email.';
      } else if (cognitoError.name === 'NotAuthorizedException') {
        errorMessage = 'User is already confirmed or not authorized.';
      } else if (cognitoError.message) {
        errorMessage = cognitoError.message;
      }

      return NextResponse.json({
        error: errorMessage,
        message: errorMessage
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Resend verification API error:', error);
    
    return NextResponse.json({
      error: 'Failed to resend verification email',
      message: 'An unexpected error occurred while resending verification email.'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Resend verification endpoint - use POST method with email'
  });
}
