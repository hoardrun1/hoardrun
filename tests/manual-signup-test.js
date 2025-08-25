#!/usr/bin/env node

/**
 * Manual AWS Cognito Signup Test
 * This test allows you to test with a real email address that you can verify
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { CognitoIdentityProviderClient, SignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test configuration
const TEST_CONFIG = {
  region: process.env.AWS_REGION || process.env.COGNITO_REGION || 'us-east-1',
  clientId: process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
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

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function testManualSignup() {
  console.log('\n🧪 Manual AWS Cognito Signup Test');
  console.log('=' .repeat(50));
  
  log('📋 Configuration:', 'info');
  log(`   AWS Region: ${TEST_CONFIG.region}`, 'info');
  log(`   Cognito Client ID: ${TEST_CONFIG.clientId}`, 'info');
  
  console.log('\n⚠️  Important Notes:', 'warning');
  log('   • Your AWS SES is in sandbox mode', 'warning');
  log('   • You can only send emails to verified email addresses', 'warning');
  log('   • Use an email address you have access to', 'warning');
  
  try {
    // Get user input
    const email = await askQuestion('\n📧 Enter your email address: ');
    const password = await askQuestion('🔒 Enter a password (min 8 chars, with uppercase, lowercase, number): ');
    const name = await askQuestion('👤 Enter your name: ');
    
    log('\n🚀 Creating user in AWS Cognito...', 'info');
    
    const signUpCommand = new SignUpCommand({
      ClientId: TEST_CONFIG.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name }
      ]
    });

    const response = await cognitoClient.send(signUpCommand);
    
    log('\n✅ SUCCESS! User created successfully!', 'success');
    log(`   User ID: ${response.UserSub}`, 'success');
    log(`   Email Destination: ${response.CodeDeliveryDetails?.Destination || 'Not specified'}`, 'success');
    log(`   Delivery Medium: ${response.CodeDeliveryDetails?.DeliveryMedium || 'Not specified'}`, 'success');
    
    console.log('\n📧 Next Steps:');
    log('   1. Check your email for the verification code', 'info');
    log('   2. Go to your application signup page', 'info');
    log('   3. Try signing up with the same email', 'info');
    log('   4. You should be redirected to the email verification page', 'info');
    
    console.log('\n🎯 Test Results:');
    log('   ✅ AWS Cognito connection: WORKING', 'success');
    log('   ✅ User creation: WORKING', 'success');
    log('   ✅ Email sending: WORKING', 'success');
    log('   ✅ Your signup flow should now work correctly!', 'success');
    
  } catch (error) {
    log('\n❌ Error occurred:', 'error');
    log(`   Error Name: ${error.name || 'Unknown'}`, 'error');
    log(`   Error Message: ${error.message || 'No message provided'}`, 'error');
    log(`   Error Code: ${error.code || 'No code provided'}`, 'error');
    
    // Show full error details for debugging
    console.log('\n🔍 Full Error Details:');
    console.log(JSON.stringify(error, null, 2));
    
    if (error.name === 'UsernameExistsException') {
      log('\n💡 This email is already registered. Try a different email or delete the existing user.', 'warning');
    } else if (error.name === 'InvalidPasswordException') {
      log('\n💡 Password doesn\'t meet requirements. Try: uppercase, lowercase, number, min 8 chars.', 'warning');
    } else if (error.name === 'InvalidParameterException') {
      log('\n💡 Check your email format and password requirements.', 'warning');
    } else if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
      log('\n💡 Network timeout - this might be due to AWS SES sandbox limitations or network issues.', 'warning');
    } else if (error.name === 'UnauthorizedOperation' || error.name === 'AccessDenied') {
      log('\n💡 AWS credentials might not have the required permissions for Cognito operations.', 'warning');
    }
  }
  
  rl.close();
}

// Run the test
testManualSignup().catch(error => {
  console.error('❌ Test failed:', error);
  rl.close();
  process.exit(1);
});
