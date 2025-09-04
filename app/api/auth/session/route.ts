import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from httpOnly cookie
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Validate and decode the session token
    const user = await validateSessionToken(authToken);
    
    if (!user) {
      // Clear invalid cookie
      const response = NextResponse.json({ user: null }, { status: 401 });
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
      });
      return response;
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

async function validateSessionToken(token: string) {
  try {
    // Check if token looks like base64
    if (!token || token.length < 10) {
      console.log('Invalid token format');
      return null;
    }

    // Decode the base64 encoded session token
    let decodedString;
    try {
      decodedString = Buffer.from(token, 'base64').toString('utf8');
    } catch (decodeError) {
      console.log('Failed to decode base64 token');
      return null;
    }

    // Parse JSON
    let sessionData;
    try {
      sessionData = JSON.parse(decodedString);
    } catch (parseError) {
      console.log('Failed to parse session JSON');
      return null;
    }
    
    // Check if token is expired
    if (sessionData.exp && sessionData.exp < Math.floor(Date.now() / 1000)) {
      console.log('Session token expired');
      return null;
    }

    // Validate required fields
    if (!sessionData.sub || !sessionData.email) {
      console.log('Missing required session fields');
      return null;
    }

    // Return user data
    return {
      id: sessionData.sub,
      email: sessionData.email,
      name: sessionData.name || sessionData.email,
      emailVerified: true,
    };

  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}
