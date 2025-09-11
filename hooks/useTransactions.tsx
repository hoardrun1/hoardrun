import { useState, useCallback } from 'react'
import { useToast } from '../components/ui/use-toast'
import { apiClient, Transaction } from '../lib/api-client'
import { useAuth } from '../contexts/AuthContext'

interface TransactionData {
  type: string
  amount: number
  description?: string
  category?: string
}

interface TransactionHistory {
  transactions: Transaction[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
  })
  const { toast } = useToast()
  const { user } = useAuth()

  const createTransaction = useCallback(async (data: TransactionData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.createTransaction({
        type: data.type,
        amount: data.amount,
        description: data.description || '',
        category: data.category
      })

      if (response.error) {
        throw new Error(response.error || 'Transaction failed')
      }

      if (response.data) {
        setTransactions(prev => [response.data!, ...prev])
        toast({
          title: "Success",
          description: "Transaction completed successfully",
        })

        return {
          transaction: response.data,
          newBalance: response.data.amount,
        }
      }

      return null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed'
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

  const fetchTransactionHistory = useCallback(async (
    accountId?: string,
    page: number = 1,
    limit: number = 10,
    type?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if user is authenticated
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const offset = (page - 1) * limit
      const response = await apiClient.getTransactions({
        user_id: user.id,
        limit,
        offset,
        type,
        status: undefined
      })

      if (response.error) {
        throw new Error(response.error || 'Failed to fetch transactions')
      }

      if (response.data) {
        const transactions = Array.isArray(response.data) ? response.data : []
        setTransactions(transactions)
        
        const total = transactions.length
        const totalPages = Math.ceil(total / limit)
        
        setPagination({
          total,
          page,
          totalPages,
          hasMore: page < totalPages,
        })

        return {
          transactions,
          total,
          page,
          totalPages,
          hasMore: page < totalPages,
        }
      }

      return null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions'
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
  }, [toast, user])

  const getTransactionsByType = useCallback((type: string) => {
    return transactions.filter(transaction => transaction.type === type)
  }, [transactions])

  const getTransactionById = useCallback((transactionId: string) => {
    return transactions.find(transaction => transaction.id === transactionId)
  }, [transactions])

  const calculateTotalAmount = useCallback((type?: string) => {
    return transactions
      .filter(t => !type || t.type === type)
      .reduce((total, t) => total + t.amount, 0)
  }, [transactions])

  const formatTransactionDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  const getTransactionStatus = useCallback((status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Pending', color: 'yellow' },
      COMPLETED: { label: 'Completed', color: 'green' },
      FAILED: { label: 'Failed', color: 'red' },
      CANCELLED: { label: 'Cancelled', color: 'gray' },
      REFUNDED: { label: 'Refunded', color: 'blue' },
    }
    return statusMap[status] || { label: status, color: 'gray' }
  }, [])

  return {
    transactions,
    isLoading,
    error,
    pagination,
    createTransaction,
    fetchTransactionHistory,
    getTransactionsByType,
    getTransactionById,
    calculateTotalAmount,
    formatTransactionDate,
    getTransactionStatus,
  }
}
