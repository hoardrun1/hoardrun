# Firebase Authentication Integration

This document explains how to set up and use Firebase authentication in the HoardRun application.

## Overview

The Firebase integration provides custom token-based authentication that works alongside your existing JWT system. Users are stored in your Prisma database, but authentication tokens are managed by Firebase.

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication in the Firebase console
4. Go to Project Settings > Service Accounts
5. Generate a new private key (download the JSON file)

### 2. Environment Variables

Update your `.env` file with the following Firebase configuration:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side only)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"

# Client-side Firebase config (exposed to client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Service Account Key

Extract the following from your Firebase service account JSON file:
- `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
- `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
- `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

## API Endpoints

### Sign Up
```
POST /api/auth/firebase/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "emailVerified": false
  },
  "customToken": "firebase_custom_token",
  "firebaseEndpoint": "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=API_KEY"
}
```

### Sign In
```
POST /api/auth/firebase/signin
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sign in successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "emailVerified": false
  },
  "customToken": "firebase_custom_token",
  "firebaseEndpoint": "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=API_KEY"
}
```

### Verify Token
```
POST /api/auth/firebase/verify
```

**Request Body:**
```json
{
  "idToken": "firebase_id_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token verified successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "emailVerified": false
  }
}
```

## Client-Side Usage

### Using AuthContext

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { signupWithFirebase, signinWithFirebase, user, authMethod } = useAuth()

  const handleSignup = async () => {
    try {
      await signupWithFirebase('user@example.com', 'password123', 'User Name')
      console.log('Signup successful!')
    } catch (error) {
      console.error('Signup failed:', error)
    }
  }

  const handleSignin = async () => {
    try {
      await signinWithFirebase('user@example.com', 'password123')
      console.log('Signin successful!')
    } catch (error) {
      console.error('Signin failed:', error)
    }
  }

  return (
    <div>
      <p>Current user: {user?.email}</p>
      <p>Auth method: {authMethod}</p>
      <button onClick={handleSignup}>Sign Up with Firebase</button>
      <button onClick={handleSignin}>Sign In with Firebase</button>
    </div>
  )
}
```

### Using Firebase Hook

```tsx
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

function MyComponent() {
  const { user, signUpWithFirebase, signInWithFirebase, loading, error } = useFirebaseAuth()

  // Component implementation
}
```

## Authentication Flow

1. **Sign Up/Sign In**: User provides credentials to your API
2. **Verification**: Your API verifies credentials against your database
3. **Custom Token**: Your server creates a Firebase custom token
4. **Firebase Auth**: Client exchanges custom token for Firebase ID token
5. **Session**: Firebase ID token is used for subsequent requests

## Testing

Visit `/test-firebase` to test the Firebase integration with a simple UI.

Or use the test API endpoint:
```
GET /api/test/firebase
```

## Integration with Existing System

The Firebase integration works alongside your existing JWT authentication:

- Users are still stored in your Prisma database
- Password verification happens on your server
- Firebase provides token management and session handling
- Both JWT and Firebase tokens are supported in AuthContext

## Security Considerations

1. **Custom Tokens**: Only your server can create custom tokens
2. **ID Tokens**: Firebase ID tokens are verified server-side
3. **Database**: User data remains in your control
4. **Environment Variables**: Keep Firebase service account keys secure

## Troubleshooting

1. **Token Errors**: Check Firebase project configuration
2. **Environment Variables**: Ensure all required variables are set
3. **Service Account**: Verify service account has proper permissions
4. **API Key**: Make sure Firebase API key is correct and has proper restrictions
