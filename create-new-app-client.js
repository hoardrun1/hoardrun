const { CognitoIdentityProviderClient, CreateUserPoolClientCommand, DescribeUserPoolClientCommand } = require('@aws-sdk/client-cognito-identity-provider');

async function createNewAppClient() {
  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const userPoolId = process.env.COGNITO_USER_POOL_ID || 'us-east-1_XU7qLoAyX';

  try {
    console.log('Creating new app client with minimal required attributes...');
    
    const createCommand = new CreateUserPoolClientCommand({
      UserPoolId: userPoolId,
      ClientName: 'hoardrun-minimal-oauth-client',
      GenerateSecret: true,
      RefreshTokenValidity: 30,
      AccessTokenValidity: 60,
      IdTokenValidity: 60,
      TokenValidityUnits: {
        AccessToken: 'minutes',
        IdToken: 'minutes',
        RefreshToken: 'days',
      },
      ReadAttributes: [
        'email',
        'email_verified',
        'name',
        'given_name',
        'family_name',
        'picture'
      ],
      WriteAttributes: [
        'email',
        'name',
        'given_name',
        'family_name'
      ],
      ExplicitAuthFlows: [
        'ALLOW_CUSTOM_AUTH',
        'ALLOW_USER_SRP_AUTH',
        'ALLOW_REFRESH_TOKEN_AUTH'
      ],
      SupportedIdentityProviders: ['COGNITO', 'Google'],
      CallbackURLs: [
        'http://localhost:3000/api/auth/flexible-callback',
        'http://localhost:3001/api/auth/flexible-callback',
        'https://hoardruns.vercel.app/api/auth/flexible-callback'
      ],
      LogoutURLs: [
        'http://localhost:3000/signin',
        'http://localhost:3001/signin',
        'https://hoardruns.vercel.app/signin'
      ],
      AllowedOAuthFlows: ['code'],
      AllowedOAuthScopes: ['email', 'openid'],
      AllowedOAuthFlowsUserPoolClient: true,
      PreventUserExistenceErrors: 'ENABLED'
    });

    const result = await client.send(createCommand);
    console.log('✅ Successfully created new app client!');
    console.log('Client ID:', result.UserPoolClient.ClientId);
    console.log('Client Secret:', result.UserPoolClient.ClientSecret);
    
    console.log('\n📝 Update your .env.local file with these new values:');
    console.log(`NEXT_PUBLIC_COGNITO_CLIENT_ID=${result.UserPoolClient.ClientId}`);
    console.log(`COGNITO_CLIENT_ID=${result.UserPoolClient.ClientId}`);
    console.log(`COGNITO_CLIENT_SECRET=${result.UserPoolClient.ClientSecret}`);
    
    // Verify the new client
    const describeCommand = new DescribeUserPoolClientCommand({
      UserPoolId: userPoolId,
      ClientId: result.UserPoolClient.ClientId,
    });
    
    const clientDetails = await client.send(describeCommand);
    console.log('\n✅ New client configuration:');
    console.log('Read Attributes:', clientDetails.UserPoolClient.ReadAttributes);
    console.log('Write Attributes:', clientDetails.UserPoolClient.WriteAttributes);
    console.log('OAuth Scopes:', clientDetails.UserPoolClient.AllowedOAuthScopes);

  } catch (error) {
    console.error('❌ Error creating app client:', error);
    
    if (error.name === 'AccessDeniedException') {
      console.log('\n💡 You need to grant the following permissions to your AWS user:');
      console.log('   - cognito-idp:CreateUserPoolClient');
      console.log('   - cognito-idp:DescribeUserPoolClient');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

createNewAppClient();
