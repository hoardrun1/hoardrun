import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');
    
    // Get the origin once at the beginning to avoid redeclaration
    const origin = new URL(request.url).origin;

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, error_description);
      return NextResponse.redirect(
        new URL(`/signin?error=${encodeURIComponent(error_description || error)}`, origin)
      );
    }

    // Handle missing authorization code
    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(
        new URL('/signin?error=No authorization code received', origin)
      );
    }

    // Exchange authorization code for tokens
    const tokenResponse = await exchangeCodeForTokens(code, origin);
    
    if (!tokenResponse.success) {
      console.error('Token exchange failed:', tokenResponse.error);
      return NextResponse.redirect(
        new URL(`/signin?error=${encodeURIComponent(tokenResponse.error || 'Token exchange failed')}`, origin)
      );
    }

    // Get user info from Cognito
    const userInfo = await getUserInfo(tokenResponse.access_token);
    
    if (!userInfo.success) {
      console.error('Failed to get user info:', userInfo.error);
      return NextResponse.redirect(
        new URL(`/signin?error=${encodeURIComponent(userInfo.error || 'Failed to get user info')}`, origin)
      );
    }

    // Create session or JWT token
    const sessionToken = await createUserSession(userInfo.data);

    // Check if user's email is verified in Cognito
    const isEmailVerified = userInfo.data.email_verified === 'true' || userInfo.data.email_verified === true;
    
    // Set session cookie
    const response = isEmailVerified 
      ? NextResponse.redirect(new URL('/home', origin))
      : NextResponse.redirect(new URL(`/check-email?email=${encodeURIComponent(userInfo.data.email)}`, origin));
    
    response.cookies.set('auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Callback error:', error);
    // Use the current request's origin to maintain the correct port
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(
      new URL('/signin?error=Authentication failed', origin)
    );
  }
}

async function exchangeCodeForTokens(code: string, currentOrigin: string) {
  try {
    const cognitoDomain = process.env.COGNITO_DOMAIN || process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    
    // Use the current request's origin to construct the redirect URI dynamically
    const redirectUri = `${currentOrigin}/api/auth/flexible-callback`;

    if (!cognitoDomain || !clientId) {
      throw new Error('Missing Cognito configuration');
    }

    const tokenUrl = `https://${cognitoDomain}/oauth2/token`;
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code: code,
      redirect_uri: redirectUri,
    });

    // Add client secret if available (for confidential clients)
    if (clientSecret) {
      body.append('client_secret', clientSecret);
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const tokens = await response.json();
    return { success: true, ...tokens };

  } catch (error) {
    console.error('Token exchange error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Token exchange failed' };
  }
}

async function getUserInfo(accessToken: string) {
  try {
    const cognitoDomain = process.env.COGNITO_DOMAIN || process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    
    if (!cognitoDomain) {
      throw new Error('Missing Cognito domain configuration');
    }

    const userInfoUrl = `https://${cognitoDomain}/oauth2/userInfo`;
    
    const response = await fetch(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`User info request failed: ${response.status} ${errorText}`);
    }

    const userInfo = await response.json();
    return { success: true, data: userInfo };

  } catch (error) {
    console.error('User info error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get user info' };
  }
}

async function createUserSession(userInfo: any) {
  // Simple JWT-like token creation (you might want to use a proper JWT library)
  const sessionData = {
    sub: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name || userInfo.given_name || userInfo.email,
    picture: userInfo.picture,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };

  // In a real app, you'd sign this with a secret key
  // For now, we'll just base64 encode it (NOT SECURE for production)
  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
}
