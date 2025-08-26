# Production Google OAuth Setup

## 🎯 Overview

This guide helps you set up Google OAuth for **production use** where **any Google user** can sign in to your application.

## ⚠️ Important: Development vs Production

### Development (Current Setup)
- ✅ Good for: Team development and testing
- ❌ Limited to: 100 test users maximum
- ❌ Shows: "This app isn't verified" warnings
- ❌ Requires: Manually adding each user

### Production (This Guide)
- ✅ Good for: Real clients and users
- ✅ Supports: Unlimited Google users
- ✅ Shows: Professional, verified appearance
- ✅ No manual user management needed

## 🚀 Production Setup Steps

### Step 1: Complete OAuth Consent Screen

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project**
3. **Navigate to**: APIs & Services → OAuth consent screen
4. **Fill out ALL required fields**:

#### App Information
```
App name: HoardRun
User support email: your-business-email@domain.com
App logo: Upload 120x120px logo
```

#### App Domain
```
Application home page: https://yourdomain.com
Application privacy policy link: https://yourdomain.com/privacy
Application terms of service link: https://yourdomain.com/terms
```

#### Authorized Domains
```
yourdomain.com
www.yourdomain.com
```

#### Developer Contact Information
```
Add your business email addresses
```

### Step 2: Create Production OAuth Credentials

1. **Go to**: APIs & Services → Credentials
2. **Create new OAuth 2.0 Client ID**:
   - Name: `HoardRun Production`
   - Type: Web application
   
3. **Add Authorized Redirect URIs**:
   ```
   https://yourdomain.com/api/auth/callback/google
   https://www.yourdomain.com/api/auth/callback/google
   ```

4. **Copy credentials** for production environment

### Step 3: Environment Configuration

#### Production Environment Variables
```bash
# Production .env (or deployment platform)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secure-production-secret

# Production Google OAuth
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-client-id
```

#### Development Environment Variables
```bash
# Development .env.local (keep separate)
NEXTAUTH_URL=http://localhost:3004
NEXTAUTH_SECRET=your-dev-secret

# Development Google OAuth (for team testing)
GOOGLE_CLIENT_ID=your-dev-client-id
GOOGLE_CLIENT_SECRET=your-dev-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-dev-client-id
```

### Step 4: Publish Your App

1. **Review all information** in OAuth consent screen
2. **Click "PUBLISH APP"**
3. **Submit for verification** (if prompted)

#### Verification Process
- **Timeline**: Can take 1-6 weeks
- **Requirements**: Complete app information, privacy policy, terms of service
- **Review**: Google will review your app for compliance
- **Status**: Check verification status in console

### Step 5: Deploy to Production

1. **Deploy your app** with production environment variables
2. **Test Google OAuth** with any Google account
3. **Verify**: No "unverified app" warnings appear

## 🔧 Multi-Environment Setup

### Recommended Architecture

```
Development Environment:
├── OAuth App: "HoardRun Development"
├── Test Users: Limited to team members
├── Domain: localhost:3004
└── Purpose: Team development

Production Environment:
├── OAuth App: "HoardRun Production"  
├── Users: Any Google user
├── Domain: yourdomain.com
└── Purpose: Real clients
```

### Benefits of Separate Apps
- ✅ **Security**: Production credentials never used in development
- ✅ **Testing**: Can test without affecting production
- ✅ **Compliance**: Separate audit trails
- ✅ **Flexibility**: Different configurations per environment

## 📋 Pre-Launch Checklist

### OAuth Consent Screen
- [ ] App name and logo set
- [ ] Privacy policy URL working
- [ ] Terms of service URL working
- [ ] Support email configured
- [ ] Authorized domains added

### OAuth Credentials
- [ ] Production client ID created
- [ ] Correct redirect URIs configured
- [ ] Credentials added to production environment
- [ ] Test authentication flow works

### App Verification
- [ ] App published (not in testing mode)
- [ ] Verification submitted (if required)
- [ ] No "unverified app" warnings

### Legal Pages
- [ ] Privacy policy accessible at /privacy
- [ ] Terms of service accessible at /terms
- [ ] Contact information accurate
- [ ] Legal compliance reviewed

## 🚨 Common Issues

### "This app isn't verified"
- **Cause**: App still in testing mode
- **Solution**: Publish app and complete verification

### "redirect_uri_mismatch" in production
- **Cause**: Production domain not in authorized URIs
- **Solution**: Add exact production URL to OAuth credentials

### Users can't sign in
- **Cause**: App not published or verification pending
- **Solution**: Publish app, wait for verification

## 🔒 Security Considerations

### Production Security
- Use strong, unique NEXTAUTH_SECRET
- Enable HTTPS only
- Regularly rotate OAuth credentials
- Monitor OAuth usage in Google Console

### Compliance
- Ensure privacy policy is accurate
- Follow Google's OAuth policies
- Implement proper data handling
- Regular security audits

## 📞 Support

If you encounter issues:
1. Check Google Cloud Console for error messages
2. Review OAuth consent screen completeness
3. Verify all URLs are accessible
4. Contact Google Cloud Support if needed

---

**Next Steps**: Once verification is complete, any Google user can sign in to your application! 🎉
