import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase-config'
import { signInWithCustomToken, onAuthStateChanged, signOut, User } from 'firebase/auth'
import { firebaseAuth } from '@/lib/api-client'

export interface FirebaseAuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface FirebaseAuthActions {
  signUpWithFirebase: (email: string, password: string, name?: string) => Promise<void>
  signInWithFirebase: (email: string, password: string) => Promise<void>
  signOutFromFirebase: () => Promise<void>
<<<<<<< HEAD
=======
  sendEmailVerification: (userId: string) => Promise<void>
  verifyEmail: (actionCode: string) => Promise<void>
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
  clearError: () => void
}

export function useFirebaseAuth(): FirebaseAuthState & FirebaseAuthActions {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !auth) return

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUpWithFirebase = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Call our API to create user and get custom token
      const response = await firebaseAuth.signup({ email, password, name: name || '' })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create account')
      }

      // Sign in with the custom token
      if (auth) {
        await signInWithCustomToken(auth, response.data.customToken)
      }

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

      // Call our API to verify credentials and get custom token
      const response = await firebaseAuth.signin({ email, password })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to sign in')
      }

      // Sign in with the custom token
      if (auth) {
        await signInWithCustomToken(auth, response.data.customToken)
      }

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
      if (auth) {
        await signOut(auth)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign out')
      throw err
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
=======
  const sendEmailVerification = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/firebase/send-verification', {
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

      const response = await fetch('/api/auth/firebase/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionCode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email')
      }

      // Refresh the auth state to get updated email verification status
      if (auth && auth.currentUser) {
        await auth.currentUser.reload()
      }

    } catch (err: any) {
      setError(err.message || 'Failed to verify email')
      throw err
    } finally {
      setLoading(false)
    }
  }

>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
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
<<<<<<< HEAD
=======
    sendEmailVerification,
    verifyEmail,
>>>>>>> b6db85744d1c02aafeee0a9bfc69af758d9c4fc9
    clearError
  }
}
