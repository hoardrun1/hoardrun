#!/usr/bin/env node

/**
 * Simple test runner for AWS Cognito Email Verification
 * Usage: node tests/run-email-tests.js
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { runEmailVerificationTests } = require('./email-verification.test.js');

console.log('🚀 Starting AWS Cognito Email Verification Tests...\n');

// Check if required dependencies are available
try {
  require('@aws-sdk/client-cognito-identity-provider');
} catch (error) {
  console.error('❌ Missing required dependency: @aws-sdk/client-cognito-identity-provider');
  console.error('Please install it with: npm install @aws-sdk/client-cognito-identity-provider');
  process.exit(1);
}

// Run the tests
runEmailVerificationTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
