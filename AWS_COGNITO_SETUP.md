# AWS Cognito Authentication Setup Guide

## 🎯 **Overview**

We'll set up AWS Cognito to replace Firebase authentication in production. This will give you:
- ✅ Enterprise-grade authentication
- ✅ Better production scalability
- ✅ AWS ecosystem integration
- ✅ More reliable email delivery
- ✅ Advanced security features

## 🔧 **Step 1: Create AWS Cognito User Pool**

### **In AWS Console (I opened it for you):**

1. **Go to Amazon Cognito** → **User pools**
2. **Click "Create user pool"**

### **Configure User Pool:**

#### **Step 1: Configure sign-in experience**
- **Cognito user pool sign-in options**: ✅ Email
- **User name requirements**: Email address
- **Click "Next"**

#### **Step 2: Configure security requirements**
- **Password policy**: Default (or customize as needed)
- **Multi-factor authentication**: Optional (recommended: Optional MFA)
- **User account recovery**: ✅ Enable self-service account recovery
- **Recovery methods**: ✅ Email only
- **Click "Next"**

#### **Step 3: Configure sign-up experience**
- **Self-registration**: ✅ Enable self-registration
- **Cognito-assisted verification**: ✅ Allow Cognito to automatically send messages
- **Verifying attribute changes**: ✅ Keep original attribute value active when an update is pending
- **Required attributes**: 
  - ✅ email
  - ✅ name (optional, but recommended)
- **Click "Next"**

#### **Step 4: Configure message delivery**
- **Email provider**: Send email with Cognito (for now)
- **FROM email address**: Use default
- **Reply-to email address**: Leave blank or add your support email
- **Click "Next"**

#### **Step 5: Integrate your app**
- **User pool name**: `hoardrun-user-pool`
- **App client name**: `hoardrun-web-client`
- **Client secret**: ❌ Don't generate (for web apps)
- **Authentication flows**: 
  - ✅ ALLOW_USER_PASSWORD_AUTH
  - ✅ ALLOW_REFRESH_TOKEN_AUTH
  - ✅ ALLOW_USER_SRP_AUTH
- **Click "Next"**

#### **Step 6: Review and create**
- **Review all settings**
- **Click "Create user pool"**

## 📝 **Step 2: Get Configuration Values**

After creating the user pool, you'll need these values:

1. **User Pool ID**: `us-east-1_XXXXXXXXX`
2. **App Client ID**: `xxxxxxxxxxxxxxxxxxxxxxxxxx`
3. **AWS Region**: `us-east-1` (or your chosen region)

## 🔧 **Step 3: Environment Variables**

Add these to your `.env` file and Vercel:

```env
# AWS Cognito Configuration
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# For client-side (Next.js)
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# AWS Credentials (for server-side operations)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

## 📋 **Next Steps**

1. **Create the User Pool** (follow steps above)
2. **Get configuration values**
3. **Install AWS SDK** (I'll help with this)
4. **Create Cognito authentication service**
5. **Update your application code**
6. **Test the integration**

## 🎯 **Benefits of AWS Cognito**

- **Reliable email delivery** (no spam folder issues)
- **Enterprise security** features
- **Scalable** to millions of users
- **AWS ecosystem** integration
- **Compliance** ready (SOC, PCI DSS, etc.)
- **Advanced features** (MFA, custom auth flows, etc.)

Let me know when you've created the User Pool and I'll help you with the next steps!
