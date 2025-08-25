/**
 * AWS Cognito Email Verification Tests
 * Tests the complete email verification flow including signup, email sending, and verification
 */

const { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand, DeleteUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Test configuration
const TEST_CONFIG = {
  region: process.env.AWS_REGION || process.env.COGNITO_REGION || 'us-east-1',
  clientId: process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  testEmail: 'test-' + Date.now() + '@example.com',
  testPassword: 'TestPassword123!',
  testName: 'Test User'
};

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: TEST_CONFIG.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

class EmailVerificationTester {
  constructor() {
    this.testResults = [];
    this.createdUsers = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    this.testResults.push(logEntry);
    
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m'  // Yellow
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}\x1b[0m`);
  }

  async testSignupEmailSending() {
    this.log('🧪 Testing AWS Cognito Signup Email Sending...', 'info');
    
    try {
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
      this.createdUsers.push(TEST_CONFIG.testEmail);
      
      this.log(`✅ Signup successful! User created with ID: ${response.UserSub}`, 'success');
      this.log(`📧 Verification email should be sent to: ${TEST_CONFIG.testEmail}`, 'info');
      this.log(`🔍 CodeDeliveryDetails: ${JSON.stringify(response.CodeDeliveryDetails)}`, 'info');
      
      return {
        success: true,
        userSub: response.UserSub,
        codeDeliveryDetails: response.CodeDeliveryDetails
      };
    } catch (error) {
      this.log(`❌ Signup failed: ${error.message}`, 'error');
      this.log(`Error details: ${JSON.stringify(error, null, 2)}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testResendVerificationEmail() {
    this.log('🧪 Testing Resend Verification Email...', 'info');
    
    try {
      const resendCommand = new ResendConfirmationCodeCommand({
        ClientId: TEST_CONFIG.clientId,
        Username: TEST_CONFIG.testEmail
      });

      const response = await cognitoClient.send(resendCommand);
      
      this.log('✅ Resend verification email successful!', 'success');
      this.log(`🔍 CodeDeliveryDetails: ${JSON.stringify(response.CodeDeliveryDetails)}`, 'info');
      
      return {
        success: true,
        codeDeliveryDetails: response.CodeDeliveryDetails
      };
    } catch (error) {
      this.log(`❌ Resend verification failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testAPIEndpoints() {
    this.log('🧪 Testing API Endpoints...', 'info');
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    try {
      // Test signup API endpoint
      this.log('Testing /api/sign-up endpoint...', 'info');
      const signupResponse = await fetch(`${baseUrl}/api/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'api-test-' + Date.now() + '@example.com',
          password: TEST_CONFIG.testPassword,
          name: TEST_CONFIG.testName
        })
      });

      const signupData = await signupResponse.json();
      
      if (signupResponse.ok) {
        this.log('✅ Signup API endpoint working correctly', 'success');
        this.log(`Response: ${JSON.stringify(signupData)}`, 'info');
      } else {
        this.log(`❌ Signup API endpoint failed: ${signupData.error}`, 'error');
      }

      return { success: signupResponse.ok, data: signupData };
    } catch (error) {
      this.log(`❌ API endpoint test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testEmailDeliveryConfiguration() {
    this.log('🧪 Testing Email Delivery Configuration...', 'info');
    
    try {
      // Check if required environment variables are set
      const requiredChecks = [
        { name: 'AWS_ACCESS_KEY_ID', value: process.env.AWS_ACCESS_KEY_ID },
        { name: 'AWS_SECRET_ACCESS_KEY', value: process.env.AWS_SECRET_ACCESS_KEY },
        { name: 'AWS_REGION or COGNITO_REGION', value: process.env.AWS_REGION || process.env.COGNITO_REGION },
        { name: 'COGNITO_CLIENT_ID or NEXT_PUBLIC_COGNITO_CLIENT_ID', value: process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID }
      ];

      const missingVars = requiredChecks.filter(check => !check.value).map(check => check.name);
      
      if (missingVars.length > 0) {
        this.log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'error');
        return { success: false, error: 'Missing required environment variables' };
      }

      this.log('✅ All required environment variables are set', 'success');
      this.log(`🔧 Using AWS Region: ${TEST_CONFIG.region}`, 'info');
      this.log(`🔧 Using Cognito Client ID: ${TEST_CONFIG.clientId}`, 'info');
      
      // Test AWS credentials by making a simple call
      const testCommand = new SignUpCommand({
        ClientId: TEST_CONFIG.clientId,
        Username: 'test-credentials-' + Date.now() + '@example.com',
        Password: TEST_CONFIG.testPassword,
        UserAttributes: [
          { Name: 'email', Value: 'test-credentials-' + Date.now() + '@example.com' }
        ]
      });

      try {
        await cognitoClient.send(testCommand);
        this.log('✅ AWS credentials and Cognito configuration are valid', 'success');
        return { success: true };
      } catch (error) {
        if (error.name === 'UsernameExistsException') {
          this.log('✅ AWS credentials are valid (user already exists)', 'success');
          return { success: true };
        }
        throw error;
      }
    } catch (error) {
      this.log(`❌ Configuration test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async cleanup() {
    this.log('🧹 Cleaning up test users...', 'info');
    
    for (const email of this.createdUsers) {
      try {
        // Note: DeleteUserCommand requires the user to be authenticated
        // In a real test environment, you might want to use AdminDeleteUserCommand
        // with appropriate IAM permissions
        this.log(`⚠️  Manual cleanup required for user: ${email}`, 'warning');
      } catch (error) {
        this.log(`❌ Failed to cleanup user ${email}: ${error.message}`, 'error');
      }
    }
  }

  async runAllTests() {
    this.log('🚀 Starting AWS Cognito Email Verification Tests', 'info');
    this.log('=' .repeat(60), 'info');
    
    const results = {
      configuration: await this.testEmailDeliveryConfiguration(),
      signup: await this.testSignupEmailSending(),
      resend: await this.testResendVerificationEmail(),
      apiEndpoints: await this.testAPIEndpoints()
    };

    this.log('=' .repeat(60), 'info');
    this.log('📊 Test Results Summary:', 'info');
    
    Object.entries(results).forEach(([testName, result]) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      this.log(`${testName}: ${status}`, result.success ? 'success' : 'error');
    });

    await this.cleanup();
    
    const overallSuccess = Object.values(results).every(result => result.success);
    this.log(`\n🎯 Overall Test Result: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`, overallSuccess ? 'success' : 'error');
    
    return {
      success: overallSuccess,
      results,
      logs: this.testResults
    };
  }
}

// Main execution function
async function runEmailVerificationTests() {
  const tester = new EmailVerificationTester();
  
  try {
    const results = await tester.runAllTests();
    
    // Save results to file
    const fs = require('fs');
    const path = require('path');
    
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = path.join(resultsDir, `email-verification-test-${timestamp}.json`);
    
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n📄 Test results saved to: ${resultsFile}`);
    
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
module.exports = { EmailVerificationTester, runEmailVerificationTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runEmailVerificationTests();
}
