import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'
import type {
  PlaidLinkTokenRequest,
  PlaidLinkTokenResponse,
  PlaidExchangeTokenRequest,
  PlaidExchangeTokenResponse,
  PlaidSyncRequest,
  PlaidSyncResponse,
  PlaidConnection,
  PlaidAccount,
  PlaidTransaction
} from '@/lib/api-client'

export function usePlaid() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create Plaid Link Token
  const createLinkToken = useCallback(async (requestData?: PlaidLinkTokenRequest) => {
    if (!isAuthenticated) {
      const error = 'Authentication required to connect bank account'
      setError(error)
      throw new Error(error)
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Creating Plaid link token...')
      const response = await apiClient.createPlaidLinkToken(requestData || {})
      
      if (response.error) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please sign in again.')
        }
        throw new Error(response.error)
      }

      console.log('Link token created successfully')
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create link token'
      setError(errorMessage)
      console.error('Create link token error:', err)

      // Only show toast for non-authentication errors
      if (!errorMessage.includes('Authentication required')) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }

      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, toast])

  // Exchange Public Token
  const exchangeToken = useCallback(async (publicToken: string, accountId?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Exchanging Plaid public token...')
      const requestData: PlaidExchangeTokenRequest = {
        public_token: publicToken,
        account_id: accountId
      }

      const response = await apiClient.exchangePlaidToken(requestData)
      
      if (response.error) {
        throw new Error(response.error)
      }

      console.log('Token exchanged successfully, connection created')
      toast({
        title: 'Success',
        description: 'Bank account connected successfully',
      })

      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect bank account'
      setError(errorMessage)
      console.error('Exchange token error:', err)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Sync Transactions
  const syncTransactions = useCallback(async (connectionId?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Syncing Plaid transactions...', connectionId ? `for connection ${connectionId}` : 'for all connections')
      
      if (connectionId) {
        const response = await apiClient.syncPlaidConnection(connectionId)
        if (response.error) {
          throw new Error(response.error)
        }
        return response.data
      } else {
        // Sync all connections
        const connectionsResponse = await apiClient.getPlaidConnections()
        if (connectionsResponse.error) {
          throw new Error(connectionsResponse.error)
        }

        const connections = connectionsResponse.data || []
        const activeConnections = connections.filter(c => c.status === 'active')

        // Sync each connection
        const syncResults = await Promise.allSettled(
          activeConnections.map(conn => apiClient.syncPlaidConnection(conn.connection_id))
        )

        console.log(`Synced ${activeConnections.length} connections`)
        return syncResults
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync transactions'
      setError(errorMessage)
      console.error('Sync transactions error:', err)
      
      // Don't show toast for sync errors - they're background operations
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get Plaid Connections
  const getConnections = useCallback(async (): Promise<PlaidConnection[]> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Fetching Plaid connections...')
      const response = await apiClient.getPlaidConnections()
      
      if (response.error) {
        // Don't throw for auth errors - just return empty array
        if (response.status === 401 || response.status === 403) {
          console.log('Auth required for connections')
          return []
        }
        throw new Error(response.error)
      }

      const connections = response.data || []
      console.log(`Found ${connections.length} Plaid connections`)
      return connections
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch connections'
      setError(errorMessage)
      console.error('Get connections error:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get Plaid Connection by ID
  const getConnection = useCallback(async (connectionId: string): Promise<PlaidConnection | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Fetching Plaid connection:', connectionId)
      const response = await apiClient.getPlaidConnection(connectionId)
      
      if (response.error) {
        throw new Error(response.error)
      }

      return response.data || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch connection'
      setError(errorMessage)
      console.error('Get connection error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get Plaid Accounts
  const getAccounts = useCallback(async (connectionId?: string): Promise<PlaidAccount[]> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Fetching Plaid accounts...', connectionId ? `for connection ${connectionId}` : 'for all connections')
      const response = await apiClient.getPlaidAccounts(connectionId)
      
      if (response.error) {
        // Don't throw for auth errors - just return empty array
        if (response.status === 401 || response.status === 403) {
          console.log('Auth required for accounts')
          return []
        }
        throw new Error(response.error)
      }

      const accounts = response.data || []
      console.log(`Found ${accounts.length} Plaid accounts`)
      return accounts
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accounts'
      setError(errorMessage)
      console.error('Get accounts error:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get Plaid Transactions
  const getTransactions = useCallback(async (params?: {
    connection_id?: string
    account_id?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }): Promise<PlaidTransaction[]> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Fetching Plaid transactions...', params)
      const response = await apiClient.getPlaidTransactions(params)
      
      if (response.error) {
        throw new Error(response.error)
      }

      const transactions = response.data || []
      console.log(`Found ${transactions.length} Plaid transactions`)
      return transactions
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions'
      setError(errorMessage)
      console.error('Get transactions error:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Disconnect Plaid Connection
  const disconnectConnection = useCallback(async (connectionId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Disconnecting Plaid connection:', connectionId)
      const response = await apiClient.disconnectPlaidConnection(connectionId)
      
      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: 'Success',
        description: 'Bank account disconnected successfully',
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect bank account'
      setError(errorMessage)
      console.error('Disconnect connection error:', err)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Get Webhook Status
  const getWebhookStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getPlaidWebhookStatus()
      
      if (response.error) {
        throw new Error(response.error)
      }

      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get webhook status'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create Transfer Quote
  const createTransferQuote = useCallback(async (data: {
    source_account_id: string;
    beneficiary_id: string;
    amount: number;
    currency?: string;
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Creating Plaid transfer quote...', data)
      const response = await apiClient.createPlaidTransferQuote(data)
      
      if (response.error) {
        throw new Error(response.error)
      }

      console.log('Transfer quote created successfully')
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transfer quote'
      setError(errorMessage)
      console.error('Create transfer quote error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initiate Transfer
  const initiateTransfer = useCallback(async (data: {
    quote_id: string;
    purpose: string;
    reference?: string;
    recipient_message?: string;
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Initiating Plaid transfer...', data)
      const response = await apiClient.initiatePlaidTransfer(data)

      if (response.error) {
        throw new Error(response.error)
      }

      console.log('Transfer initiated successfully')
      toast({
        title: 'Success',
        description: 'Transfer initiated successfully',
      })

      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate transfer'
      setError(errorMessage)
      console.error('Initiate transfer error:', err)

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Create Debit Card Verification Link Token
  const createDebitCardLinkToken = useCallback(async () => {
    if (!isAuthenticated) {
      const error = 'Authentication required to verify debit card'
      setError(error)
      throw new Error(error)
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Creating Plaid debit card verification link token...')
      const response = await apiClient.createPlaidDebitCardLinkToken()

      if (response.error) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please sign in again.')
        }
        throw new Error(response.error)
      }

      console.log('Debit card verification link token created successfully')
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create debit card verification link token'
      setError(errorMessage)
      console.error('Create debit card link token error:', err)

      // Only show toast for non-authentication errors
      if (!errorMessage.includes('Authentication required')) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }

      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, toast])

  // Verify Debit Card
  const verifyDebitCard = useCallback(async (publicToken: string, accountId?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Verifying debit card with Plaid...')
      const requestData = {
        public_token: publicToken,
        account_id: accountId
      }

      const response = await apiClient.verifyPlaidDebitCard(requestData)

      if (response.error) {
        throw new Error(response.error)
      }

      console.log('Debit card verified successfully')
      toast({
        title: 'Success',
        description: 'Debit card verified and added successfully',
      })

      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify debit card'
      setError(errorMessage)
      console.error('Verify debit card error:', err)

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return {
    isLoading,
    error,
    createLinkToken,
    exchangeToken,
    syncTransactions,
    getConnections,
    getConnection,
    getAccounts,
    getTransactions,
    disconnectConnection,
    getWebhookStatus,
    createTransferQuote,
    initiateTransfer,
    createDebitCardLinkToken,
    verifyDebitCard,
  }
}

