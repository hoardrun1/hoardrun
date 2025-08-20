# Firebase Email Verification Setup

## 🔧 **Firebase Console Configuration**

To enable email verification, you need to configure Firebase Authentication in your console:

### **Step 1: Enable Email/Password Authentication**

1. Go to [Firebase Authentication](https://console.firebase.google.com/project/hoardrun-ef38e/authentication/providers)
2. Click on **"Email/Password"** provider
3. Enable **"Email/Password"** 
4. Enable **"Email link (passwordless sign-in)"** (optional but recommended)
5. Click **"Save"**

### **Step 2: Configure Email Templates**

1. Go to [Authentication Templates](https://console.firebase.google.com/project/hoardrun-ef38e/authentication/emails)
2. Click on **"Email address verification"**
3. Customize the email template:
   - **Subject**: "Verify your email for HoardRun"
   - **Body**: Customize the message for your users
4. Click **"Save"**

### **Step 3: Configure Authorized Domains**

1. Go to [Authentication Settings](https://console.firebase.google.com/project/hoardrun-ef38e/authentication/settings)
2. In **"Authorized domains"** section, add:
   - `localhost` (for development)
   - Your production domain when ready
3. Click **"Add domain"**

## 🧪 **Testing Email Verification**

### **Method 1: Using the Test Page**

1. Start your dev server: `npm run dev`
2. Go to: `http://localhost:3000/test-firebase`
3. Try signing up with a real email address
4. Check your email for the verification link

### **Method 2: Using API Directly**

```bash
# Sign up a new user
curl -X POST http://localhost:3000/api/auth/firebase/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-real-email@gmail.com",
    "password": "testpassword123",
    "name": "Test User"
  }'
```

### **Method 3: Development Testing**

In development mode, the verification link is included in the API response for testing:

```json
{
  "success": true,
  "message": "Account created successfully. Please check your email for verification.",
  "verificationLink": "https://hoardrun-ef38e.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=...",
  "note": "Verification link included for development testing"
}
```

## 🔍 **Troubleshooting Email Issues**

### **If emails are not being sent:**

1. **Check Firebase Authentication is enabled**
   - Go to Firebase Console → Authentication
   - Make sure Email/Password is enabled

2. **Check email templates are configured**
   - Go to Authentication → Templates
   - Make sure "Email address verification" is set up

3. **Check spam folder**
   - Firebase emails might go to spam initially

4. **Check authorized domains**
   - Make sure your domain is in the authorized domains list

5. **Use a real email address**
   - Firebase won't send emails to fake/test email addresses

### **Common Issues:**

- **"Email already exists"**: The email is already registered in Firebase
- **"Invalid email"**: Make sure the email format is correct
- **"Weak password"**: Firebase requires passwords to be at least 6 characters

## 🚀 **Production Setup**

For production, you'll want to:

1. **Customize email templates** with your branding
2. **Set up custom email domain** (optional)
3. **Configure proper authorized domains**
4. **Set up email delivery monitoring**

## 📋 **Quick Links for Your Project**

- [Authentication Providers](https://console.firebase.google.com/project/hoardrun-ef38e/authentication/providers)
- [Email Templates](https://console.firebase.google.com/project/hoardrun-ef38e/authentication/emails)
- [Authentication Settings](https://console.firebase.google.com/project/hoardrun-ef38e/authentication/settings)
- [Users](https://console.firebase.google.com/project/hoardrun-ef38e/authentication/users)

## 🎯 **Next Steps**

1. Configure Firebase Authentication in console (links above)
2. Test with a real email address
3. Check your email for verification link
4. Click the verification link
5. User will be marked as verified in Firebase and your database
