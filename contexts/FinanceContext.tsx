'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'

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
      const response = await apiClient.getDashboard()
      if (response.data) {
        setBalance(response.data.balance || 0)
      } else {
        throw new Error(response.error || 'Failed to fetch balance')
      }
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
      const response = await apiClient.createTransaction({
        type: 'TRANSFER',
        amount,
        category: 'SAVINGS',
        description: 'Transfer to savings'
      })

      if (response.error) {
        throw new Error(response.error)
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
      const response = await apiClient.createTransaction({
        type: 'INVESTMENT',
        amount,
        category: 'INVESTMENT',
        description: 'Transfer to investment'
      })

      if (response.error) {
        throw new Error(response.error)
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
      const response = await apiClient.createTransaction({
        type: 'DEPOSIT',
        amount,
        category: 'DEPOSIT',
        description: 'Deposit funds'
      })

      if (response.error) {
        throw new Error(response.error)
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
      const response = await apiClient.createTransaction({
        type: 'WITHDRAWAL',
        amount,
        category: 'WITHDRAWAL',
        description: 'Withdraw funds'
      })

      if (response.error) {
        throw new Error(response.error)
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
