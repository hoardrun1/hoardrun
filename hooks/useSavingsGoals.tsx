import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

enum SavingsStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED'
}

enum SavingsFrequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY'
}

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  status: SavingsStatus
  autoSave: boolean
  autoSaveAmount?: number
  frequency?: SavingsFrequency
}

interface CreateSavingsGoalData {
  name: string
  targetAmount: number
  deadline?: Date
  autoSave?: boolean
  autoSaveAmount?: number
  frequency?: SavingsFrequency
}

export function useSavingsGoals() {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSavingsGoals = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/savings')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch savings goals')
      }

      setSavingsGoals(data.savingsGoals)
      return data.savingsGoals
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch savings goals'
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

  const createSavingsGoal = useCallback(async (data: CreateSavingsGoalData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/savings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create savings goal')
      }

      setSavingsGoals(prev => [...prev, result.savingsGoal])
      toast({
        title: "Success",
        description: "Savings goal created successfully",
      })

      return result.savingsGoal
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create savings goal'
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

  const updateSavingsGoal = useCallback(async (
    id: string,
    data: Partial<CreateSavingsGoalData>
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/savings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update savings goal')
      }

      setSavingsGoals(prev =>
        prev.map(goal => (goal.id === id ? result.savingsGoal : goal))
      )
      toast({
        title: "Success",
        description: "Savings goal updated successfully",
      })

      return result.savingsGoal
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update savings goal'
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

  const deleteSavingsGoal = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/savings/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete savings goal')
      }

      setSavingsGoals(prev => prev.filter(goal => goal.id !== id))
      toast({
        title: "Success",
        description: "Savings goal deleted successfully",
      })

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete savings goal'
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const calculateProgress = useCallback((goal: SavingsGoal) => {
    return (goal.currentAmount / goal.targetAmount) * 100
  }, [])

  const getRemainingAmount = useCallback((goal: SavingsGoal) => {
    return goal.targetAmount - goal.currentAmount
  }, [])

  const getTimeRemaining = useCallback((goal: SavingsGoal) => {
    if (!goal.deadline) return null
    const now = new Date()
    const deadline = new Date(goal.deadline)
    const diff = deadline.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 30) {
      const months = Math.floor(days / 30)
      return `${months} month${months > 1 ? 's' : ''} left`
    }
    return `${days} day${days > 1 ? 's' : ''} left`
  }, [])

  const getActiveGoals = useCallback(() => {
    return savingsGoals.filter(goal => goal.status === SavingsStatus.ACTIVE)
  }, [savingsGoals])

  const getCompletedGoals = useCallback(() => {
    return savingsGoals.filter(goal => goal.status === SavingsStatus.COMPLETED)
  }, [savingsGoals])

  return {
    savingsGoals,
    isLoading,
    error,
    fetchSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    calculateProgress,
    getRemainingAmount,
    getTimeRemaining,
    getActiveGoals,
    getCompletedGoals,
  }
} 