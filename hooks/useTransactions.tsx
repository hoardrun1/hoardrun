import { useState, useCallback } from 'react'
import { TransactionType, TransactionStatus } from '@prisma/client'
import { useToast } from '@/components/ui/use-toast'

interface Transaction {
  id: string
  type: TransactionType
  amount: number
  currency: string
  description?: string
  status: TransactionStatus
  reference: string
  createdAt: string
  beneficiary?: {
    name: string
    accountNumber: string
    bankName: string
  }
}

interface TransactionData {
  accountId: string
  type: TransactionType
  amount: number
  description?: string
  beneficiaryId?: string
  currency?: string
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

  const createTransaction = useCallback(async (data: TransactionData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Transaction failed')
      }

      setTransactions(prev => [result.transaction, ...prev])
      toast({
        title: "Success",
        description: "Transaction completed successfully",
      })

      return {
        transaction: result.transaction,
        newBalance: result.newBalance,
      }
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
    accountId: string,
    page: number = 1,
    limit: number = 10,
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        accountId,
        page: page.toString(),
        limit: limit.toString(),
      })

      if (type) params.append('type', type)
      if (startDate) params.append('startDate', startDate.toISOString())
      if (endDate) params.append('endDate', endDate.toISOString())

      const response = await fetch(`/api/transactions?${params.toString()}`)
      const data: TransactionHistory = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions')
      }

      setTransactions(data.transactions)
      setPagination({
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        hasMore: data.hasMore,
      })

      return data
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
  }, [toast])

  const getTransactionsByType = useCallback((type: TransactionType) => {
    return transactions.filter(transaction => transaction.type === type)
  }, [transactions])

  const getTransactionById = useCallback((transactionId: string) => {
    return transactions.find(transaction => transaction.id === transactionId)
  }, [transactions])

  const calculateTotalAmount = useCallback((type?: TransactionType) => {
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

  const getTransactionStatus = useCallback((status: TransactionStatus) => {
    const statusMap = {
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