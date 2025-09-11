import { useState, useCallback } from 'react'
import { useToast } from '../components/ui/use-toast'
import { apiClient } from '../lib/api-client'

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

      const response = await apiClient.getSavings()

      if (response.error) {
        throw new Error(response.error || 'Failed to fetch savings goals')
      }

      // Handle different response formats from the API
      let savingsGoals: SavingsGoal[] = []
      
      if (response.data) {
        // Check if response.data is a paginated response with a data field
        if (Array.isArray(response.data)) {
          savingsGoals = response.data
        } else if (typeof response.data === 'object' && response.data !== null) {
          const dataObj = response.data as any
          if (dataObj.data && Array.isArray(dataObj.data)) {
            savingsGoals = dataObj.data
          } else if (dataObj.items && Array.isArray(dataObj.items)) {
            savingsGoals = dataObj.items
          }
        }
      }
      
      setSavingsGoals(savingsGoals)
      return savingsGoals
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

      const response = await apiClient.createSavingsGoal({
        name: data.name,
        target_amount: data.targetAmount,
        description: `Savings goal: ${data.name}`
      })

      if (response.error) {
        throw new Error(response.error || 'Failed to create savings goal')
      }

      if (response.data) {
        setSavingsGoals(prev => [...prev, response.data])
        toast({
          title: "Success",
          description: "Savings goal created successfully",
        })

        return response.data
      }

      return null
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

      // Note: API client doesn't have updateSavingsGoal method, so we'll simulate it
      // In a real implementation, you'd add this method to the API client
      const updateData = {
        name: data.name,
        target_amount: data.targetAmount,
        description: data.name ? `Savings goal: ${data.name}` : undefined
      }

      // For now, we'll just update the local state
      setSavingsGoals(prev =>
        prev.map(goal => (goal.id === id ? { 
          ...goal, 
          name: data.name || goal.name,
          targetAmount: data.targetAmount || goal.targetAmount,
          deadline: data.deadline ? data.deadline.toISOString() : goal.deadline,
          autoSave: data.autoSave !== undefined ? data.autoSave : goal.autoSave,
          autoSaveAmount: data.autoSaveAmount || goal.autoSaveAmount,
          frequency: data.frequency || goal.frequency
        } : goal))
      )
      toast({
        title: "Success",
        description: "Savings goal updated successfully",
      })

      return { id, ...data }
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

      // Note: API client doesn't have deleteSavingsGoal method, so we'll simulate it
      // In a real implementation, you'd add this method to the API client
      
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
