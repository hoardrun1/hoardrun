import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for sign-in request
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = signInSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: validationResult.error.errors[0].message,
          error: 'Validation failed'
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // TODO: Implement actual authentication logic
    // For now, this is a placeholder that prevents the 404 error
    // In a real implementation, you would:
    // 1. Hash the password and compare with stored hash
    // 2. Check user exists in database
    // 3. Verify user is active/verified
    // 4. Generate JWT token
    // 5. Set secure cookies
    
    // Temporary mock authentication - replace with real logic
    if (email && password) {
      // Mock successful authentication
      const mockUser = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        verified: true
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Create response with token as cookie
      const response = NextResponse.json({
        success: true,
        message: 'Sign in successful',
        user: mockUser,
        token: mockToken
      });

      // Set the auth token as a secure cookie
      response.cookies.set('auth-token', mockToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      return response;
    }

    return NextResponse.json(
      { 
        message: 'Invalid credentials',
        error: 'Authentication failed'
      },
      { status: 401 }
    );

  } catch (error) {
    console.error('Sign-in error:', error);
    
    // Return proper JSON error response instead of HTML
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: 'Server error occurred'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}
