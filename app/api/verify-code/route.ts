import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/db'

const verifyCodeSchema = z.object({
  code: z.string().length(6),
  type: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET']).optional(),
})

export async function POST(request: Request) {
  try {
    console.log('Starting code verification process')
    const body = await request.json()
    const { code, type = 'EMAIL_VERIFICATION' } = verifyCodeSchema.parse(body)

    console.log(`Verifying ${type} code:`, code)

    // Find and validate verification code
    const verification = await prisma.verificationCode.findFirst({
      where: {
        code,
        type,
        expiresAt: {
          gt: new Date(),
        },
        used: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true,
          },
        },
      },
    })

    if (!verification) {
      console.log('Invalid or expired verification code')
      return new NextResponse(
        JSON.stringify({ error: 'Invalid or expired verification code' }),
        { status: 400 }
      )
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { used: true },
    })

    // If this is email verification, mark the user's email as verified
    if (type === 'EMAIL_VERIFICATION' && !verification.user.emailVerified) {
      await prisma.user.update({
        where: { id: verification.user.id },
        data: { emailVerified: true },
      })
      console.log('Email verified for user:', verification.user.email)
    }

    // Return success response
    return new NextResponse(
      JSON.stringify({
        message: type === 'EMAIL_VERIFICATION' 
          ? 'Email verified successfully' 
          : 'Code verified successfully',
        user: {
          id: verification.user.id,
          email: verification.user.email,
          name: verification.user.name,
          emailVerified: type === 'EMAIL_VERIFICATION' ? true : verification.user.emailVerified,
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
    console.error('Verification error:', error)

    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid input data', 
          details: error.errors 
        }),
        { status: 400 }
      )
    }

    // Log database connection errors
    if ((error as any).code === 'P1001' || (error as any).code === 'P1002') {
      console.error('Database connection error:', error)
      return new NextResponse(
        JSON.stringify({ error: 'Database connection error' }),
        { status: 503 }
      )
    }

    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
} 