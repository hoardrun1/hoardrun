import { useState, useEffect } from 'react'

export interface CognitoAuthState {
  user: any | null
  accessToken: string | null
  loading: boolean
  error: string | null
}

export interface CognitoAuthActions {
  signUpWithCognito: (email: string, password: string, name?: string) => Promise<{ needsVerification: boolean }>
  signInWithCognito: (email: string, password: string) => Promise<void>
  confirmSignUp: (email: string, confirmationCode: string) => Promise<void>
  resendConfirmationCode: (email: string) => Promise<void>
  signOut: () => void
  clearError: () => void
}

export function useCognitoAuth(): CognitoAuthState & CognitoAuthActions {
  const [user, setUser] = useState<any | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load saved auth state from localStorage
    const savedToken = localStorage.getItem('cognito_access_token')
    const savedUser = localStorage.getItem('cognito_user')
    
    if (savedToken && savedUser) {
      setAccessToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const signUpWithCognito = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/cognito/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // If verification is needed, don't set user as logged in yet
      if (data.needsVerification) {
        return { needsVerification: true }
      }

      // If no verification needed, user is ready
      setUser(data.user)
      return { needsVerification: false }

    } catch (err: any) {
      setError(err.message || 'Signup failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signInWithCognito = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/cognito/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signin failed')
      }

      // Save auth state
      setUser(data.user)
      setAccessToken(data.accessToken)
      
      // Persist to localStorage
      localStorage.setItem('cognito_access_token', data.accessToken)
      localStorage.setItem('cognito_refresh_token', data.refreshToken)
      localStorage.setItem('cognito_user', JSON.stringify(data.user))

    } catch (err: any) {
      setError(err.message || 'Signin failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const confirmSignUp = async (email: string, confirmationCode: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/cognito/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm', email, confirmationCode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Confirmation failed')
      }

      // User is now verified, but they still need to sign in
      setUser(data.user)

    } catch (err: any) {
      setError(err.message || 'Confirmation failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resendConfirmationCode = async (email: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/cognito/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend', email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code')
      }

    } catch (err: any) {
      setError(err.message || 'Failed to resend code')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    setAccessToken(null)
    setError(null)
    
    // Clear localStorage
    localStorage.removeItem('cognito_access_token')
    localStorage.removeItem('cognito_refresh_token')
    localStorage.removeItem('cognito_user')
  }

  const clearError = () => {
    setError(null)
  }

  return {
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
  }
}
