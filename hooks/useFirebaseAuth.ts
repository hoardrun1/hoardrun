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
    clearError
  }
}
