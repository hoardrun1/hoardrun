import { NextResponse } from 'next/server'
import { generateToken } from '@/lib/jwt'
import { userStorage } from '@/lib/user-storage'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { identityToken, action } = body // action can be 'signin' or 'signup'

    if (!identityToken) {
      return NextResponse.json({
        error: 'Apple identity token is required'
      }, { status: 400 })
    }

    let payload: any

    // Handle mock token for development
    if (identityToken === "mock-apple-identity-token") {
      payload = {
        sub: "mock-apple-user-id",
        email: "user@icloud.com",
        name: "Apple User"
      }
    } else {
      // For development/testing, we'll decode the token without verification
      // In production, you would verify the token with Apple's public keys
      try {
        payload = jwt.decode(identityToken)
      } catch (error) {
        return NextResponse.json({
          error: 'Invalid Apple identity token'
        }, { status: 400 })
      }

      if (!payload || !payload.email) {
        return NextResponse.json({
          error: 'Email not provided by Apple'
        }, { status: 400 })
      }
    }

    const { sub: appleId, email } = payload
    const name = payload.name || email.split('@')[0]

    // Check if user already exists
    let user = userStorage.findByEmail(email)

    if (action === 'signup') {
      if (user) {
        return NextResponse.json({
          error: 'User already exists with this email'
        }, { status: 400 })
      }

      // Create new user for signup
      user = userStorage.create({
        email,
        name,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
      })
    } else {
      // For signin, create user if doesn't exist (auto-registration)
      if (!user) {
        user = userStorage.create({
          email,
          name,
          password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
        })
      }
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
    }, '24h')

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: action === 'signup' ? 'Account created successfully with Apple' : 'Signed in successfully with Apple'
    }, { status: 200 })

  } catch (error) {
    console.error('Apple Sign In error:', error)
    return NextResponse.json({
      error: 'Apple authentication failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
