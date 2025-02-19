import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'

interface Investment {
  id: string
  type: 'STOCKS' | 'BONDS' | 'REAL_ESTATE' | 'CRYPTO' | 'ETF' | 'MUTUAL_FUND'
  amount: number
  return?: number
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
  description?: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

interface CreateInvestmentData {
  type: Investment['type']
  amount: number
  risk: Investment['risk']
  description?: string
}

export function useInvestments() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInvestments = useCallback(async () => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/investments')
      if (!response.ok) throw new Error('Failed to fetch investments')

      const data = await response.json()
      setInvestments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: 'Failed to fetch investments',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const createInvestment = useCallback(async (data: CreateInvestmentData) => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create investment')
      }

      const newInvestment = await response.json()
      setInvestments(prev => [newInvestment, ...prev])

      toast({
        title: 'Success',
        description: 'Investment created successfully',
      })

      return newInvestment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create investment',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const completeInvestment = useCallback(async (id: string) => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/investments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, action: 'COMPLETE' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to complete investment')
      }

      const completedInvestment = await response.json()
      setInvestments(prev => prev.map(investment => 
        investment.id === completedInvestment.id ? completedInvestment : investment
      ))

      toast({
        title: 'Success',
        description: 'Investment completed successfully',
      })

      return completedInvestment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to complete investment',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const cancelInvestment = useCallback(async (id: string) => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/investments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, action: 'CANCEL' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to cancel investment')
      }

      const cancelledInvestment = await response.json()
      setInvestments(prev => prev.map(investment => 
        investment.id === cancelledInvestment.id ? cancelledInvestment : investment
      ))

      toast({
        title: 'Success',
        description: 'Investment cancelled successfully',
      })

      return cancelledInvestment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to cancel investment',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const getInvestmentById = useCallback((id: string) => {
    return investments.find(investment => investment.id === id)
  }, [investments])

  const getInvestmentsByType = useCallback((type: Investment['type']) => {
    return investments.filter(investment => investment.type === type)
  }, [investments])

  const getInvestmentsByRisk = useCallback((risk: Investment['risk']) => {
    return investments.filter(investment => investment.risk === risk)
  }, [investments])

  const calculateTotalInvestments = useCallback(() => {
    return investments.reduce((total, investment) => {
      if (investment.status === 'ACTIVE') {
        return total + investment.amount
      }
      return total
    }, 0)
  }, [investments])

  const calculateTotalReturns = useCallback(() => {
    return investments.reduce((total, investment) => {
      if (investment.status === 'COMPLETED' && investment.return) {
        return total + investment.return
      }
      return total
    }, 0)
  }, [investments])

  const getActiveInvestments = useCallback(() => {
    return investments.filter(investment => investment.status === 'ACTIVE')
  }, [investments])

  const getCompletedInvestments = useCallback(() => {
    return investments.filter(investment => investment.status === 'COMPLETED')
  }, [investments])

  return {
    investments,
    isLoading,
    error,
    fetchInvestments,
    createInvestment,
    completeInvestment,
    cancelInvestment,
    getInvestmentById,
    getInvestmentsByType,
    getInvestmentsByRisk,
    calculateTotalInvestments,
    calculateTotalReturns,
    getActiveInvestments,
    getCompletedInvestments,
  }
} 