import { useState, useCallback } from 'react'
import { AccountType } from '@prisma/client'
import { useToast } from '@/components/ui/use-toast'

interface Account {
  id: string
  type: AccountType
  number: string
  balance: number
  currency: string
  isActive: boolean
  cards: any[]
  _count: {
    transactions: number
  }
}

interface CreateAccountData {
  type: AccountType
  currency?: string
}

export function useBankAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAccounts = useCallback(async (type?: AccountType) => {
    try {
      setIsLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (type) params.append('type', type)

      const response = await fetch(`/api/accounts?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch accounts')
      }

      setAccounts(data.accounts)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch accounts'
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const createAccount = useCallback(async (data: CreateAccountData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      setAccounts(prev => [...prev, result.account])
      toast({
        title: "Success",
        description: "Account created successfully",
      })

      return result.account
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account'
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const getAccountById = useCallback((accountId: string) => {
    return accounts.find(account => account.id === accountId)
  }, [accounts])

  const getTotalBalance = useCallback((currency: string = 'USD') => {
    return accounts
      .filter(account => account.currency === currency)
      .reduce((total, account) => total + account.balance, 0)
  }, [accounts])

  const getAccountsByType = useCallback((type: AccountType) => {
    return accounts.filter(account => account.type === type)
  }, [accounts])

  const formatAccountNumber = useCallback((number: string) => {
    return `**** ${number.slice(-4)}`
  }, [])

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    createAccount,
    getAccountById,
    getTotalBalance,
    getAccountsByType,
    formatAccountNumber,
  }
} 