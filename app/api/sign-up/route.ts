import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .optional(),
})

export async function POST(request: Request) {
  try {
    console.log('Starting sign-up process')
    const body = await request.json()
    console.log('Received sign-up request for email:', body.email)

    const { email, password, name } = signUpSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true }
    })

    if (existingUser) {
      console.log('User already exists:', email)
      return new NextResponse(
        JSON.stringify({ error: 'Email already registered' }),
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    console.log('User created successfully:', user.email)

    // Generate verification code
    const verificationCode = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(byte => byte % 10)
      .join('')

    // Create verification record
    await prisma.verificationCode.create({
      data: {
        code: verificationCode,
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        used: false,
      },
    })

    console.log('Verification code created:', verificationCode)

    // Send verification email
    let emailSent = false
    try {
      emailSent = await sendVerificationEmail(email, verificationCode)
    } catch (error) {
      console.error('Failed to send verification email:', error)
    }

    // Return success response with appropriate message
    return new NextResponse(
      JSON.stringify({
        message: emailSent 
          ? 'Account created successfully. Please check your email for verification.'
          : 'Account created successfully. Please contact support for verification.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Sign-up error:', error)
    
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid input data', 
          details: error.errors 
        }),
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return new NextResponse(
        JSON.stringify({ error: 'Email already registered' }),
        { status: 409 }
      )
    }

    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    )
  }
} 