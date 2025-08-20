import { useEffect, useState } from 'react'

declare global {
  interface Window {
    google?: any
  }
}

export default function TestGoogle() {
  const [currentUrl, setCurrentUrl] = useState('Loading...')

  useEffect(() => {
    // Set the current URL on client side only
    setCurrentUrl(window.location.href)

    // Load Google Identity Services
    // Load Google Identity Services
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => {
      console.log('Google script loaded')
      
      // Test basic initialization
      if (window.google) {
        console.log('Google object available:', window.google)
        
        try {
          window.google.accounts.id.initialize({
            client_id: '575518235403-kkrsrim8d8dml8qv2gurqll3ug8oo7cr.apps.googleusercontent.com',
            callback: (response: any) => {
              console.log('Google response:', response)
            }
          })
          console.log('Google initialized successfully')
        } catch (error) {
          console.error('Google initialization error:', error)
        }
      }
    }
    script.onerror = (error) => {
      console.error('Failed to load Google script:', error)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const testGoogleSignIn = () => {
    console.log('Testing Google Sign-In with popup...')

    // Use traditional OAuth popup flow instead of One Tap
    const clientId = '575518235403-kkrsrim8d8dml8qv2gurqll3ug8oo7cr.apps.googleusercontent.com'
    const redirectUri = window.location.origin
    const scope = 'email profile openid'

    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`

    console.log('Opening OAuth popup:', authUrl)

    // Open popup window
    const popup = window.open(
      authUrl,
      'google-oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      console.error('Popup blocked by browser')
      alert('Please allow popups for this site')
      return
    }

    // Monitor popup for completion
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        console.log('Popup closed')
      }
    }, 1000)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Google OAuth Test</h1>
      <p>Current URL: {currentUrl}</p>
      <p>Client ID: 575518235403-kkrsrim8d8dml8qv2gurqll3ug8oo7cr.apps.googleusercontent.com</p>
      
      <button 
        onClick={testGoogleSignIn}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Google OAuth Popup
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Open browser developer tools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click the "Test Google Sign-In" button</li>
          <li>Check console for any errors</li>
        </ol>
      </div>
    </div>
  )
}
