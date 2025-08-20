import { NextResponse } from 'next/server'
import { cognitoConfig, validateCognitoConfig } from '@/lib/aws-cognito-config'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    // Validate configuration
    validateCognitoConfig()

    return NextResponse.json({
      message: 'AWS Cognito test endpoint is working',
      timestamp: new Date().toISOString(),
      configuration: {
        region: cognitoConfig.region,
        userPoolId: cognitoConfig.userPoolId ? 'Set' : 'Not set',
        clientId: cognitoConfig.clientId ? 'Set' : 'Not set',
        userPoolIdPreview: cognitoConfig.userPoolId ? cognitoConfig.userPoolId.substring(0, 15) + '...' : 'Not set',
        clientIdPreview: cognitoConfig.clientId ? cognitoConfig.clientId.substring(0, 15) + '...' : 'Not set'
      },
      endpoints: {
        signup: '/api/auth/cognito/signup',
        signin: '/api/auth/cognito/signin',
        confirm: '/api/auth/cognito/confirm'
      },
      awsCredentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set'
      }
    })
  } catch (error: any) {
    logger.error('Cognito test error:', error)
    return NextResponse.json(
      { 
        error: 'Cognito configuration test failed',
        details: error.message,
        missingVariables: [
          'NEXT_PUBLIC_AWS_REGION',
          'NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID',
          'NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID',
          'AWS_ACCESS_KEY_ID',
          'AWS_SECRET_ACCESS_KEY'
        ].filter(key => !process.env[key])
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'test-config':
        return await testCognitoConfiguration()
      
      case 'test-signup':
        return await testSignupFlow(data)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: test-config, test-signup' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    logger.error('Cognito test POST error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Test failed',
        code: error.code || 'TEST_ERROR'
      },
      { status: error.statusCode || 500 }
    )
  }
}

async function testCognitoConfiguration() {
  try {
    validateCognitoConfig()
    
    // Test AWS SDK connection
    const { cognitoClient } = await import('@/lib/aws-cognito-config')
    
    // This will test if we can connect to AWS
    const testCommand = {
      UserPoolId: cognitoConfig.userPoolId
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cognito configuration is valid',
      configuration: {
        region: cognitoConfig.region,
        userPoolId: cognitoConfig.userPoolId,
        clientId: cognitoConfig.clientId
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Configuration test failed',
      details: error.message
    }, { status: 500 })
  }
}

async function testSignupFlow(data: any) {
  try {
    const { cognitoAuthService } = await import('@/lib/aws-cognito-auth-service')
    
    const testEmail = data.email || `test-${Date.now()}@example.com`
    const testPassword = data.password || 'TestPassword123!'
    const testName = data.name || 'Test User'
    
    // Test signup (this will create a real user in Cognito)
    const result = await cognitoAuthService.signUp({
      email: testEmail,
      password: testPassword,
      name: testName
    })
    
    return NextResponse.json({
      success: true,
      message: 'Test signup successful',
      result: {
        user: result.user,
        needsVerification: result.needsVerification,
        testCredentials: {
          email: testEmail,
          password: testPassword,
          note: 'Use these credentials to test signin after email verification'
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Signup test failed',
      details: error.message
    }, { status: 500 })
  }
}
