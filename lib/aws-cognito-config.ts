// AWS Cognito Configuration
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'

// AWS Cognito configuration
export const cognitoConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
  clientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!,
}

// Server-side Cognito client
export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Client-side Cognito configuration for amazon-cognito-identity-js
export const clientCognitoConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
  userPoolWebClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!,
}

// Validate configuration
export function validateCognitoConfig() {
  const required = [
    'NEXT_PUBLIC_AWS_REGION',
    'NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID', 
    'NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required Cognito environment variables: ${missing.join(', ')}`)
  }
  
  return true
}
