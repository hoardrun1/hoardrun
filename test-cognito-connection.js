const { CognitoIdentityProviderClient, ListUserPoolsCommand } = require('@aws-sdk/client-cognito-identity-provider');

async function testCognitoConnection() {
  console.log('Testing AWS Cognito connection...');
  
  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Test basic connectivity by listing user pools
    const command = new ListUserPoolsCommand({ MaxResults: 1 });
    const response = await client.send(command);
    console.log('✅ AWS Cognito connection successful!');
    console.log('User pools found:', response.UserPools?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ AWS Cognito connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    return false;
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testCognitoConnection();
