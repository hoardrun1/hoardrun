import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { apiClient, BankAccount } from '@/lib/api-client'

interface CreateAccountData {
  account_type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT'
  name?: string
  currency?: string
  initial_deposit?: number
}

export function useBankAccounts() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getAccounts(user.id)
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setAccounts(response.data.accounts)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.createAccount(user.id, data)
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const newAccount = response.data.account
        setAccounts(prev => [newAccount, ...prev])

        toast({
          title: 'Success',
          description: 'Account created successfully',
        })

        return newAccount
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create account',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  const closeAccount = useCallback(async (id: string, reason?: string) => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.closeAccount(id, user.id, reason)
      if (response.error) {
        throw new Error(response.error)
      }

      setAccounts(prev => prev.map(account => 
        account.id === id ? { ...account, status: 'closed' } : account
      ))

      toast({
        title: 'Success',
        description: 'Account closed successfully',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to close account',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  const getAccountById = useCallback((id: string) => {
    return accounts.find(account => account.id === id)
  }, [accounts])

  const getAccountsByType = useCallback((type: BankAccount['account_type']) => {
    return accounts.filter(account => account.account_type === type)
  }, [accounts])

  const getActiveAccounts = useCallback(() => {
    return accounts.filter(account => account.status === 'active')
  }, [accounts])

  const calculateTotalBalance = useCallback(() => {
    return accounts.reduce((total, account) => {
      if (account.status === 'active') {
        return total + account.balance
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
    calculateTotalBalance,
  }
}
