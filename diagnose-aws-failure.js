const { CognitoIdentityProviderClient, ListUserPoolsCommand, DescribeUserPoolCommand } = require('@aws-sdk/client-cognito-identity-provider');
require('dotenv').config({ path: '.env.local' });

async function diagnoseAwsFailure() {
  console.log('🔍 AWS Cognito Connection Diagnosis');
  console.log('=====================================\n');

  // Check environment variables
  console.log('1. Environment Variables Check:');
  console.log('   AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
  console.log('   AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
  console.log('   AWS_REGION:', process.env.AWS_REGION || 'us-east-1');
  console.log('   COGNITO_USER_POOL_ID:', process.env.COGNITO_USER_POOL_ID ? '✅ Set' : '❌ Missing');
  console.log();

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('❌ AWS credentials are missing. Cannot proceed with tests.');
    return;
  }

  // Test 1: Basic connectivity with timeout
  console.log('2. Testing Basic AWS Connectivity:');
  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    requestHandler: {
      requestTimeout: 10000, // 10 seconds timeout
    }
  });

  try {
    console.log('   Attempting to list user pools...');
    const command = new ListUserPoolsCommand({ MaxResults: 1 });
    const response = await client.send(command);
    console.log('   ✅ Basic connectivity successful!');
    console.log('   📊 User pools found:', response.UserPools?.length || 0);
  } catch (error) {
    console.log('   ❌ Basic connectivity failed:');
    console.log('   Error Type:', error.constructor.name);
    console.log('   Error Code:', error.code || 'N/A');
    console.log('   Error Message:', error.message);
    
    if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
      console.log('   🔍 This is a TIMEOUT error - possible causes:');
      console.log('      - Network connectivity issues');
      console.log('      - Firewall blocking AWS endpoints');
      console.log('      - DNS resolution problems');
      console.log('      - AWS service outage');
    } else if (error.code === 'InvalidUserPoolConfiguration' || error.code === 'AccessDenied') {
      console.log('   🔍 This is a PERMISSIONS error - possible causes:');
      console.log('      - Invalid AWS credentials');
      console.log('      - Insufficient IAM permissions');
      console.log('      - Credentials expired');
    }
    console.log();
    return;
  }

  // Test 2: Specific User Pool access
  if (process.env.COGNITO_USER_POOL_ID) {
    console.log('3. Testing Specific User Pool Access:');
    try {
      console.log('   Attempting to describe user pool:', process.env.COGNITO_USER_POOL_ID);
      const describeCommand = new DescribeUserPoolCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID
      });
      const poolResponse = await client.send(describeCommand);
      console.log('   ✅ User pool access successful!');
      console.log('   📋 Pool Name:', poolResponse.UserPool?.Name || 'N/A');
      console.log('   📧 Email Config:', poolResponse.UserPool?.EmailConfiguration ? '✅ Configured' : '❌ Not configured');
      console.log('   📱 SMS Config:', poolResponse.UserPool?.SmsConfiguration ? '✅ Configured' : '❌ Not configured');
      
      // Check for phone number verification
      const attributes = poolResponse.UserPool?.Schema || [];
      const phoneAttribute = attributes.find(attr => attr.Name === 'phone_number');
      console.log('   📞 Phone Number Support:', phoneAttribute ? '✅ Enabled' : '❌ Not enabled');
      
    } catch (error) {
      console.log('   ❌ User pool access failed:');
      console.log('   Error Code:', error.code || 'N/A');
      console.log('   Error Message:', error.message);
    }
  }

  // Test 3: Network connectivity to AWS endpoints
  console.log('\n4. Testing Network Connectivity:');
  try {
    const https = require('https');
    const testEndpoint = `cognito-idp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;
    
    await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: testEndpoint,
        port: 443,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log('   ✅ Network connectivity to AWS endpoint successful');
        console.log('   📡 Status Code:', res.statusCode);
        resolve();
      });
      
      req.on('error', (error) => {
        console.log('   ❌ Network connectivity failed:');
        console.log('   Error:', error.message);
        reject(error);
      });
      
      req.on('timeout', () => {
        console.log('   ❌ Network request timed out');
        req.destroy();
        reject(new Error('Timeout'));
      });
      
      req.end();
    });
  } catch (error) {
    console.log('   Network test failed:', error.message);
  }

  console.log('\n🎯 Diagnosis Complete!');
}

diagnoseAwsFailure().catch(console.error);
