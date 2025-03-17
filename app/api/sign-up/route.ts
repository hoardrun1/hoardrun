import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { generateToken } from '@/lib/jwt'

const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  deviceInfo: z.object({
    deviceId: z.string(),
    userAgent: z.string(),
    ip: z.string().optional(),
    components: z.record(z.any())
  })
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received signup request:', body) // Debug log

    const validation = signUpSchema.safeParse(body)
    
    if (!validation.success) {
      console.log('Validation errors:', validation.error.errors) // Debug log
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validation.error.errors 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const { email, password, name, deviceInfo } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ error: 'User already exists' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    // Generate verification code and send email
    const verificationCode = await sendVerificationEmail(email, user.id)

    // Generate temporary token
    const token = await generateToken({
      userId: user.id,
      type: 'TEMPORARY'
    }, '1h')

    return new NextResponse(
      JSON.stringify({
        message: 'Account created successfully. Please check your email for verification.',
        userId: user.id,
        token,
        verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Sign-up error:', error) // Debug log
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 
