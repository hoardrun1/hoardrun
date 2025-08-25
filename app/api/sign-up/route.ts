import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

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
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Email, password, and name are required.'
      }, { status: 400 });
    }

    // Sign up user with AWS Cognito
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

    return NextResponse.json({
      success: true,
      message: 'User created successfully. Please check your email for verification.',
      userSub: result.UserSub,
      email: email,
    });

  } catch (error: any) {
    console.error('Sign-up API error:', error);
    
    let errorMessage = 'Signup failed';
    if (error.name === 'UsernameExistsException') {
      errorMessage = 'An account with this email already exists';
    } else if (error.name === 'InvalidPasswordException') {
      errorMessage = 'Password does not meet requirements';
    } else if (error.name === 'InvalidParameterException') {
      errorMessage = 'Invalid email or password format';
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
    message: 'Sign-up endpoint - use POST method'
  });
}
