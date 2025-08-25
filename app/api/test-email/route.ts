import { NextResponse } from 'next/server';
import { devEmailService } from '@/lib/dev-email';

export async function GET() {
  try {
    // Get the recipient from environment variables
    const recipient = 'adarsh.kr29@gmail.com';

    // Send a test email using dev email service
    const messageId = await devEmailService.sendEmail(
      recipient,
      'Test Email from HoardRun',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #333; text-align: center;">Test Email</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            This is a test email from HoardRun using the development email service.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            If you're seeing this, it means the email configuration is working!
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Time sent: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    );

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully (using dev email service)',
      recipient,
      messageId
    });
  } catch (error) {
    console.error('Error sending test email:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
