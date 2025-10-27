import React, { useCallback, useEffect, useState, useRef } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { usePlaid } from '@/hooks/usePlaid'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface PlaidLinkProps {
  onSuccess?: (publicToken: string, metadata: any) => void
  onExit?: (error: any) => void
  onEvent?: (eventName: string, metadata: any) => void
  className?: string
  children?: React.ReactNode
}

// Global state to prevent multiple Plaid Link initializations
let globalLinkToken: string | null = null
let globalIsInitializing = false
let globalTokenPromise: Promise<any> | null = null

export function PlaidLink({
  onSuccess,
  onExit,
  onEvent,
  className,
  children
}: PlaidLinkProps) {
  const { createLinkToken, exchangeToken, isLoading } = usePlaid()
  const { user, isAuthenticated } = useAuth()
  const [linkToken, setLinkToken] = useState<string | null>(globalLinkToken)
  const [isInitializing, setIsInitializing] = useState(globalIsInitializing)
  const [error, setError] = useState<string | null>(null)
  const initializationRef = useRef(false)

  // Initialize link token with global state management
  const initializeLink = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (globalIsInitializing || globalTokenPromise || globalLinkToken) {
      if (globalTokenPromise) {
        try {
          const response = await globalTokenPromise
          setLinkToken(response?.link_token || null)
        } catch (error) {
          console.error('Failed to get global link token:', error)
          setError('Failed to initialize Plaid Link')
        }
      } else {
        setLinkToken(globalLinkToken)
      }
      return
    }

    // Check authentication first
    if (!isAuthenticated || !user) {
      setError('Please sign in to connect your bank account')
      return
    }

    globalIsInitializing = true
    setIsInitializing(true)
    setError(null)

    try {
      globalTokenPromise = createLinkToken()

      const response = await globalTokenPromise
      if (response?.link_token) {
        globalLinkToken = response.link_token
        setLinkToken(response.link_token)
      } else {
        throw new Error('No link token received')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create link token'
      console.error('Failed to create link token:', err)
      setError(errorMessage)

      // Clear global state on error
      globalLinkToken = null
      globalTokenPromise = null
    } finally {
      globalIsInitializing = false
      setIsInitializing(false)
      globalTokenPromise = null
    }
  }, [createLinkToken, isAuthenticated, user])

  // Initialize on mount and when authentication changes
  useEffect(() => {
    if (!initializationRef.current && isAuthenticated) {
      initializationRef.current = true
      initializeLink()
    }
  }, [initializeLink, isAuthenticated])

  // Reset when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      globalLinkToken = null
      globalTokenPromise = null
      globalIsInitializing = false
      setLinkToken(null)
      setError(null)
      initializationRef.current = false
    }
  }, [isAuthenticated])

  // Handle Plaid Link success
  const handleOnSuccess = useCallback(async (publicToken: string, metadata: any) => {
    try {
      await exchangeToken(publicToken)
      onSuccess?.(publicToken, metadata)
    } catch (error) {
      console.error('Failed to exchange token:', error)
      setError('Failed to connect bank account')
      onExit?.(error)
    }
  }, [exchangeToken, onSuccess, onExit])

  // Handle Plaid Link exit
  const handleOnExit = useCallback((error: any, metadata: any) => {
    console.log('Plaid Link exited:', error, metadata)
    if (error) {
      setError('Bank connection was cancelled')
    }
    onExit?.(error)
  }, [onExit])

  // Handle Plaid Link events
  const handleOnEvent = useCallback((eventName: string, metadata: any) => {
    console.log('Plaid Link event:', eventName, metadata)
    onEvent?.(eventName, metadata)
  }, [onEvent])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
    onEvent: handleOnEvent,
  })

  const handleClick = useCallback(() => {
    if (!isAuthenticated) {
      setError('Please sign in to connect your bank account')
      return
    }

    if (error) {
      // Retry initialization on click if there was an error
      initializeLink()
      return
    }

    if (ready && linkToken) {
      open()
    } else if (!linkToken && !isInitializing) {
      initializeLink()
    }
  }, [ready, linkToken, open, initializeLink, isAuthenticated, error, isInitializing])

  if (children) {
    return (
      <div
        onClick={handleClick}
        className={className}
        style={{ cursor: (ready && linkToken && !error) ? 'pointer' : 'not-allowed' }}
        title={error || undefined}
      >
        {children}
      </div>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={!ready || !linkToken || isLoading || isInitializing || !!error}
      className={className}
      title={error || undefined}
    >
      {(isLoading || isInitializing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {error ? 'Retry Connection' : 'Connect Bank Account'}
    </Button>
  )
}
