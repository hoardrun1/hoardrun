import { NextResponse } from 'next/server'
<<<<<<< HEAD
import { SignJWT } from 'jose'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { userStorage } from '@/lib/user-storage'
=======
import { z } from 'zod'
import { firebaseAuthService } from '@/lib/firebase-auth-service'
import { logger } from '@/lib/logger'
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  deviceInfo: z.object({
    fingerprint: z.string(),
    userAgent: z.string(),
    timestamp: z.number(),
<<<<<<< HEAD
  }),
=======
  }).optional(),
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
  rememberMe: z.boolean().optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
<<<<<<< HEAD
    const validation = signInSchema.safeParse(body)
    
    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input data' }),
        { status: 400 }
      )
    }

    const { email, password, rememberMe } = validation.data

    // Find user
    const user = userStorage.findByEmail(email.toLowerCase())

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
=======
    logger.info('Sign-in request received:', { email: body.email })

    const validation = signInSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: validation.error.errors
      }, { status: 400 })
    }

    const { email, password } = validation.data

    // Use Firebase authentication service
    const result = await firebaseAuthService.signIn({
      email,
      password
    })

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: result.user,
      customToken: result.customToken,
      // Instructions for client
      firebaseEndpoint: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`
    }, { status: 200 })

  } catch (error: any) {
    logger.error('Sign-in error:', error)

    return NextResponse.json({
      error: error.message || 'Failed to sign in',
      code: error.code || 'SIGNIN_ERROR'
    }, { status: error.statusCode || 500 })
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Firebase signin endpoint is working',
    timestamp: new Date().toISOString(),
    note: 'This endpoint now uses Firebase authentication'
  })
}
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
