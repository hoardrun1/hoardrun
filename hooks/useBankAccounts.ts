import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'

interface BankAccount {
  id: string
  type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT'
  number: string
  balance: number
  currency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CreateAccountData {
  type: BankAccount['type']
  currency?: string
}

export function useBankAccounts() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/accounts')
      if (!response.ok) throw new Error('Failed to fetch accounts')

      const data = await response.json()
      setAccounts(data)
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
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create account')
      }

      const newAccount = await response.json()
      setAccounts(prev => [newAccount, ...prev])

      toast({
        title: 'Success',
        description: 'Account created successfully',
      })

      return newAccount
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

  const closeAccount = useCallback(async (id: string) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to close account')
      }

      setAccounts(prev => prev.map(account => 
        account.id === id ? { ...account, isActive: false } : account
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

  const getAccountsByType = useCallback((type: BankAccount['type']) => {
    return accounts.filter(account => account.type === type)
  }, [accounts])

  const getActiveAccounts = useCallback(() => {
    return accounts.filter(account => account.isActive)
  }, [accounts])

  const calculateTotalBalance = useCallback(() => {
    return accounts.reduce((total, account) => {
      if (account.isActive) {
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
