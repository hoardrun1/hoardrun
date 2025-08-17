# Social Authentication Implementation

This document explains how Google and Apple social authentication is implemented in the Hoardrun application.

## Overview

The social authentication system allows users to sign up and sign in using their Google or Apple accounts. The implementation includes:

- **Google OAuth 2.0** integration
- **Apple Sign In** integration
- Automatic user creation and login
- JWT token generation for session management

## Current Implementation (Development Mode)

### Mock Authentication
For development and testing purposes, the system uses mock tokens:
- Google: `mock-google-id-token`
- Apple: `mock-apple-identity-token`

These mock tokens simulate the OAuth flow and create test users with predefined email addresses:
- Google: `user@gmail.com`
- Apple: `user@icloud.com`

### API Endpoints

#### Google OAuth: `/api/auth/google`
- **Method**: POST
- **Body**: `{ idToken: string, action: 'signin' | 'signup' }`
- **Response**: `{ success: boolean, token: string, user: object, message: string }`

#### Apple Sign In: `/api/auth/apple`
- **Method**: POST
- **Body**: `{ identityToken: string, action: 'signin' | 'signup' }`
- **Response**: `{ success: boolean, token: string, user: object, message: string }`

## Frontend Integration

### Signup Page (`components/signup-page.tsx`)
- Google and Apple buttons trigger `handleSocialLogin(provider)`
- Shows loading states during authentication
- Automatically logs in user upon successful authentication
- Redirects to `/home` after successful signup

### Signin Page (`components/signin-page.tsx`)
- Similar implementation to signup page
- Handles both new user creation and existing user login
- Provides appropriate success messages

## Production Setup

To enable real OAuth in production:

### Google OAuth Setup
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Update environment variables:
   ```env
   GOOGLE_CLIENT_ID=your-actual-google-client-id
   GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
   GOOGLE_REDIRECT_URI=https://yourdomain.com
   ```

### Apple Sign In Setup
1. Register your app in [Apple Developer Console](https://developer.apple.com/)
2. Enable Sign in with Apple capability
3. Create a Service ID and private key
4. Update environment variables:
   ```env
   APPLE_CLIENT_ID=your-actual-apple-client-id
   APPLE_TEAM_ID=your-apple-team-id
   APPLE_KEY_ID=your-apple-key-id
   APPLE_PRIVATE_KEY=your-apple-private-key
   ```

### Frontend Libraries (Production)
For production, you would integrate:
- **Google**: `@google-cloud/local-auth` or Google Sign-In JavaScript library
- **Apple**: Apple's Sign in with Apple JS framework

## Security Features

- **Token Verification**: Real tokens are verified against provider APIs
- **JWT Generation**: Secure JWT tokens for session management
- **Password Hashing**: Random passwords for OAuth users (bcrypt)
- **Email Verification**: Skipped for OAuth users (trusted providers)

## Testing

To test the social authentication:

1. **Signup Flow**:
   - Go to `/signup`
   - Click "Continue with Google" or "Continue with Apple"
   - Should create account and redirect to `/home`

2. **Signin Flow**:
   - Go to `/signin`
   - Click "Continue with Google" or "Continue with Apple"
   - Should sign in existing user or create new account

## Error Handling

The system handles various error scenarios:
- Invalid tokens
- Network failures
- Duplicate email addresses
- Provider-specific errors

All errors are displayed to users with appropriate toast notifications.

## Future Enhancements

- Real OAuth provider integration
- Additional social providers (Facebook, Twitter, etc.)
- Enhanced user profile management
- OAuth token refresh handling
