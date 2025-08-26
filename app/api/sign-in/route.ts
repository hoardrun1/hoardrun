import { NextResponse } from 'next/server'
<<<<<<< HEAD
import { SignJWT } from 'jose'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { userStorage } from '@/lib/user-storage'
=======
import { z } from 'zod'
import { firebaseAuthService } from '@/lib/firebase-auth-service'
import { logger } from '@/lib/logger'
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  deviceInfo: z.object({
    fingerprint: z.string(),
    userAgent: z.string(),
    timestamp: z.number(),
<<<<<<< HEAD
  }),
=======
  }).optional(),
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
  rememberMe: z.boolean().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
<<<<<<< HEAD
    const validation = signInSchema.safeParse(body)
    
    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input data' }),
        { status: 400 }
      )
    }

    const { email, password, rememberMe } = validation.data

    // Find user
    const user = userStorage.findByEmail(email.toLowerCase())

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(rememberMe ? '30d' : '24h')
      .setIssuedAt()
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret'))

    return new NextResponse(
      JSON.stringify({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Sign-in error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}
=======
    logger.info('Sign-in request received:', { email: body.email })

    const validation = signInSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: validation.error.errors
      }, { status: 400 })
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
      // Try a more compatible approach for Vercel
      response.cookies.set('auth-token', mockToken, {
        httpOnly: true,
        secure: true, // Always secure in production
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      // Also set a debug cookie to help troubleshoot
      response.cookies.set('auth-debug', 'token-set-' + Date.now(), {
        httpOnly: false, // Allow client-side access for debugging
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });

      console.log('Setting auth cookie with token:', mockToken);

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
