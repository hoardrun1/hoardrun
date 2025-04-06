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

import { z } from 'zod';
import { sendVerificationEmail } from '@/lib/mailgun-service';

// Define validation schema
const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate the input
    const validation = signUpSchema.safeParse(body);

    if (!validation.success) {
      return new Response(JSON.stringify({
        message: 'Invalid input data',
        details: validation.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { email, name } = validation.data;

    // In a real app, you would check if the user exists and create the user in the database
    // For this demo, we'll just generate a fake user ID
    const userId = Math.random().toString(36).substring(2, 15);

    // Send verification email
    const verificationCode = await sendVerificationEmail(email, userId);

    // Return success response
    return new Response(JSON.stringify({
      message: 'Account created successfully. Please check your email for verification.',
      userId: userId,
      email: email,
      name: name || email.split('@')[0],
      // Include verification code in development mode for testing
      verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Sign-up error:', error);
    return new Response(JSON.stringify({
      message: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
