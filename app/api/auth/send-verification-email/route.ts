import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api-url'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to send verification email' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      message: 'Verification email sent successfully'
    })

  } catch (error) {
    console.error('Send verification email error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
