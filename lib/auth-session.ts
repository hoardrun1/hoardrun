import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
}

interface Session {
  user: User;
}

/**
 * Get the current user session from httpOnly cookies
 * This works with our custom Google OAuth implementation
 */
export async function getCustomSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken?.value) {
      return null;
    }

    // Decode the session token (base64 encoded)
    try {
      const sessionData = JSON.parse(Buffer.from(authToken.value, 'base64').toString());
      
      // Check if session is expired
      if (sessionData.exp && sessionData.exp <= Math.floor(Date.now() / 1000)) {
        return null;
      }

      return {
        user: {
          id: sessionData.sub,
          email: sessionData.email,
          name: sessionData.name,
          emailVerified: true,
        }
      };
    } catch (decodeError) {
      console.error('Session token decode error:', decodeError);
      return null;
    }
  } catch (error) {
    console.error('Get custom session error:', error);
    return null;
  }
}

/**
 * Get session from request (for API routes)
 */
export async function getSessionFromRequest(request: NextRequest): Promise<Session | null> {
  try {
    const authToken = request.cookies.get('auth-token');

    if (!authToken?.value) {
      return null;
    }

    // Decode the session token (base64 encoded)
    try {
      const sessionData = JSON.parse(Buffer.from(authToken.value, 'base64').toString());
      
      // Check if session is expired
      if (sessionData.exp && sessionData.exp <= Math.floor(Date.now() / 1000)) {
        return null;
      }

      return {
        user: {
          id: sessionData.sub,
          email: sessionData.email,
          name: sessionData.name,
          emailVerified: true,
        }
      };
    } catch (decodeError) {
      console.error('Session token decode error:', decodeError);
      return null;
    }
  } catch (error) {
    console.error('Get session from request error:', error);
    return null;
  }
}
