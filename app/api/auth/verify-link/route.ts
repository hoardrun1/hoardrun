import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the verification code and userId from the URL
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const userId = url.searchParams.get('userId');

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Missing verification code or user ID' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Verify the code against the database
    // 2. Update the user's email verification status
    // 3. Redirect to the signin page with a success message

    // For now, we'll just log the verification attempt and return a success response
    console.log(`Verifying email with code: ${code} for user: ${userId}`);

    // Return a redirect response to the verification success page
    return NextResponse.redirect(new URL(`/verification-success?email=${encodeURIComponent(userId)}`, request.url));
  } catch (error) {
    console.error('Error verifying email link:', error);

    // Redirect to signin page with an error parameter
    return NextResponse.redirect(new URL('/signin?error=verification_failed', request.url));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, userId } = body;

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Missing verification code or user ID' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Verify the code against the database
    // 2. Update the user's email verification status
    // 3. Return a success response

    // For now, we'll just log the verification attempt and return a success response
    console.log(`Verifying email with code: ${code} for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      userId
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify email',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
