import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { generateToken } from '@/lib/jwt'
import { userStorage } from '@/lib/user-storage'
import bcrypt from 'bcryptjs'

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001'
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { idToken, action } = body // action can be 'signin' or 'signup'

    if (!idToken) {
      return NextResponse.json({
        error: 'Google ID token is required'
      }, { status: 400 })
    }

    let payload: any

    // Handle mock token for development
    if (idToken === "mock-google-id-token") {
      payload = {
        sub: "mock-google-user-id",
        email: "user@gmail.com",
        name: "Google User",
        picture: "https://example.com/avatar.jpg"
      }
    } else {
      // Verify the real Google ID token
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        })

        payload = ticket.getPayload()
        if (!payload) {
          return NextResponse.json({
            error: 'Invalid Google token'
          }, { status: 400 })
        }
      } catch (error) {
        return NextResponse.json({
          error: 'Failed to verify Google token'
        }, { status: 400 })
      }
    }

    const { sub: googleId, email, name, picture } = payload

    if (!email) {
      return NextResponse.json({
        error: 'Email not provided by Google'
      }, { status: 400 })
    }

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
        name: name || email.split('@')[0],
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
      })
    } else {
      // For signin, create user if doesn't exist (auto-registration)
      if (!user) {
        user = userStorage.create({
          email,
          name: name || email.split('@')[0],
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
      message: action === 'signup' ? 'Account created successfully with Google' : 'Signed in successfully with Google'
    }, { status: 200 })

  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.json({
      error: 'Google authentication failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
