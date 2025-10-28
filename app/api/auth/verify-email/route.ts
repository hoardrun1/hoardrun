import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hoardrun-backend-py-1.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      )
    }

    // Forward the verification request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || data.detail || 'Email verification failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      message: 'Email verified successfully',
      verified: true,
      user_id: data.user_id,
      data: data
    })

  } catch (error) {
    console.error('Email verification API proxy error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for email verification links
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      // Redirect to verification page with error
      return NextResponse.redirect(
        new URL('/verify-email?error=missing_token', request.url)
      )
    }

    // Forward the verification request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Redirect to verification page to show error
      return NextResponse.redirect(
        new URL(`/verify-email?token=${token}&error=failed`, request.url)
      )
    }

    // Redirect to verification page to show success
    // The frontend will handle showing success message and redirecting to signin
    return NextResponse.redirect(
      new URL(`/verify-email?token=${token}&success=true`, request.url)
    )

  } catch (error) {
    console.error('Email verification API proxy error:', error)
    return NextResponse.redirect(
      new URL('/verify-email?error=network_error', request.url)
    )
  }
}