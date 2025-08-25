import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'

interface Transaction {
  id: string
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'INVESTMENT'
  amount: number
  description?: string
  category?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  beneficiaryId?: string
  createdAt: string
  updatedAt: string
}

interface CreateTransactionData {
  type: Transaction['type']
  amount: number
  description?: string
  category?: string
  beneficiaryId?: string
}

export function useTransactions() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      throw new Error('Authentication required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast])

  const createTransaction = useCallback(async (data: CreateTransactionData) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create transaction')
      }

      const newTransaction = await response.json()
      setTransactions(prev => [newTransaction, ...prev])

      toast({
        title: 'Success',
        description: 'Transaction created successfully',
      })

      return newTransaction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create transaction',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  const getTransactionById = useCallback((id: string) => {
    return transactions.find(transaction => transaction.id === id)
  }, [transactions])

  const getTransactionsByType = useCallback((type: Transaction['type']) => {
    return transactions.filter(transaction => transaction.type === type)
  }, [transactions])

  const getTransactionsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }, [transactions])

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    getTransactionById,
    getTransactionsByType,
    getTransactionsByDateRange,
  }
}
