import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      // Client-side variables
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      
      // Server-side variables
      FIREBASE_ADMIN_PROJECT_ID: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      FIREBASE_ADMIN_CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      FIREBASE_ADMIN_PRIVATE_KEY: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      
      // Other important variables
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    }

    // Count missing variables
    const missingVars = Object.entries(envCheck)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    // Check Firebase Admin SDK initialization
    let firebaseAdminStatus = 'Not tested'
    try {
      const admin = require('firebase-admin')
      
      if (admin.apps.length === 0 && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        })
      }
      
      if (admin.apps.length > 0) {
        firebaseAdminStatus = 'Initialized successfully'
      } else {
        firebaseAdminStatus = 'Not initialized'
      }
    } catch (firebaseError: any) {
      firebaseAdminStatus = `Error: ${firebaseError.message}`
    }

    return NextResponse.json({
      status: 'Production Environment Check',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      domain: process.env.VERCEL_URL || 'localhost',
      
      environmentVariables: {
        total: Object.keys(envCheck).length,
        configured: Object.values(envCheck).filter(Boolean).length,
        missing: missingVars.length,
        missingVariables: missingVars,
        details: envCheck
      },
      
      firebaseAdmin: {
        status: firebaseAdminStatus,
        appsCount: require('firebase-admin').apps.length
      },
      
      recommendations: missingVars.length > 0 ? [
        'Add missing environment variables to Vercel',
        'Redeploy the application after adding variables',
        'Make sure Firebase private key includes quotes and \\n characters',
        'Add hoardrun.vercel.app to Firebase authorized domains'
      ] : [
        'All environment variables are configured',
        'Test Firebase functionality',
        'Check Firebase authorized domains'
      ],
      
      testEndpoints: {
        firebaseConfig: '/api/test/firebase',
        emailDebug: '/api/test/email-debug',
        firebaseSignup: '/api/auth/firebase/signup'
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Production check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
