import { NextResponse } from 'next/server'
import { z } from 'zod'
<<<<<<< HEAD
import { firebaseAuthService } from '@/lib/firebase-auth-service'
import { logger } from '@/lib/logger'
=======
import { adminAuth } from '@/lib/firebase-admin'
import { sendEmail } from '@/lib/email-service'
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9

const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
<<<<<<< HEAD
    logger.info('Firebase signup request received:', { email: body.email })

    const validation = signUpSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: validation.error.errors 
=======
    console.log('Firebase signup request received:', { email: body.email })

    const validation = signUpSchema.safeParse(body)

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

    const { email, password, name } = validation.data

<<<<<<< HEAD
    // Create user and get custom token
    const result = await firebaseAuthService.signUp({
      email,
      password,
      name
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification.',
      user: result.user,
      customToken: result.customToken,
      needsEmailVerification: result.needsEmailVerification,
      // Instructions for client
      firebaseEndpoint: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      // In development, include verification link for testing
      ...(process.env.NODE_ENV === 'development' && {
        verificationLink: result.verificationLink,
        note: 'Verification link included for development testing'
      })
    }, { status: 201 })

  } catch (error: any) {
    logger.error('Firebase signup error:', error)
    
    return NextResponse.json(
      { 
=======
    // Create Firebase user directly
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false
    })

    // Create custom token
    const customToken = await adminAuth.createCustomToken(userRecord.uid)

    // Automatically send email verification
    try {
      const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001'}/verify-email`,
        handleCodeInApp: true,
      }

      const verificationLink = await adminAuth.generateEmailVerificationLink(
        userRecord.email!,
        actionCodeSettings
      )

      console.log(`🔗 Email verification link for ${userRecord.email}:`)
      console.log(`${verificationLink}`)
      console.log(`📧 Attempting to send email...`)

      // Send email using the email service
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Hoardrun!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}"
               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px;">
            ${verificationLink}
          </p>
          <p><small>This link will expire in 24 hours.</small></p>
        </div>
      `

      await sendEmail(
        userRecord.email!,
        'Verify Your Email - Hoardrun',
        emailHtml,
        `Please verify your email by clicking this link: ${verificationLink}`
      )

      console.log(`✅ Email sent successfully to ${userRecord.email}`)

    } catch (verificationError) {
      console.warn('Failed to send email verification:', verificationError)
      // Don't fail the signup if email verification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email for verification.',
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        emailVerified: userRecord.emailVerified
      },
      customToken
    }, { status: 201 })

  } catch (error: any) {
    console.error('Firebase signup error:', error)

    return NextResponse.json(
      {
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
        error: error.message || 'Failed to create account',
        code: error.code || 'SIGNUP_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}
<<<<<<< HEAD
=======

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Firebase signup endpoint is working',
    timestamp: new Date().toISOString(),
    note: 'This endpoint is temporarily simplified for testing'
  })
}
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
