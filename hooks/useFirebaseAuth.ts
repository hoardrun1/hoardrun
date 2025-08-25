import { useState, useEffect } from 'react'

export interface FirebaseAuthState {
  user: any | null
  loading: boolean
  error: string | null
}

export interface FirebaseAuthActions {
  signUpWithFirebase: (email: string, password: string, name?: string) => Promise<void>
  signInWithFirebase: (email: string, password: string) => Promise<void>
  signOutFromFirebase: () => Promise<void>
  sendEmailVerification: (userId: string) => Promise<void>
  verifyEmail: (actionCode: string) => Promise<void>
  clearError: () => void
}

export function useFirebaseAuth(): FirebaseAuthState & FirebaseAuthActions {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored user data
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error('Error parsing stored user:', e)
        }
      }
    }
  }, [])

  const signUpWithFirebase = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Call our API to create user
      const response = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || '' })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      // Store user data
      const userData = { email, name: name || '', id: result.userId || email }
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)

    } catch (err: any) {
      setError(err.message || 'Failed to create account')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signInWithFirebase = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      // Call our API to verify credentials
      const response = await fetch('/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign in')
      }

      // Store user data
      const userData = { email, id: result.userId || email }
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)

    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOutFromFirebase = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Clear stored user data
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      
    } catch (err: any) {
      setError(err.message || 'Failed to sign out')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const sendEmailVerification = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email verification')
      }

    } catch (err: any) {
      setError(err.message || 'Failed to send email verification')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (actionCode: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionCode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email')
      }

    } catch (err: any) {
      setError(err.message || 'Failed to verify email')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    user,
    loading,
    error,
    signUpWithFirebase,
    signInWithFirebase,
    signOutFromFirebase,
    sendEmailVerification,
    verifyEmail,
    clearError
  }
}
