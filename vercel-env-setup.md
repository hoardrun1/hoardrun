# Vercel Environment Variables Setup for Firebase

## 🚨 **Critical: Add Firebase Environment Variables to Vercel**

Your Vercel deployment needs all the Firebase environment variables. Here's how to add them:

### **Step 1: Go to Vercel Dashboard**

1. Go to: https://vercel.com/dashboard
2. Find your `hoardrun` project
3. Click on it
4. Go to **Settings** → **Environment Variables**

### **Step 2: Add These Environment Variables**

Add each of these variables to Vercel (copy the values from your local `.env` file):

#### **Client-side Variables (NEXT_PUBLIC_)**
```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyB6OjW6Nkl96KBWa-NLkQCyjmTkioHAc5M
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = hoardrun-ef38e.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = hoardrun-ef38e
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = hoardrun-ef38e.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 129692872218
NEXT_PUBLIC_FIREBASE_APP_ID = 1:129692872218:web:896569b3fb540bb4172ba3
```

#### **Server-side Variables (Firebase Admin)**
```
FIREBASE_ADMIN_PROJECT_ID = hoardrun-ef38e
FIREBASE_ADMIN_CLIENT_EMAIL = firebase-adminsdk-fbsvc@hoardrun-ef38e.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n[YOUR_ACTUAL_PRIVATE_KEY]\n-----END PRIVATE KEY-----"
```

#### **Database and Other Variables**
```
DATABASE_URL = [YOUR_DATABASE_URL]
NEXTAUTH_SECRET = [YOUR_NEXTAUTH_SECRET]
NEXTAUTH_URL = https://hoardrun.vercel.app
```

### **Step 3: Important Notes**

1. **Private Key Format**: Make sure the `FIREBASE_ADMIN_PRIVATE_KEY` includes the quotes and `\n` characters exactly as in your local `.env`

2. **Environment**: Set all variables for **Production**, **Preview**, and **Development** environments

3. **Redeploy**: After adding variables, redeploy your app

### **Step 4: Verify Deployment**

After adding variables and redeploying:

1. Go to: https://hoardrun.vercel.app/api/test/firebase
2. Check if it returns Firebase configuration status
3. Test signup at: https://hoardrun.vercel.app/test-firebase

## 🔍 **Quick Verification Commands**

You can test your production deployment:

```bash
# Test Firebase config endpoint
curl https://hoardrun.vercel.app/api/test/firebase

# Test email debug endpoint
curl -X POST https://hoardrun.vercel.app/api/test/email-debug \
  -H "Content-Type: application/json" \
  -d '{"email":"your-real-email@gmail.com"}'
```

## 🚨 **Common Issues**

1. **Missing Environment Variables**: Most common issue - make sure all Firebase variables are in Vercel
2. **Wrong Private Key Format**: The private key must include quotes and `\n` characters
3. **Domain Not Authorized**: Make sure `hoardrun.vercel.app` is in Firebase authorized domains
4. **Database Connection**: Make sure your production database URL is correct

## 📋 **Checklist**

- [ ] Added `hoardrun.vercel.app` to Firebase authorized domains
- [ ] Added all `NEXT_PUBLIC_FIREBASE_*` variables to Vercel
- [ ] Added all `FIREBASE_ADMIN_*` variables to Vercel
- [ ] Added `DATABASE_URL` to Vercel
- [ ] Redeployed the application
- [ ] Tested the Firebase config endpoint
- [ ] Tested email sending on production
