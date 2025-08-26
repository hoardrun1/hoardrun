# AWS Cognito Redirect Mismatch - Complete Solution

## Problem Summary
You're getting a `redirect_mismatch` error when trying to sign in with AWS Cognito because the callback URLs configured in your AWS Cognito app client don't match the URLs your application is actually using.

## Root Cause
- **AWS Cognito Configuration:** Still has old callback URLs like `/auth/cognito/callback`
- **Application Configuration:** Now uses `/api/auth/flexible-callback`

## Solution Steps

### 1. Update AWS Cognito App Client Configuration

**Go to AWS Cognito Console:**
```
https://us-east-1.console.aws.amazon.com/cognito/v2/idp/user-pools/us-east-1_XU7qLoAyX/app-integration/clients/11jcq80atebuijov111g5lomu3
```

**Update the following settings:**

#### Allowed callback URLs:
Replace all existing URLs with:
```
http://localhost:3000/api/auth/flexible-callback
https://hoardruns.vercel.app/api/auth/flexible-callback
```

#### Allowed sign-out URLs:
```
http://localhost:3000
https://hoardruns.vercel.app
```

### 2. Application Configuration (Already Done)

✅ **Environment Variables:** Correctly configured in `.env.local` and `.env.production`
✅ **Flexible Callback Route:** Created at `/app/api/auth/flexible-callback/route.ts`
✅ **TypeScript Errors:** Fixed

### 3. Current Environment Configuration

#### Development (`.env.local`):
```
NEXT_PUBLIC_COGNITO_CLIENT_ID=11jcq80atebuijov111g5lomu3
NEXT_PUBLIC_COGNITO_DOMAIN=us-east-1xu7qloayx.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_REDIRECT_URI=http://localhost:3000/api/auth/flexible-callback
COGNITO_REDIRECT_URI=http://localhost:3000/api/auth/flexible-callback
```

#### Production (`.env.production`):
```
NEXT_PUBLIC_COGNITO_CLIENT_ID=11jcq80atebuijov111g5lomu3
NEXT_PUBLIC_COGNITO_DOMAIN=us-east-1xu7qloayx.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_REDIRECT_URI=https://hoardruns.vercel.app/api/auth/flexible-callback
COGNITO_REDIRECT_URI=https://hoardruns.vercel.app/api/auth/flexible-callback
```

### 4. How the OAuth Flow Works

1. **User clicks "Sign in with Google"** → Redirects to Cognito hosted UI
2. **User authenticates with Google** → Google redirects back to Cognito
3. **Cognito processes authentication** → Redirects to your callback URL with authorization code
4. **Your callback route** (`/api/auth/flexible-callback`) exchanges code for tokens
5. **Success** → User is redirected to `/auth/success` with session cookie

### 5. Testing the Fix

After updating the AWS Cognito configuration:

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test locally:**
   - Go to `http://localhost:3000/signin`
   - Click "Sign in with Google"
   - Should redirect to Cognito → Google → back to your app successfully

3. **Test in production:**
   - Deploy to Vercel
   - Go to `https://hoardruns.vercel.app/signin`
   - Test the same flow

### 6. Troubleshooting

If you still get errors after updating AWS Cognito:

1. **Check browser console** for any JavaScript errors
2. **Check server logs** in Vercel or your local terminal
3. **Verify environment variables** are loaded correctly
4. **Clear browser cache** and cookies
5. **Wait a few minutes** for AWS changes to propagate

### 7. Security Notes

- The current session implementation uses base64 encoding (not secure for production)
- Consider implementing proper JWT signing with a secret key
- The callback route handles errors gracefully and redirects to signin page with error messages

## Next Steps

1. **Update AWS Cognito configuration** (most important step)
2. **Test the authentication flow**
3. **Deploy to production and test there too**
4. **Consider implementing proper JWT security** for production use

The redirect mismatch error should be completely resolved once you update the AWS Cognito app client configuration to use the correct callback URLs.
