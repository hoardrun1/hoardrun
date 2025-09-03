'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'
import { useToast } from '@/components/ui/use-toast'

interface FinanceContextType {
  balance: number
  isLoading: boolean
  error: string | null
  transferToSavings: (amount: number) => Promise<void>
  transferToInvestment: (amount: number) => Promise<void>
  depositFunds: (amount: number) => Promise<void>
  withdrawFunds: (amount: number) => Promise<void>
  refreshBalance: () => Promise<void>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshBalance = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/accounts/balance')
      if (!response.ok) throw new Error('Failed to fetch balance')

      const data = await response.json()
      setBalance(data.balance)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance')
      // Remove toast for better performance - let components handle error display
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const transferToSavings = useCallback(async (amount: number) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'TRANSFER',
          amount,
          category: 'SAVINGS',
          description: 'Transfer to savings'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Transfer failed')
      }

      await refreshBalance()

      toast({
        title: 'Success',
        description: 'Transfer to savings successful',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Transfer failed',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, toast, refreshBalance])

  const transferToInvestment = useCallback(async (amount: number) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'INVESTMENT',
          amount,
          category: 'INVESTMENT',
          description: 'Transfer to investment'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Transfer failed')
      }

      await refreshBalance()

      toast({
        title: 'Success',
        description: 'Transfer to investment successful',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Transfer failed',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, toast, refreshBalance])

  const depositFunds = useCallback(async (amount: number) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'DEPOSIT',
          amount,
          category: 'DEPOSIT',
          description: 'Deposit funds'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Deposit failed')
      }

      await refreshBalance()

      toast({
        title: 'Success',
        description: 'Deposit successful',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Deposit failed',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, toast, refreshBalance])

  const withdrawFunds = useCallback(async (amount: number) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'WITHDRAWAL',
          amount,
          category: 'WITHDRAWAL',
          description: 'Withdraw funds'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Withdrawal failed')
      }

      await refreshBalance()

      toast({
        title: 'Success',
        description: 'Withdrawal successful',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Withdrawal failed',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, toast, refreshBalance])

  return (
    <FinanceContext.Provider
      value={{
        balance,
        isLoading,
        error,
        transferToSavings,
        transferToInvestment,
        depositFunds,
        withdrawFunds,
        refreshBalance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
