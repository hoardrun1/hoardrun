import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Input validation schema
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    console.log('Attempting sign in for email:', body.email)

    const validation = signInSchema.safeParse(body)
    if (!validation.success) {
      console.error('Validation error:', validation.error)
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input data' }),
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
      },
    })

    if (!user) {
      console.log('User not found:', email)
      return new NextResponse(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
      return new NextResponse(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401 }
      )
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret)

    console.log('Sign in successful for user:', email)

    // Return success response
    return new NextResponse(
      JSON.stringify({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Sign in error:', error)
    
    // Handle specific error types
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input data' }),
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return new NextResponse(
        JSON.stringify({ error: 'Database constraint violation' }),
        { status: 409 }
      )
    }

    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
} 