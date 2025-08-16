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

// Define validation schema
const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate the input
    const validation = signUpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: validation.error.errors
      }, { status: 400 });
    }

    const { email, password, name } = validation.data;

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
  }
}
