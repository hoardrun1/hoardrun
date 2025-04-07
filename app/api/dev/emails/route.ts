import { NextResponse } from 'next/server';
import { devEmailService } from '@/lib/dev-email';

export async function GET(request: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development mode' }, { status: 403 });
  }
  
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  
  if (email) {
    // Get emails for a specific address
    const emails = devEmailService.getEmails(email);
    return NextResponse.json({ emails });
  } else {
    // Return a simple message if no email is provided
    return NextResponse.json({ 
      message: 'Please provide an email parameter to view emails',
      example: `${url.origin}${url.pathname}?email=user@example.com`
    });
  }
}

export async function DELETE(request: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development mode' }, { status: 403 });
  }
  
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  
  if (email) {
    // Clear emails for a specific address
    devEmailService.clearEmails(email);
    return NextResponse.json({ message: `Emails cleared for ${email}` });
  } else {
    // Clear all emails
    devEmailService.clearAllEmails();
    return NextResponse.json({ message: 'All emails cleared' });
  }
}
