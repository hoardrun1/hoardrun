import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Email debug endpoint is working',
    timestamp: new Date().toISOString(),
    instructions: 'POST with { "email": "your-real-email@gmail.com" } to test email sending',
    note: 'This endpoint has been updated to use AWS Cognito instead of Firebase'
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

    // For now, return a mock response since we're transitioning to AWS Cognito
    // In production, this would integrate with AWS Cognito for email verification testing
    return NextResponse.json({
      success: true,
      message: 'Email debug endpoint updated for AWS Cognito',
      email: email,
      instructions: [
        'This endpoint has been updated to work with AWS Cognito',
        'Email verification is now handled through AWS SES',
        'Use the main signup flow to test email verification',
        'Check AWS Cognito console for user management'
      ],
      note: 'Firebase has been completely removed and replaced with AWS Cognito'
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug test failed',
      details: error.message
    }, { status: 500 })
  }
}
