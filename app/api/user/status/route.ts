import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // In a real implementation, you would:
    // 1. Verify the authentication token
    // 2. Get the user's status from the database
    // 3. Return the user's status

    // For now, we'll just return a mock response
    return NextResponse.json({
      emailVerified: true,
      profileComplete: true,
      accountStatus: 'active',
      kycVerified: true,
      lastLogin: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting user status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get user status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
