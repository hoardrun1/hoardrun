# 🚀 Complete AWS Cognito Setup Guide

## 🎯 **Why AWS Cognito?**

You're switching from Firebase to AWS Cognito for production because:
- ✅ **More reliable email delivery** (no spam folder issues)
- ✅ **Enterprise-grade security** and compliance
- ✅ **Better production scalability**
- ✅ **AWS ecosystem integration**
- ✅ **Advanced authentication features**

## 📋 **Step-by-Step Setup**

### **Step 1: Create AWS Cognito User Pool**

I opened the AWS Console for you. Follow these steps:

1. **Go to Amazon Cognito** → **User pools**
2. **Click "Create user pool"**

#### **Configure User Pool Settings:**

**Step 1: Configure sign-in experience**
- ✅ **Email** (as username)
- Click "Next"

**Step 2: Configure security requirements**
- **Password policy**: Default or customize
- **MFA**: Optional (recommended)
- **Account recovery**: ✅ Email only
- Click "Next"

**Step 3: Configure sign-up experience**
- ✅ **Enable self-registration**
- ✅ **Allow Cognito to automatically send messages**
- **Required attributes**: ✅ email, ✅ name
- Click "Next"

**Step 4: Configure message delivery**
- **Email provider**: Send email with Cognito
- Click "Next"

**Step 5: Integrate your app**
- **User pool name**: `hoardrun-user-pool`
- **App client name**: `hoardrun-web-client`
- **Client secret**: ❌ Don't generate
- **Authentication flows**: 
  - ✅ ALLOW_USER_PASSWORD_AUTH
  - ✅ ALLOW_REFRESH_TOKEN_AUTH
  - ✅ ALLOW_USER_SRP_AUTH
- Click "Next"

**Step 6: Review and create**
- Review settings and click "Create user pool"

### **Step 2: Get Configuration Values**

After creating the user pool, copy these values:

1. **User Pool ID**: `us-east-1_XXXXXXXXX`
2. **App Client ID**: `xxxxxxxxxxxxxxxxxxxxxxxxxx`
3. **AWS Region**: `us-east-1` (or your chosen region)

### **Step 3: Create AWS IAM User (for API access)**

1. **Go to IAM** → **Users** → **Create user**
2. **User name**: `hoardrun-cognito-api`
3. **Attach policies**: `AmazonCognitoPowerUser`
4. **Create access key** for programmatic access
5. **Copy Access Key ID and Secret Access Key**

### **Step 4: Update Environment Variables**

Replace the placeholder values in your `.env` file:

```env
# AWS Cognito Configuration
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX  # Replace with your User Pool ID
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx  # Replace with your App Client ID

# For client-side
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX  # Same as above
NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx  # Same as above

# AWS Credentials
AWS_ACCESS_KEY_ID=your_actual_access_key_id  # From IAM user
AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key  # From IAM user
```

### **Step 5: Add to Vercel (Production)**

Add the same environment variables to Vercel:

1. **Go to Vercel Dashboard** → Your project → Settings → Environment Variables
2. **Add all the AWS Cognito variables**
3. **Redeploy your application**

## 🧪 **Testing the Setup**

### **Local Testing:**

1. **Start your dev server**: `npm run dev`
2. **Visit test page**: `http://localhost:3000/test-cognito`
3. **Test signup with real email**
4. **Check email for verification code**
5. **Test signin after verification**

### **API Testing:**

```bash
# Test configuration
curl http://localhost:3000/api/test/cognito

# Test signup
curl -X POST http://localhost:3000/api/auth/cognito/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com","password":"TestPassword123!","name":"Test User"}'

# Test signin (after email verification)
curl -X POST http://localhost:3000/api/auth/cognito/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com","password":"TestPassword123!"}'
```

## 🎯 **What You Get with AWS Cognito**

### **Features:**
- ✅ **Reliable email delivery** (no spam issues)
- ✅ **Email verification** with 6-digit codes
- ✅ **Password reset** functionality
- ✅ **MFA support** (optional)
- ✅ **JWT tokens** for authentication
- ✅ **User management** in AWS Console
- ✅ **Scalable** to millions of users

### **Email Flow:**
1. **User signs up** → Cognito sends verification email
2. **User enters code** → Email verified
3. **User can sign in** → Gets JWT tokens
4. **Tokens used** for API authentication

## 📁 **Files Created:**

- `lib/aws-cognito-config.ts` - AWS configuration
- `lib/aws-cognito-auth-service.ts` - Authentication service
- `app/api/auth/cognito/signup/route.ts` - Signup endpoint
- `app/api/auth/cognito/signin/route.ts` - Signin endpoint
- `app/api/auth/cognito/confirm/route.ts` - Email verification
- `app/api/test/cognito/route.ts` - Test endpoint
- `hooks/useCognitoAuth.ts` - React hook
- `app/test-cognito/page.tsx` - Test page

## 🚀 **Production Deployment**

1. **Complete AWS setup** (User Pool + IAM user)
2. **Update environment variables** (local + Vercel)
3. **Test locally** first
4. **Deploy to Vercel**
5. **Test production** at `https://hoardrun.vercel.app/test-cognito`

## 🔧 **Next Steps**

1. **Create AWS User Pool** (follow steps above)
2. **Get configuration values**
3. **Update .env file**
4. **Test locally**
5. **Deploy to production**

Your AWS Cognito authentication will be much more reliable than Firebase for production use! 🎉
