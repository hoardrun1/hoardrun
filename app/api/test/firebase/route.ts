import { NextResponse } from 'next/server'
import { firebaseAuthService } from '@/lib/firebase-auth-service'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    return NextResponse.json({
      message: 'Firebase test endpoint is working',
      timestamp: new Date().toISOString(),
      endpoints: {
        signup: '/api/auth/firebase/signup',
        signin: '/api/auth/firebase/signin',
        verify: '/api/auth/firebase/verify'
      },
      firebaseConfig: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not set'
      }
    })
  } catch (error) {
    logger.error('Firebase test error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'test-signup':
        const signupResult = await firebaseAuthService.signUp({
          email: data.email || 'test@example.com',
          password: data.password || 'testpassword123',
          name: data.name || 'Test User'
        })
        return NextResponse.json({
          success: true,
          message: 'Test signup successful',
          result: {
            user: signupResult.user,
            hasCustomToken: !!signupResult.customToken
          }
        })

      case 'test-signin':
        const signinResult = await firebaseAuthService.signIn({
          email: data.email || 'test@example.com',
          password: data.password || 'testpassword123'
        })
        return NextResponse.json({
          success: true,
          message: 'Test signin successful',
          result: {
            user: signinResult.user,
            hasCustomToken: !!signinResult.customToken
          }
        })

      case 'test-token':
        if (!data.customToken) {
          return NextResponse.json(
            { error: 'Custom token required for test' },
            { status: 400 }
          )
        }
        
        // Test Firebase custom token endpoint
        const firebaseResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: data.customToken,
            returnSecureToken: true
          })
        })

        if (!firebaseResponse.ok) {
          const errorData = await firebaseResponse.json()
          return NextResponse.json(
            { error: 'Firebase token test failed', details: errorData },
            { status: 400 }
          )
        }

        const firebaseData = await firebaseResponse.json()
        return NextResponse.json({
          success: true,
          message: 'Firebase token test successful',
          result: {
            hasIdToken: !!firebaseData.idToken,
            hasRefreshToken: !!firebaseData.refreshToken,
            expiresIn: firebaseData.expiresIn
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid test action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    logger.error('Firebase test POST error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Test failed',
        code: error.code || 'TEST_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}
