import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 400 }
      )
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 400 }
      )
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    return NextResponse.json({ token, user: { id: user.id, email: user.email } })
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 