# Team Onboarding Guide - Google OAuth Setup

## 🎯 Overview

This guide helps new team members set up Google OAuth authentication for local development of HoardRun.

## 🚀 Quick Start for New Developers

### Option 1: Automated Setup (Recommended)

Run the interactive setup script:

```bash
npm run setup:google-oauth
```

This script will guide you through:
- Using shared team credentials
- Setting up your own OAuth app
- Skipping Google OAuth (email/password only)

### Option 2: Manual Setup

1. **Get shared credentials from team lead**
2. **Update your `.env.local` file**:
   ```bash
   GOOGLE_CLIENT_ID=your-shared-client-id
   GOOGLE_CLIENT_SECRET=your-shared-client-secret
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-shared-client-id
   ```
3. **Ask team lead to add your Gmail as test user**

## 👥 For Team Leads

### Setting Up Shared OAuth App

1. **Create Google OAuth App** (if not done already):
   - Go to https://console.cloud.google.com/
   - Create project: "HoardRun Development"
   - Enable Google+ API
   - Configure OAuth consent screen
   - Create OAuth 2.0 credentials

2. **Configure Redirect URIs**:
   Add these URIs to support all common development ports:
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   http://localhost:3002/api/auth/callback/google
   http://localhost:3003/api/auth/callback/google
   http://localhost:3004/api/auth/callback/google
   ```

3. **Share Credentials Securely**:
   - Share Client ID and Secret via secure channel (not Slack/email)
   - Consider using password managers or encrypted files
   - Document which developers have access

### Adding New Team Members

1. **Add as Test User**:
   - Go to Google Cloud Console
   - Navigate to "OAuth consent screen"
   - Add developer's Gmail to "Test users"
   - Click "SAVE"

2. **Share Setup Instructions**:
   - Send them this onboarding guide
   - Provide shared OAuth credentials securely
   - Help them run the setup script

### Managing Test Users

**Current Test Users**: (Update this list)
- your-email@gmail.com (Team Lead)
- developer1@gmail.com
- developer2@gmail.com

**To Add New Test User**:
1. Google Cloud Console → OAuth consent screen
2. Scroll to "Test users" section
3. Click "ADD USERS"
4. Enter Gmail address
5. Click "SAVE"

## 🔧 Development Workflow

### Testing Google OAuth

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Check configuration**:
   - Visit: `http://localhost:YOUR_PORT/auth/debug`
   - Verify all settings are correct

3. **Test Google login**:
   - Go to: `http://localhost:YOUR_PORT/signin`
   - Click "Continue with Google"
   - Sign in with your Gmail (must be test user)

### Common Issues & Solutions

#### "Access blocked: This app's request is invalid"
- **Cause**: Not added as test user
- **Solution**: Ask team lead to add your Gmail

#### "redirect_uri_mismatch"
- **Cause**: Using unsupported port
- **Solution**: Use ports 3000-3004, or ask team lead to add your port

#### "This app isn't verified"
- **Cause**: App is in testing mode (normal)
- **Solution**: Click "Advanced" → "Go to HoardRun (unsafe)"

## 🔒 Security Best Practices

### For Team Leads

- **Rotate credentials** if team member leaves
- **Use separate OAuth apps** for development/staging/production
- **Monitor OAuth usage** in Google Cloud Console
- **Keep test user list updated**

### For Developers

- **Never commit** OAuth credentials to git
- **Use environment variables** only
- **Don't share credentials** outside the team
- **Report compromised credentials** immediately

## 📋 Troubleshooting Checklist

- [ ] Gmail address added as test user
- [ ] Correct OAuth credentials in `.env.local`
- [ ] Using supported port (3000-3004)
- [ ] Development server restarted after credential changes
- [ ] No typos in environment variables
- [ ] NEXTAUTH_URL matches your local port

## 🆘 Getting Help

1. **Check debug page**: `http://localhost:YOUR_PORT/auth/debug`
2. **Review this guide** and common issues
3. **Ask team lead** to verify your test user status
4. **Check Google Cloud Console** for OAuth app configuration
5. **Create GitHub issue** if problem persists

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Team Setup Script](../scripts/setup-google-oauth.js)
- [Developer OAuth Guide](./DEVELOPER_GOOGLE_OAUTH_SETUP.md)

---

**Last Updated**: [Current Date]
**Maintained By**: [Team Lead Name]
