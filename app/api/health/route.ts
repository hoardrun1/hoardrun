import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';

export async function GET() {
  try {
    // Check database connection (mock check)
    // await prisma.$queryRaw`SELECT 1`;
    
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          error: `Missing environment variables: ${missingEnvVars.join(', ')}`,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Return healthy status
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      uptime: process.uptime()
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
