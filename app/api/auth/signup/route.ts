<<<<<<< HEAD
export async function GET() {
  // Simple GET method for testing
  return new Response(JSON.stringify({
    message: 'API GET endpoint is working',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/jwt'
import { userStorage } from '@/lib/user-storage'
=======
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { firebaseAuthService } from '@/lib/firebase-auth-service'
import { logger } from '@/lib/logger'
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9

// Define validation schema
const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

<<<<<<< HEAD
=======
export async function GET() {
  return NextResponse.json({
    message: 'Firebase signup endpoint is working',
    timestamp: new Date().toISOString(),
    note: 'This endpoint now uses Firebase authentication'
  })
}

>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
<<<<<<< HEAD
=======
    logger.info('Signup request received:', { email: body.email })
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9

    // Validate the input
    const validation = signUpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: validation.error.errors
      }, { status: 400 });
    }

    const { email, password, name } = validation.data;

<<<<<<< HEAD
    // Check if user already exists
    const existingUser = userStorage.findByEmail(email);

    if (existingUser) {
      return NextResponse.json({
        error: 'User already exists with this email'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in memory (replace with database in production)
    const user = userStorage.create({
      email,
      password: hashedPassword,
      name,
    });

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
    }, '24h');

    // Return success response with token and user data
    return NextResponse.json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Sign-up error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
=======
    // Use Firebase authentication service
    const result = await firebaseAuthService.signUp({
      email,
      password,
      name
    })

    // Return success response with Firebase custom token
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: result.user,
      customToken: result.customToken,
      // Instructions for client
      firebaseEndpoint: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`
    }, { status: 201 });

  } catch (error: any) {
    logger.error('Signup error:', error);

    return NextResponse.json({
      error: error.message || 'Failed to create account',
      code: error.code || 'SIGNUP_ERROR'
    }, { status: error.statusCode || 500 });
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
  }
}
