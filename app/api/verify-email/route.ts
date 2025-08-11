import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { userId } = (await verifyToken(token)) as { userId: string }

    const body = await request.json()
    const { verificationCode, email } = body

    // Verify the code
    const validCode = await prisma.verificationCode.findFirst({
      where: {
        userId,
        code: verificationCode,
        type: 'EMAIL_VERIFICATION',
        expiresAt: {
          gt: new Date()
        },
        used: false
      }
    })

    if (!validCode) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid or expired verification code' }),
        { status: 400 }
      )
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: validCode.id },
      data: { used: true }
    })

    // Update user's email verification status
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true }
    })

    return new NextResponse(
      JSON.stringify({ message: 'Email verified successfully' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }),
      { status: 500 }
    )
  }
}