# AWS Cognito Email Verification Tests

This directory contains comprehensive tests to verify that AWS Cognito email verification is working correctly in your application.

## Overview

The tests validate the complete email verification flow:
1. **Configuration Check** - Verifies AWS credentials and environment variables
2. **Signup Email Sending** - Tests direct AWS Cognito user creation and email sending
3. **Resend Verification** - Tests the resend verification email functionality
4. **API Endpoints** - Tests the Next.js API routes for signup and verification

## Files

- `email-verification.test.js` - Main test suite with comprehensive AWS Cognito testing
- `run-email-tests.js` - Simple test runner script
- `README.md` - This documentation file
- `results/` - Directory where test results are saved (created automatically)

## Prerequisites

### Required Environment Variables

Make sure these environment variables are set in your `.env.local` file:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# AWS Cognito Configuration
COGNITO_CLIENT_ID=your_cognito_client_id
COGNITO_USER_POOL_ID=your_cognito_user_pool_id

# Application Configuration (for API endpoint testing)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Required Dependencies

The AWS SDK dependency should already be installed:
```bash
npm install @aws-sdk/client-cognito-identity-provider
```

## Running the Tests

### Method 1: Using npm scripts (Recommended)

```bash
# Run the email verification tests
npm run test:email

# Alternative command
npm run test:email-verification
```

### Method 2: Direct execution

```bash
# Run with the test runner
node tests/run-email-tests.js

# Run the test file directly
node tests/email-verification.test.js
```

### Method 3: With your development server running

For the most comprehensive testing, start your Next.js development server first:

```bash
# Terminal 1: Start the development server
npm run dev

# Terminal 2: Run the tests
npm run test:email
```

## Test Results

### Console Output

The tests provide colored console output:
- 🔵 **Info** - General information and progress
- 🟢 **Success** - Successful operations
- 🔴 **Error** - Failed operations or errors
- 🟡 **Warning** - Warnings and cleanup notices

### Saved Results

Test results are automatically saved to `tests/results/` with timestamps:
```
tests/results/email-verification-test-2024-01-15T10-30-45-123Z.json
```

## What Each Test Does

### 1. Configuration Test
- Checks if all required environment variables are present
- Validates AWS credentials by making a test API call
- Verifies Cognito client configuration

### 2. Signup Email Sending Test
- Creates a new test user in AWS Cognito
- Triggers automatic verification email sending
- Captures and displays email delivery details
- Records the user for cleanup

### 3. Resend Verification Test
- Tests the resend verification email functionality
- Uses the user created in the signup test
- Verifies that resend requests work correctly

### 4. API Endpoints Test
- Tests your Next.js `/api/sign-up` endpoint
- Verifies that the API correctly integrates with AWS Cognito
- Checks response format and error handling

## Understanding Test Results

### Successful Test Output Example
```
🚀 Starting AWS Cognito Email Verification Tests
============================================================
🧪 Testing Email Delivery Configuration...
✅ All required environment variables are set
✅ AWS credentials and Cognito configuration are valid

🧪 Testing AWS Cognito Signup Email Sending...
✅ Signup successful! User created with ID: 12345678-1234-1234-1234-123456789012
📧 Verification email should be sent to: test-1642248645123@example.com
🔍 CodeDeliveryDetails: {"AttributeName":"email","DeliveryMedium":"EMAIL","Destination":"t***@example.com"}

🧪 Testing Resend Verification Email...
✅ Resend verification email successful!

🧪 Testing API Endpoints...
✅ Signup API endpoint working correctly

============================================================
📊 Test Results Summary:
configuration: ✅ PASS
signup: ✅ PASS
resend: ✅ PASS
apiEndpoints: ✅ PASS

🎯 Overall Test Result: ✅ ALL TESTS PASSED
```

### Common Issues and Solutions

#### Missing Environment Variables
```
❌ Missing environment variables: AWS_ACCESS_KEY_ID, COGNITO_CLIENT_ID
```
**Solution**: Add the missing variables to your `.env.local` file.

#### Invalid AWS Credentials
```
❌ Configuration test failed: The security token included in the request is invalid
```
**Solution**: Check your AWS credentials and ensure they have the correct permissions.

#### Cognito Client ID Issues
```
❌ Signup failed: Invalid client id
```
**Solution**: Verify your `COGNITO_CLIENT_ID` is correct and the client exists.

#### API Endpoint Not Running
```
❌ API endpoint test failed: fetch failed
```
**Solution**: Make sure your Next.js development server is running (`npm run dev`).

## Email Verification Flow Testing

### Manual Verification Test

After running the automated tests, you can manually test the complete flow:

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to signup page**:
   ```
   http://localhost:3000/signup
   ```

3. **Create a test account** with a real email address you can access

4. **Check your email** for the AWS Cognito verification email

5. **Use the verification code** on the check-email page

### Expected Email Content

AWS Cognito sends emails with:
- **Subject**: "Your verification code"
- **Content**: A 6-digit verification code
- **Sender**: Configured in your Cognito User Pool settings

## Troubleshooting

### Test User Cleanup

The tests create temporary users for testing. These users need manual cleanup:

1. **AWS Console Method**:
   - Go to AWS Cognito Console
   - Select your User Pool
   - Find users starting with "test-" or "api-test-"
   - Delete them manually

2. **AWS CLI Method**:
   ```bash
   aws cognito-idp admin-delete-user \
     --user-pool-id YOUR_USER_POOL_ID \
     --username test-user-email@example.com
   ```

### Email Delivery Issues

If emails aren't being delivered:

1. **Check AWS SES Configuration**:
   - Verify your domain/email is verified in SES
   - Check if you're in SES sandbox mode
   - Review SES sending limits

2. **Check Cognito Email Configuration**:
   - Verify email settings in Cognito User Pool
   - Check if custom email configuration is set up correctly

3. **Check Spam Folders**:
   - AWS emails might end up in spam
   - Add AWS sender to your email whitelist

## Advanced Usage

### Custom Test Configuration

You can modify the test configuration in `email-verification.test.js`:

```javascript
const TEST_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  clientId: process.env.COGNITO_CLIENT_ID,
  testEmail: 'your-test-email@example.com', // Use your own email
  testPassword: 'YourTestPassword123!',
  testName: 'Your Test Name'
};
```

### Running Individual Tests

You can run individual test methods by modifying the `runAllTests()` method:

```javascript
// Run only configuration test
const results = {
  configuration: await this.testEmailDeliveryConfiguration()
};
```

## Integration with CI/CD

To use these tests in your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Test Email Verification
  run: npm run test:email
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    COGNITO_CLIENT_ID: ${{ secrets.COGNITO_CLIENT_ID }}
    AWS_REGION: us-east-1
```

## Support

If you encounter issues with the tests:

1. Check the console output for specific error messages
2. Review the saved test results in `tests/results/`
3. Verify your AWS and Cognito configuration
4. Ensure all environment variables are correctly set
5. Check that your development server is running for API tests

The tests are designed to provide detailed feedback to help you identify and resolve any email verification issues in your application.
