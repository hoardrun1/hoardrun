import { NextResponse } from 'next/server'
import { z } from 'zod'
<<<<<<< HEAD
import { firebaseAuthService } from '@/lib/firebase-auth-service'
import { logger } from '@/lib/logger'
=======
import { adminAuth } from '@/lib/firebase-admin'
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
<<<<<<< HEAD
    logger.info('Firebase signin request received:', { email: body.email })

    const validation = signInSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: validation.error.errors 
=======
    console.log('Firebase signin request received:', { email: body.email })

    const validation = signInSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: validation.error.errors
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

<<<<<<< HEAD
    // Sign in user and get custom token
    const result = await firebaseAuthService.signIn({
      email,
      password
    })

    return NextResponse.json({
      success: true,
      message: 'Sign in successful',
      user: result.user,
      customToken: result.customToken,
      // Instructions for client
      firebaseEndpoint: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`
    }, { status: 200 })

  } catch (error: any) {
    logger.error('Firebase signin error:', error)
    
    return NextResponse.json(
      { 
=======
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
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
        error: error.message || 'Failed to sign in',
        code: error.code || 'SIGNIN_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}
