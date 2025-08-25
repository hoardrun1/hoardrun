const { CognitoIdentityProviderClient, ListUserPoolsCommand } = require('@aws-sdk/client-cognito-identity-provider');
require('dotenv').config({ path: '.env.local' });

async function testAwsSdkSpecific() {
  console.log('🔍 AWS SDK Specific Issue Diagnosis');
  console.log('====================================\n');

  console.log('✅ Network connectivity confirmed (curl worked)');
  console.log('✅ AWS Console access confirmed (screenshot shows access)');
  console.log('🔍 Testing AWS SDK specific configurations...\n');

  // Test 1: Basic client creation
  console.log('1. Testing AWS SDK Client Creation:');
  try {
    const client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });
    console.log('   ✅ Client created successfully');
  } catch (error) {
    console.log('   ❌ Client creation failed:', error.message);
    return;
  }

  // Test 2: Test with different timeout settings
  console.log('\n2. Testing with Extended Timeout:');
  const clientWithTimeout = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    requestHandler: {
      requestTimeout: 60000, // 60 seconds
      connectionTimeout: 30000, // 30 seconds
    },
    maxAttempts: 1, // Single attempt to avoid retries
  });

  try {
    console.log('   Attempting ListUserPools with 60s timeout...');
    const command = new ListUserPoolsCommand({ MaxResults: 1 });
    const response = await clientWithTimeout.send(command);
    console.log('   ✅ Extended timeout test successful!');
    console.log('   📊 User pools found:', response.UserPools?.length || 0);
    
    if (response.UserPools && response.UserPools.length > 0) {
      console.log('   📋 First pool:', response.UserPools[0].Name);
    }
  } catch (error) {
    console.log('   ❌ Extended timeout test failed:');
    console.log('   Error name:', error.name);
    console.log('   Error code:', error.code);
    console.log('   Error message:', error.message);
    
    // Check if it's still a timeout
    if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
      console.log('   🔍 Still timing out - this suggests AWS SDK issue, not network');
    }
  }

  // Test 3: Test with different AWS SDK version approach
  console.log('\n3. Testing Alternative SDK Configuration:');
  try {
    const alternativeClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      endpoint: `https://cognito-idp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`,
      forcePathStyle: false,
      useAccelerateEndpoint: false,
      useDualstackEndpoint: false,
    });

    console.log('   Attempting with explicit endpoint configuration...');
    const altCommand = new ListUserPoolsCommand({ MaxResults: 1 });
    const altResponse = await alternativeClient.send(altCommand);
    console.log('   ✅ Alternative configuration successful!');
    console.log('   📊 User pools found:', altResponse.UserPools?.length || 0);
  } catch (error) {
    console.log('   ❌ Alternative configuration failed:', error.message);
  }

  // Test 4: Check AWS SDK version
  console.log('\n4. AWS SDK Version Information:');
  try {
    const packageJson = require('./package.json');
    const awsSdkVersion = packageJson.dependencies['@aws-sdk/client-cognito-identity-provider'];
    console.log('   📦 AWS SDK Version:', awsSdkVersion);
    
    // Check if it's a very recent version that might have issues
    if (awsSdkVersion.includes('3.873.0')) {
      console.log('   ⚠️  Using very recent SDK version - might have compatibility issues');
    }
  } catch (error) {
    console.log('   ❌ Could not read package.json:', error.message);
  }

  console.log('\n🎯 Diagnosis Complete!');
  console.log('\nKey Findings:');
  console.log('- Network connectivity: ✅ Working (curl successful)');
  console.log('- AWS Console access: ✅ Working (screenshot confirmed)');
  console.log('- Issue is likely: AWS SDK configuration or version specific');
}

testAwsSdkSpecific().catch(console.error);
