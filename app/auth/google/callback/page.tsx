'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function GoogleCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams?.get('code')
        const state = searchParams?.get('state')
        const error = searchParams?.get('error')

        if (error) {
          throw new Error(`Google OAuth error: ${error}`)
        }

        if (!code) {
          throw new Error('No authorization code received from Google')
        }

        // Parse state to get action and origin
        let parsedState = { action: 'signin', origin: window.location.origin }
        if (state) {
          try {
            parsedState = JSON.parse(decodeURIComponent(state))
          } catch (e) {
            console.warn('Failed to parse state parameter:', e)
          }
        }

        // Exchange code for tokens using Google's token endpoint directly
        const backendUrl = process.env.NEXT_PUBLIC_AUTH_BACKEND_URL || 'https://auth-backend-yqik.onrender.com'

        // First, get the client configuration
        const configResponse = await fetch(`${backendUrl}/api/v1/auth/config`)
        const configData = await configResponse.json()

        if (!configResponse.ok) {
          throw new Error('Failed to get OAuth configuration')
        }

        const clientId = configData.data.clientId || configData.data.googleClientId
        const redirectUri = `${window.location.origin}/auth/google/callback`

        // Exchange authorization code for tokens with Google directly
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: '', // We'll handle this on the backend
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        })

        // If direct token exchange fails, use backend callback
        let response
        if (!tokenResponse.ok) {
          // Fallback to backend callback
          response = await fetch(`${backendUrl}/api/v1/auth/google/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              action: parsedState.action || 'signin'
            }),
          })
        } else {
          const tokenData = await tokenResponse.json()

          // Use the ID token with your backend's Google auth endpoint
          response = await fetch(`${backendUrl}/api/v1/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idToken: tokenData.id_token
            }),
          })
        }

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Authentication failed')
        }

        // Send success message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            data: data.data
          }, parsedState.origin)
          window.close()
        } else {
          // If not in popup, redirect to dashboard
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        }

      } catch (error) {
        console.error('Google OAuth callback error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
        
        setStatus('error')
        setMessage(errorMessage)

        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: errorMessage
          }, '*')
          window.close()
        }
      }
    }

    handleGoogleCallback()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Completing Google Sign-In...
              </h2>
              <p className="text-gray-600">
                Please wait while we complete your authentication.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Successful!
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => window.close()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close Window
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600">
            Please wait while we process your request.
          </p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}
