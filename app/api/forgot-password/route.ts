import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    })

    if (!user) {
      // Return success even if user doesn't exist for security
      return new NextResponse(
        JSON.stringify({
          message: 'If an account exists with this email, you will receive a password reset link',
        }),
        { status: 200 }
      )
    }

    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    await prisma.verificationCode.create({
      data: {
        code: resetCode,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
    })

    // TODO: Send password reset email with code
    console.log('Password reset code:', resetCode)

    return new NextResponse(
      JSON.stringify({
        message: 'If an account exists with this email, you will receive a password reset link',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input data', details: error.errors }),
        { status: 400 }
      )
    }
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
} 