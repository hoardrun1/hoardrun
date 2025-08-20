'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestFirebasePage() {
  const { signUpWithFirebase, signInWithFirebase, user, loading } = useAuth()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('testpassword123')
  const [name, setName] = useState('Test User')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async () => {
    try {
      setError('')
      setMessage('Signing up...')
      await signUpWithFirebase(email, password, name)
      setMessage('Signup successful!')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
      setMessage('')
    }
  }

  const handleSignin = async () => {
    try {
      setError('')
      setMessage('Signing in...')
      await signInWithFirebase(email, password)
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Firebase Auth Test</h1>
        
        {/* Current Auth Status */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Current Auth Status:</h3>
          <p><strong>User:</strong> {user ? user.email : 'Not authenticated'}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
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
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Test Firebase Signup
          </button>
          
          <button
            onClick={handleSignin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            Test Firebase Signin
          </button>
          
          <button
            onClick={testEndpoint}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Test API Endpoint
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
