import { NextResponse } from 'next/server';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';

export async function GET(request: Request) {
  try {
    // Check if auth bypass is enabled
    if (isAuthBypassEnabled()) {
      console.log('Auth bypass enabled - returning mock user status');
      return NextResponse.json({
        emailVerified: true,
        profileComplete: true,
        user: {
          id: 'mock-user-id',
          email: 'user@example.com',
          name: 'Demo User',
          emailVerified: true,
          profileComplete: true
        },
        bypass: true
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

    // In a real implementation, you would:
    // 1. Verify the JWT token
    // 2. Get user from database
    // 3. Check email verification status
    // 4. Check profile completion status
    
    // For now, return mock data for authenticated users
    return NextResponse.json({
      emailVerified: true,
      profileComplete: true,
      user: {
        id: 'authenticated-user-id',
        email: 'authenticated@example.com',
        name: 'Authenticated User',
        emailVerified: true,
        profileComplete: true
      },
      bypass: false
    });

  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Handle POST requests for updating user status
  try {
    if (isAuthBypassEnabled()) {
      console.log('Auth bypass enabled - mock status update');
      return NextResponse.json({
        success: true,
        message: 'Status updated (bypass mode)',
        bypass: true
      });
    }

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { emailVerified, profileComplete } = body;

    // In a real implementation, update the user's status in the database
    
    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      emailVerified,
      profileComplete,
      bypass: false
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
