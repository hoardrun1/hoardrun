import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';

export async function POST(request: NextRequest) {
  try {
    // Check if auth bypass is enabled
    if (isAuthBypassEnabled()) {
      console.log('Auth bypass enabled - mock email sending');
      const body = await request.json();
      return NextResponse.json({
        success: true,
        message: 'Email sent (bypass mode)',
        messageId: 'mock-message-id',
        bypass: true,
        data: body
      });
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token format' },
        { status: 401 }
      );
    }

    // Parse request body
    const { to, subject, html, text } = await request.json();

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send email
    const messageId = await sendEmail(to, subject, html, text);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId,
      bypass: false
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing email service status
export async function GET() {
  try {
    if (isAuthBypassEnabled()) {
      return NextResponse.json({
        status: 'available',
        message: 'Email service available (bypass mode)',
        bypass: true
      });
    }

    // Check if email service is configured
    const isConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    );

    return NextResponse.json({
      status: isConfigured ? 'available' : 'not_configured',
      message: isConfigured 
        ? 'Email service is configured and available'
        : 'Email service is not properly configured',
      bypass: false,
      config: {
        host: process.env.SMTP_HOST ? '***configured***' : 'not set',
        user: process.env.SMTP_USER ? '***configured***' : 'not set',
        from: process.env.SMTP_FROM || 'not set'
      }
    });

  } catch (error) {
    console.error('Error checking email service:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to check email service status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
