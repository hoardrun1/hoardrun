# AWS Cognito Callback URL Configuration Fix

## Problem
The AWS Cognito app client has outdated callback URLs that don't match our current application configuration, causing a `redirect_mismatch` error.

## Current AWS Cognito Configuration (INCORRECT)
- `http://localhost:3000/auth/cognito/callback`
- `http://localhost:3001/auth/cognito/callback` 
- `http://localhost:3002/auth/cognito/callback`
- `https://hoardrun.vercel.app`
- `https://hoardrun.vercel.app/auth/cognito/callback`

## Required AWS Cognito Configuration (CORRECT)
You need to update the **Allowed callback URLs** in your AWS Cognito app client to:

### Development URLs:
- `http://localhost:3000/api/auth/flexible-callback`

### Production URLs:
- `https://hoardruns.vercel.app/api/auth/flexible-callback`

## Steps to Fix:

1. **Go to AWS Cognito Console:**
   - Navigate to: https://us-east-1.console.aws.amazon.com/cognito/v2/idp/user-pools/us-east-1_XU7qLoAyX/app-integration/clients/11jcq80atebuijov111g5lomu3

2. **Edit App Client:**
   - Click the "Edit" button in the top right
   - Scroll down to "Hosted UI settings"

3. **Update Allowed callback URLs:**
   Replace the current URLs with:
   ```
   http://localhost:3000/api/auth/flexible-callback
   https://hoardruns.vercel.app/api/auth/flexible-callback
   ```

4. **Update Allowed sign-out URLs:**
   Make sure these are set to:
   ```
   http://localhost:3000
   https://hoardruns.vercel.app
   ```

5. **Save Changes:**
   - Click "Save changes" at the bottom

## Verification
After making these changes, the OAuth flow should work correctly and you should no longer see the `redirect_mismatch` error.

## Current Environment Configuration
Our application is already correctly configured with:
- **Development:** `COGNITO_REDIRECT_URI=http://localhost:3000/api/auth/flexible-callback`
- **Production:** `COGNITO_REDIRECT_URI=https://hoardruns.vercel.app/api/auth/flexible-callback`

The issue is purely on the AWS Cognito side - the app client configuration needs to be updated to match our application.
