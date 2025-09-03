const { CognitoIdentityProviderClient, DescribeUserPoolCommand, UpdateUserPoolCommand } = require('@aws-sdk/client-cognito-identity-provider');

async function fixCognitoAttributes() {
  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const userPoolId = process.env.COGNITO_USER_POOL_ID || 'us-east-1_XU7qLoAyX';

  try {
    console.log('Fetching current User Pool configuration...');
    
    // Get current user pool configuration
    const describeCommand = new DescribeUserPoolCommand({
      UserPoolId: userPoolId,
    });
    
    const userPool = await client.send(describeCommand);
    console.log('Current required attributes:', userPool.UserPool.RequiredAttributes);
    console.log('Current schema attributes:', userPool.UserPool.Schema?.map(attr => ({
      name: attr.Name,
      required: attr.Required,
      mutable: attr.Mutable
    })));

    // Update user pool to remove birthdate and phone_number from required attributes
    const updateCommand = new UpdateUserPoolCommand({
      UserPoolId: userPoolId,
      // Remove birthdate and phone_number from required attributes
      RequiredAttributes: userPool.UserPool.RequiredAttributes?.filter(
        attr => attr !== 'birthdate' && attr !== 'phone_number'
      ) || ['email'],
      // Keep other existing settings
      Policies: userPool.UserPool.Policies,
      AutoVerifiedAttributes: userPool.UserPool.AutoVerifiedAttributes,
      AliasAttributes: userPool.UserPool.AliasAttributes,
      UsernameAttributes: userPool.UserPool.UsernameAttributes,
      SmsVerificationMessage: userPool.UserPool.SmsVerificationMessage,
      EmailVerificationMessage: userPool.UserPool.EmailVerificationMessage,
      EmailVerificationSubject: userPool.UserPool.EmailVerificationSubject,
      VerificationMessageTemplate: userPool.UserPool.VerificationMessageTemplate,
      SmsAuthenticationMessage: userPool.UserPool.SmsAuthenticationMessage,
      MfaConfiguration: userPool.UserPool.MfaConfiguration,
      DeviceConfiguration: userPool.UserPool.DeviceConfiguration,
      EmailConfiguration: userPool.UserPool.EmailConfiguration,
      SmsConfiguration: userPool.UserPool.SmsConfiguration,
      UserPoolTags: userPool.UserPool.UserPoolTags,
      AdminCreateUserConfig: userPool.UserPool.AdminCreateUserConfig,
      UserPoolAddOns: userPool.UserPool.UserPoolAddOns,
      UsernameConfiguration: userPool.UserPool.UsernameConfiguration,
      AccountRecoverySetting: userPool.UserPool.AccountRecoverySetting,
    });

    console.log('Updating User Pool configuration...');
    await client.send(updateCommand);
    console.log('✅ Successfully updated User Pool configuration!');
    console.log('✅ Removed birthdate and phone_number from required attributes');
    
    // Verify the update
    const verifyCommand = new DescribeUserPoolCommand({
      UserPoolId: userPoolId,
    });
    
    const updatedUserPool = await client.send(verifyCommand);
    console.log('Updated required attributes:', updatedUserPool.UserPool.RequiredAttributes);

  } catch (error) {
    console.error('❌ Error updating User Pool:', error);
    
    if (error.name === 'InvalidParameterException') {
      console.log('\n💡 Alternative solution: The User Pool configuration might be locked.');
      console.log('   You can try creating a new app client with different settings.');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

fixCognitoAttributes();
