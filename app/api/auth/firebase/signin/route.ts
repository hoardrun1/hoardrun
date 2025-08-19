import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminAuth } from '@/lib/firebase-admin'

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Firebase signin request received:', { email: body.email })

    const validation = signInSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // For Firebase signin, we'll use the Firebase REST API to verify credentials
    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    })

    const firebaseData = await response.json()

    if (!response.ok) {
      throw new Error(firebaseData.error?.message || 'Invalid email or password')
    }

    // Get user details from Firebase Admin
    const userRecord = await adminAuth.getUser(firebaseData.localId)

    // Create custom token for the user
    const customToken = await adminAuth.createCustomToken(userRecord.uid)

    return NextResponse.json({
      success: true,
      message: 'Sign in successful',
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        emailVerified: userRecord.emailVerified
      },
      customToken,
      idToken: firebaseData.idToken
    }, { status: 200 })

  } catch (error: any) {
    console.error('Firebase signin error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to sign in',
        code: error.code || 'SIGNIN_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}
