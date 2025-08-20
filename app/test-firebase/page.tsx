'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestFirebasePage() {
  const { signupWithFirebase, signinWithFirebase, user, token, authMethod, isLoading } = useAuth()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('testpassword123')
  const [name, setName] = useState('Test User')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async () => {
    try {
      setError('')
      setMessage('Signing up...')

      const response = await fetch('/api/auth/firebase/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ Signup successful!\n\n${data.message}\n\n${JSON.stringify(data, null, 2)}`)
        if (data.verificationLink) {
          setMessage(prev => prev + `\n\n🔗 Development Verification Link:\n${data.verificationLink}`)
        }
      } else {
        setError(data.error || 'Signup failed')
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed')
      setMessage('')
    }
  }

  const handleSignupWithEmail = async () => {
    try {
      setError('')
      setMessage('Creating account and sending verification email...')

      // Step 1: Create user account
      const signupResponse = await fetch('/api/auth/firebase/signup-with-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const signupData = await signupResponse.json()

      if (!signupResponse.ok) {
        setError(signupData.error || 'Signup failed')
        return
      }

      setMessage('✅ Account created! Now sending verification email...')

      // Step 2: Sign in with custom token and send verification email
      try {
        const firebaseResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: signupData.customToken,
            returnSecureToken: true
          })
        })

        if (!firebaseResponse.ok) {
          throw new Error('Failed to sign in with custom token')
        }

        const firebaseData = await firebaseResponse.json()

        // Step 3: Send verification email using Firebase REST API
        const verificationResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestType: 'VERIFY_EMAIL',
            idToken: firebaseData.idToken
          })
        })

        if (verificationResponse.ok) {
          const verificationData = await verificationResponse.json()
          setMessage(`✅ SUCCESS! Verification email sent to ${email}!\n\nCheck your email inbox (and spam folder) for the verification link.\n\n📧 Email: ${verificationData.email}\n\n${JSON.stringify(signupData, null, 2)}`)
        } else {
          const verificationError = await verificationResponse.json()
          setError(`Failed to send verification email: ${verificationError.error?.message || 'Unknown error'}`)
        }

      } catch (firebaseError) {
        setError(`Firebase error: ${firebaseError.message}`)
      }

    } catch (err: any) {
      setError(err.message || 'Signup with email failed')
      setMessage('')
    }
  }

  const handleSignin = async () => {
    try {
      setError('')
      setMessage('Signing in...')
      await signinWithFirebase(email, password)
      setMessage('Signin successful!')
    } catch (err: any) {
      setError(err.message || 'Signin failed')
      setMessage('')
    }
  }

  const testEndpoint = async () => {
    try {
      setError('')
      setMessage('Testing endpoint...')
      const response = await fetch('/api/test/firebase')
      const data = await response.json()
      setMessage(`Endpoint test: ${JSON.stringify(data, null, 2)}`)
    } catch (err: any) {
      setError(err.message || 'Endpoint test failed')
      setMessage('')
    }
  }

  const resendVerification = async () => {
    try {
      setError('')
      setMessage('Resending verification email...')

      const response = await fetch('/api/auth/firebase/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend', email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ Verification email sent!\n\n${JSON.stringify(data, null, 2)}`)
        if (data.verificationLink) {
          setMessage(prev => prev + `\n\n🔗 Development Verification Link:\n${data.verificationLink}`)
        }
      } else {
        setError(data.error || 'Failed to resend verification')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification')
      setMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Firebase Auth Test</h1>
        
        {/* Current Auth Status */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Current Auth Status:</h3>
          <p><strong>User:</strong> {user ? user.email : 'Not authenticated'}</p>
          <p><strong>Token:</strong> {token ? 'Present' : 'None'}</p>
          <p><strong>Method:</strong> {authMethod || 'None'}</p>
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        </div>

        {/* Test Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleSignup}
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Test Firebase Signup (No Email)
          </button>

          <button
            onClick={handleSignupWithEmail}
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            🔥 Test Signup + Send Verification Email
          </button>
          
          <button
            onClick={handleSignin}
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            Test Firebase Signin
          </button>
          
          <button
            onClick={testEndpoint}
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Test API Endpoint
          </button>

          <button
            onClick={resendVerification}
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            Resend Verification Email
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <pre className="whitespace-pre-wrap text-xs">{message}</pre>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
