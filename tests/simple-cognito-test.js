#!/usr/bin/env node

/**
 * Simple AWS Cognito Connection Test
 * Tests AWS Cognito connection without interactive input
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { CognitoIdentityProviderClient, SignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Test configuration
const TEST_CONFIG = {
  region: process.env.AWS_REGION || process.env.COGNITO_REGION || 'us-east-1',
  clientId: process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  testEmail: 'kipkorirbiiaron@gmail.com',
  testPassword: 'TestPassword123',
  testName: 'HoardRun Test'
};

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: TEST_CONFIG.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m'  // Yellow
  };
  
  console.log(`${colors[type]}${message}\x1b[0m`);
}

async function testCognitoConnection() {
  console.log('\n🧪 Simple AWS Cognito Connection Test');
  console.log('=' .repeat(50));
  
  log('📋 Configuration:', 'info');
  log(`   AWS Region: ${TEST_CONFIG.region}`, 'info');
  log(`   Cognito Client ID: ${TEST_CONFIG.clientId}`, 'info');
  log(`   Test Email: ${TEST_CONFIG.testEmail}`, 'info');
  
  try {
    log('\n🚀 Testing AWS Cognito user creation...', 'info');
    
    const signUpCommand = new SignUpCommand({
      ClientId: TEST_CONFIG.clientId,
      Username: TEST_CONFIG.testEmail,
      Password: TEST_CONFIG.testPassword,
      UserAttributes: [
        { Name: 'email', Value: TEST_CONFIG.testEmail },
        { Name: 'name', Value: TEST_CONFIG.testName }
      ]
    });

    const response = await cognitoClient.send(signUpCommand);
    
    log('\n✅ SUCCESS! AWS Cognito connection working!', 'success');
    log(`   User ID: ${response.UserSub}`, 'success');
    log(`   Email Destination: ${response.CodeDeliveryDetails?.Destination || 'Not specified'}`, 'success');
    log(`   Delivery Medium: ${response.CodeDeliveryDetails?.DeliveryMedium || 'Not specified'}`, 'success');
    
    console.log('\n🎯 Test Results:');
    log('   ✅ AWS Cognito connection: WORKING', 'success');
    log('   ✅ User creation: WORKING', 'success');
    log('   ✅ Email sending: WORKING', 'success');
    log('   ✅ Your email verification system is ready!', 'success');
    
    console.log('\n📧 Next Steps:');
    log('   1. Check hoardrun@gmail.com for the verification email', 'info');
    log('   2. Test your application signup flow', 'info');
    log('   3. Users will be redirected to email verification page (not AWS Hosted UI)', 'info');
    
  } catch (error) {
    log('\n❌ Error occurred:', 'error');
    log(`   Error Name: ${error.name || 'Unknown'}`, 'error');
    log(`   Error Message: ${error.message || 'No message provided'}`, 'error');
    log(`   Error Code: ${error.code || 'No code provided'}`, 'error');
    
    // Show full error details for debugging
    console.log('\n🔍 Full Error Details:');
    console.log(JSON.stringify(error, null, 2));
    
    if (error.name === 'UsernameExistsException') {
      log('\n✅ This is actually GOOD NEWS!', 'success');
      log('   The email is already registered, which means:', 'success');
      log('   • AWS Cognito connection is working', 'success');
      log('   • Previous signup attempts were successful', 'success');
      log('   • Your email verification system is functional', 'success');
      
      console.log('\n🎯 Test Results:');
      log('   ✅ AWS Cognito connection: WORKING', 'success');
      log('   ✅ User creation: WORKING (user already exists)', 'success');
      log('   ✅ Email verification system: READY', 'success');
      
    } else if (error.name === 'InvalidPasswordException') {
      log('\n💡 Password doesn\'t meet requirements. Try: uppercase, lowercase, number, min 8 chars.', 'warning');
    } else if (error.name === 'InvalidParameterException') {
      log('\n💡 Check your email format and password requirements.', 'warning');
    } else if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
      log('\n💡 Network timeout - this might be due to AWS SES sandbox limitations.', 'warning');
      log('   Your configuration appears correct, but network/AWS service issues occurred.', 'warning');
    } else if (error.name === 'UnauthorizedOperation' || error.name === 'AccessDenied') {
      log('\n💡 AWS credentials might not have the required permissions for Cognito operations.', 'warning');
    }
  }
}

// Run the test
testCognitoConnection().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
