import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/server/db'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  deviceInfo: z.object({
    fingerprint: z.string(),
    userAgent: z.string(),
    timestamp: z.number(),
  }),
  rememberMe: z.boolean().optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = signInSchema.safeParse(body)
    
    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input data' }),
        { status: 400 }
      )
    }

    const { email, password, rememberMe } = validation.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

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
