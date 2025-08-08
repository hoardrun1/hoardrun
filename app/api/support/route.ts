import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Support API endpoint',
    endpoints: [
      'POST /api/support - Create support ticket',
      'GET /api/support - Get support tickets',
      'GET /api/support/faq - Get FAQ',
      'POST /api/support/chat - Initiate chat',
      'POST /api/support/feedback - Submit feedback'
    ]
  })
}

export async function POST() {
  return NextResponse.json({ message: 'Support ticket created' })
}