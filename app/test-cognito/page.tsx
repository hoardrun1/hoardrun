'use client'

import { useState } from 'react'
import { useCognitoAuth } from '@/hooks/useCognitoAuth'

export default function TestCognitoPage() {
  const { 
    user, 
    accessToken, 
    loading, 
    error, 
    signUpWithCognito, 
    signInWithCognito, 
    confirmSignUp, 
    resendConfirmationCode, 
    signOut, 
    clearError 
  } = useCognitoAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [message, setMessage] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)

  const handleSignup = async () => {
    try {
      clearError()
      setMessage('Signing up...')
      
      const result = await signUpWithCognito(email, password, name)
      
      if (result.needsVerification) {
        setNeedsVerification(true)
        setMessage('✅ Account created! Please check your email for verification code.')
      } else {
        setMessage('✅ Account created and verified!')
      }
    } catch (err: any) {
      setMessage('')
    }
  }

  const handleSignin = async () => {
    try {
      clearError()
      setMessage('Signing in...')
      
      await signInWithCognito(email, password)
      setMessage('✅ Signed in successfully!')
      setNeedsVerification(false)
    } catch (err: any) {
      setMessage('')
    }
  }

  const handleConfirm = async () => {
    try {
      clearError()
      setMessage('Confirming...')
      
      await confirmSignUp(email, confirmationCode)
      setMessage('✅ Email verified! You can now sign in.')
      setNeedsVerification(false)
    } catch (err: any) {
      setMessage('')
    }
  }

  const handleResendCode = async () => {
    try {
      clearError()
      setMessage('Resending code...')
      
      await resendConfirmationCode(email)
      setMessage('✅ Verification code sent!')
    } catch (err: any) {
      setMessage('')
    }
  }

  const testEndpoint = async () => {
    try {
      clearError()
      setMessage('Testing endpoint...')
      
      const response = await fetch('/api/test/cognito')
      const data = await response.json()
      setMessage(`Endpoint test: ${JSON.stringify(data, null, 2)}`)
    } catch (err: any) {
      setMessage('Endpoint test failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">AWS Cognito Auth Test</h1>
        
        {/* Current Auth Status */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Current Auth Status:</h3>
          <p><strong>User:</strong> {user ? user.email : 'Not authenticated'}</p>
          <p><strong>Token:</strong> {accessToken ? 'Present' : 'None'}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Needs Verification:</strong> {needsVerification ? 'Yes' : 'No'}</p>
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

          {needsVerification && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Code</label>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter 6-digit code from email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {!needsVerification ? (
            <>
              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                🚀 Test Cognito Signup
              </button>
              
              <button
                onClick={handleSignin}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                🔑 Test Cognito Signin
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleConfirm}
                disabled={loading || !confirmationCode}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                ✅ Confirm Email
              </button>
              
              <button
                onClick={handleResendCode}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                📧 Resend Code
              </button>
            </>
          )}
          
          <button
            onClick={testEndpoint}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            🧪 Test API Endpoint
          </button>

          {user && (
            <button
              onClick={signOut}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              🚪 Sign Out
            </button>
          )}
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
