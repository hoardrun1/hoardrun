import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { apiClient, PlaidAccount } from '@/lib/api-client'

interface CreateAccountData {
  account_type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT'
  name?: string
  currency?: string
  initial_deposit?: number
}

// Combined account type that handles both Plaid and internal accounts
interface CombinedAccount {
  id: string
  account_type: string
  account_number: string
  balance: number
  currency?: string
  status?: string
  isPlaidAccount: boolean
  // Plaid-specific fields
  connection_id?: string
  account_id?: string
  name?: string
  mask?: string
  type?: string
  subtype?: string
  official_name?: string
  balances?: {
    available?: number
    current: number
    limit?: number
    iso_currency_code?: string
  }
}

export function useBankAccounts() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<CombinedAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Fetching Plaid accounts...')
      
      // Fetch Plaid accounts - these are REAL connected bank accounts
      const plaidResponse = await apiClient.getPlaidAccounts()
      
      if (plaidResponse.error) {
        console.error('Error fetching Plaid accounts:', plaidResponse.error)
        
        // Don't show error toast for auth errors (handled by AuthContext)
        if (plaidResponse.status !== 401 && plaidResponse.status !== 403) {
          toast({
            title: 'Warning',
            description: 'Unable to load connected bank accounts',
            variant: 'default',
          })
        }
      }

      const plaidAccountsData: PlaidAccount[] = plaidResponse.data || []
      console.log(`Loaded ${plaidAccountsData.length} Plaid accounts`)

      // Convert Plaid accounts to CombinedAccount format
      const plaidCombinedAccounts: CombinedAccount[] = plaidAccountsData.map(plaidAccount => ({
        id: plaidAccount.account_id,
        account_id: plaidAccount.account_id,
        connection_id: plaidAccount.connection_id,
        account_type: plaidAccount.type || 'CHECKING',
        account_number: plaidAccount.mask || '****',
        balance: plaidAccount.balances?.available ?? plaidAccount.balances?.current ?? 0,
        currency: plaidAccount.balances?.iso_currency_code || 'USD',
        status: 'active',
        isPlaidAccount: true,
        // Keep Plaid-specific fields
        name: plaidAccount.name,
        official_name: plaidAccount.official_name,
        mask: plaidAccount.mask,
        type: plaidAccount.type,
        subtype: plaidAccount.subtype,
        balances: plaidAccount.balances,
      }))

      // Set combined accounts (only Plaid for now)
      setAccounts(plaidCombinedAccounts)
      
      console.log(`Total accounts available: ${plaidCombinedAccounts.length}`)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error in fetchAccounts:', err)
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: 'Failed to fetch accounts',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  const createAccount = useCallback(async (data: CreateAccountData) => {
    // TODO: Implement createAccount when backend API is available
    console.log('createAccount called with:', data)
    toast({
      title: 'Info',
      description: 'Account creation not yet implemented',
    })
  }, [toast])

  const closeAccount = useCallback(async (id: string, reason?: string) => {
    // TODO: Implement closeAccount when backend API is available
    console.log('closeAccount called with:', id, reason)
    toast({
      title: 'Info',
      description: 'Account closing not yet implemented',
    })
  }, [toast])

  const getAccountById = useCallback((id: string) => {
    return accounts.find(account => account.id === id || account.account_id === id)
  }, [accounts])

  const getAccountsByType = useCallback((type: string) => {
    return accounts.filter(account => 
      account.account_type?.toLowerCase() === type.toLowerCase()
    )
  }, [accounts])

  const getActiveAccounts = useCallback(() => {
    return accounts.filter(account =>
      account.isPlaidAccount || account.status === 'active'
    )
  }, [accounts])

  const getPlaidAccounts = useCallback(() => {
    return accounts.filter(account => account.isPlaidAccount)
  }, [accounts])

  const calculateTotalBalance = useCallback(() => {
    return accounts.reduce((total, account) => {
      if (account.isPlaidAccount || account.status === 'active') {
        return total + (account.balance || 0)
      }
      return total
    }, 0)
  }, [accounts])

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    createAccount,
    closeAccount,
    getAccountById,
    getAccountsByType,
    getActiveAccounts,
    getPlaidAccounts,
    calculateTotalBalance,
  }
}