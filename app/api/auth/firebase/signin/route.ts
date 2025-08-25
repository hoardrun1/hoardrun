import { NextResponse } from 'next/server'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Firebase signin request received (Firebase removed):', { email: body.email })

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

    // Firebase removed - return success for compatibility
    console.log(`Sign in requested for user: ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Sign in functionality disabled (Firebase removed)',
      user: {
        id: email,
        email: email,
        name: 'User',
        emailVerified: true
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Signin error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to sign in',
        code: error.code || 'SIGNIN_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}
