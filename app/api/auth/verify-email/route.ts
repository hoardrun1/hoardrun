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
      // Redirect to error page or signin with error message
      return NextResponse.redirect(
        new URL(`/signin?error=${encodeURIComponent(data.message || 'Verification failed')}`, request.url)
      )
    }

    // Redirect to signin page with success message
    return NextResponse.redirect(
      new URL('/signin?verified=true', request.url)
    )

  } catch (error) {
    console.error('Email verification API proxy error:', error)
    return NextResponse.redirect(
      new URL('/signin?error=Verification%20failed', request.url)
    )
  }
}