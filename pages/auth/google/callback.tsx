import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function GoogleCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')

        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        if (!code) {
          throw new Error('No authorization code received')
        }

        setStatus('Exchanging code for tokens...')

        // Exchange authorization code for ID token using Google's token endpoint
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '575518235403-kkrsrim8d8dml8qv2gurqll3ug8oo7cr.apps.googleusercontent.com',
            client_secret: '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', // Note: This should be handled server-side in production
            code,
            grant_type: 'authorization_code',
            redirect_uri: `${window.location.origin}/auth/google/callback`
          }),
        })

        const tokenData = await tokenResponse.json()

        if (!tokenResponse.ok) {
          throw new Error(tokenData.error_description || 'Failed to exchange code for tokens')
        }

        setStatus('Authenticating with backend...')

        // Now use the ID token with our existing backend endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_BACKEND_URL}/api/v1/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: tokenData.id_token
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to authenticate with Google')
        }

        setStatus('Authentication successful! Redirecting...')

        // Store tokens
        localStorage.setItem('token', data.data.accessToken)
        localStorage.setItem('refresh_token', data.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.data.user))

        // Close popup if this is running in a popup
        if (window.opener) {
          window.opener.postMessage({ success: true, user: data.data.user }, window.location.origin)
          window.close()
        } else {
          // Redirect to dashboard if not in popup
          router.push('/dashboard')
        }

      } catch (error) {
        console.error('Google OAuth callback error:', error)
        setStatus(`Error: ${error instanceof Error ? error.message : 'Authentication failed'}`)
        
        // If in popup, send error to parent
        if (window.opener) {
          window.opener.postMessage({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Authentication failed' 
          }, window.location.origin)
          setTimeout(() => window.close(), 3000)
        }
      }
    }

    if (router.isReady) {
      handleCallback()
    }
  }, [router.isReady, router])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Google Authentication</h2>
        <p>{status}</p>
        {status.includes('Error:') && (
          <p style={{ color: 'red', fontSize: '14px' }}>
            This window will close automatically in 3 seconds...
          </p>
        )}
      </div>
    </div>
  )
}
