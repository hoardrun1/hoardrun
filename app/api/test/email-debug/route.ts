import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { logger } from '@/lib/logger'

export async function GET() {
  return NextResponse.json({
    message: 'Email debug endpoint is working',
    timestamp: new Date().toISOString(),
    instructions: 'POST with { "email": "your-real-email@gmail.com" } to test email sending'
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address required' },
        { status: 400 }
      )
    }

    logger.info(`Testing email sending for: ${email}`)

    // Step 1: Create test user
    const testUserId = 'email-debug-' + Date.now()
    
    let userRecord
    try {
      userRecord = await adminAuth.createUser({
        uid: testUserId,
        email: email,
        password: 'DebugPassword123!',
        displayName: 'Debug Test User',
        emailVerified: false
      })
      
      logger.info(`Debug user created: ${userRecord.uid}`)
    } catch (userError: any) {
      if (userError.code === 'auth/email-already-exists') {
        return NextResponse.json({
          error: 'User with this email already exists',
          suggestion: 'Try with a different email or delete the existing user from Firebase Console',
          consoleUrl: `https://console.firebase.google.com/project/hoardrun-ef38e/authentication/users`
        }, { status: 409 })
      }
      
      logger.error('User creation error:', userError)
      return NextResponse.json({
        error: 'Failed to create test user',
        details: userError.message
      }, { status: 500 })
    }

    // Step 2: Create custom token
    let customToken
    try {
      customToken = await adminAuth.createCustomToken(testUserId)
      logger.info('Custom token created')
    } catch (tokenError: any) {
      logger.error('Custom token creation error:', tokenError)
      
      // Clean up user
      await adminAuth.deleteUser(testUserId)
      
      return NextResponse.json({
        error: 'Failed to create custom token',
        details: tokenError.message
      }, { status: 500 })
    }

    // Step 3: Exchange for ID token
    let idToken
    try {
      const tokenResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true
        })
      })

      if (!tokenResponse.ok) {
        const tokenError = await tokenResponse.json()
        throw new Error(`Token exchange failed: ${tokenError.error?.message || 'Unknown error'}`)
      }

      const tokenData = await tokenResponse.json()
      idToken = tokenData.idToken
      logger.info('ID token obtained')
    } catch (exchangeError: any) {
      logger.error('Token exchange error:', exchangeError)
      
      // Clean up user
      await adminAuth.deleteUser(testUserId)
      
      return NextResponse.json({
        error: 'Failed to exchange token',
        details: exchangeError.message
      }, { status: 500 })
    }

    // Step 4: Send verification email
    try {
      const emailResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'VERIFY_EMAIL',
          idToken: idToken
        })
      })

      const emailData = await emailResponse.json()

      if (emailResponse.ok) {
        logger.info(`Verification email sent to: ${email}`)
        
        // Schedule cleanup after 10 minutes
        setTimeout(async () => {
          try {
            await adminAuth.deleteUser(testUserId)
            logger.info(`Debug user ${testUserId} cleaned up`)
          } catch (cleanupError) {
            logger.error('Cleanup error:', cleanupError)
          }
        }, 10 * 60 * 1000)

        return NextResponse.json({
          success: true,
          message: 'Verification email sent successfully!',
          email: email,
          instructions: [
            'Check your email inbox',
            'Check your spam/junk folder',
            'Email may take 1-5 minutes to arrive',
            'Email will come from noreply@hoardrun-ef38e.firebaseapp.com'
          ],
          testCredentials: {
            email: email,
            password: 'DebugPassword123!',
            note: 'You can use these to test signin (user will be deleted in 10 minutes)'
          }
        })
      } else {
        logger.error('Email sending failed:', emailData)
        
        // Clean up user
        await adminAuth.deleteUser(testUserId)
        
        let errorMessage = 'Failed to send verification email'
        let suggestion = 'Check Firebase Console configuration'
        
        if (emailData.error?.message?.includes('EMAIL_NOT_FOUND')) {
          suggestion = 'User not found in Firebase Auth'
        } else if (emailData.error?.message?.includes('INVALID_ID_TOKEN')) {
          suggestion = 'ID token is invalid - check Firebase configuration'
        } else if (emailData.error?.message?.includes('OPERATION_NOT_ALLOWED')) {
          suggestion = 'Email/Password authentication is not enabled in Firebase Console'
        }

        return NextResponse.json({
          error: errorMessage,
          details: emailData.error?.message || 'Unknown error',
          suggestion: suggestion,
          configureUrl: 'https://console.firebase.google.com/project/hoardrun-ef38e/authentication/providers'
        }, { status: 400 })
      }
    } catch (emailError: any) {
      logger.error('Email sending error:', emailError)
      
      // Clean up user
      await adminAuth.deleteUser(testUserId)
      
      return NextResponse.json({
        error: 'Email sending failed',
        details: emailError.message
      }, { status: 500 })
    }

  } catch (error: any) {
    logger.error('Email debug error:', error)
    
    return NextResponse.json({
      error: 'Debug test failed',
      details: error.message
    }, { status: 500 })
  }
}
