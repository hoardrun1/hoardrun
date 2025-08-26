# Google OAuth Setup for Developers

## 🚀 Quick Setup for Team Members

### Prerequisites
- You must be added as a test user in the Google Cloud Console
- Contact the project admin to add your Gmail address to the test users list

### Environment Setup

1. **Copy the shared credentials** to your `.env.local` file:
   ```bash
   # Google OAuth Configuration (Development)
   GOOGLE_CLIENT_ID=YOUR_SHARED_CLIENT_ID
   GOOGLE_CLIENT_SECRET=YOUR_SHARED_CLIENT_SECRET
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_SHARED_CLIENT_ID
   ```

2. **Ensure your NEXTAUTH_URL matches your local port**:
   ```bash
   NEXTAUTH_URL=http://localhost:YOUR_PORT
   ```

### Testing Google OAuth

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit the debug page**:
   - Go to `http://localhost:YOUR_PORT/auth/debug`
   - Verify your configuration

3. **Test Google login**:
   - Go to `http://localhost:YOUR_PORT/signin`
   - Click "Continue with Google"
   - Sign in with your Gmail account (must be added as test user)

### Troubleshooting

#### "Access blocked" error
- **Cause**: Your email is not added as a test user
- **Solution**: Ask project admin to add your Gmail address

#### "redirect_uri_mismatch" error
- **Cause**: Your local port doesn't match the configured redirect URIs
- **Solution**: Use one of these ports: 3000, 3001, 3002, 3003, 3004

#### "This app isn't verified" warning
- **Cause**: The app is in testing mode
- **Solution**: Click "Advanced" → "Go to HoardRun (unsafe)" - this is normal for development

### Supported Ports

The OAuth app is configured for these localhost ports:
- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3001/api/auth/callback/google`
- `http://localhost:3002/api/auth/callback/google`
- `http://localhost:3003/api/auth/callback/google`
- `http://localhost:3004/api/auth/callback/google`

### Need Help?

1. Check the debug page: `http://localhost:YOUR_PORT/auth/debug`
2. Verify you're added as a test user
3. Ensure you're using a supported port
4. Contact the project admin if issues persist

## 🔒 Security Notes

- **Never commit** OAuth credentials to version control
- **Keep credentials secure** and only share with trusted team members
- **Use environment variables** for all sensitive configuration
- **Rotate credentials** if they're ever compromised
