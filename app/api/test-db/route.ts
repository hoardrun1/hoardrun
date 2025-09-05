import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const connectionTest = await dbHelpers.testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json(
        { 
          error: 'Database connection failed', 
          details: connectionTest.message,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Get database info
    const response = {
      status: 'success',
      message: 'Database connection successful',
      database: 'PostgreSQL',
      timestamp: new Date().toISOString(),
      connection: connectionTest
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        error: 'Database test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
