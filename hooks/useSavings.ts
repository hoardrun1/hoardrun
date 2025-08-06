import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'
import { mockSavingsGoals } from '@/lib/mock-data/savings'

// Check if auth bypass is enabled
const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
  category: string
  deadline: string
  isAutoSave: boolean
  isCompleted: boolean
  progress: number
  createdAt: string
  updatedAt: string
}

interface CreateSavingsGoalData {
  name: string
  targetAmount: number
  monthlyContribution: number
  category: string
  deadline: string
  isAutoSave: boolean
}

interface UpdateSavingsGoalData {
  name?: string
  targetAmount?: number
  monthlyContribution?: number
  category?: string
  deadline?: string
  isAutoSave?: boolean
  isCompleted?: boolean
}

export function useSavings() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSavingsGoals = useCallback(async () => {
    if (!bypassAuth && !session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      if (bypassAuth) {
        // Use mock data when bypass is enabled
        console.log('Using mock savings data with auth bypass enabled');
        setTimeout(() => {
          setSavingsGoals(mockSavingsGoals);
          setIsLoading(false);
        }, 500); // Simulate network delay
        return;
      }

      // In production, fetch from API
      const response = await fetch('/api/savings')
      if (!response.ok) throw new Error('Failed to fetch savings goals')

      const data = await response.json()
      setSavingsGoals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: 'Failed to fetch savings goals',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const createSavingsGoal = useCallback(async (data: CreateSavingsGoalData) => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      if (isDev) {
        // Create mock goal in development
        console.log('Creating mock savings goal in development mode', data);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const newGoal: SavingsGoal = {
          id: `mock-${Date.now()}`,
          name: data.name,
          targetAmount: data.targetAmount,
          currentAmount: 0,
          monthlyContribution: data.monthlyContribution,
          category: data.category,
          deadline: data.deadline,
          isAutoSave: data.isAutoSave,
          isCompleted: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          daysLeft: 365 // Default to 1 year
        };

        setSavingsGoals(prev => [newGoal, ...prev]);

        toast({
          title: 'Success',
          description: 'Savings goal created successfully',
        });

        return newGoal;
      }

      // In production, use the API
      const response = await fetch('/api/savings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create savings goal')
      }

      const newGoal = await response.json()
      setSavingsGoals(prev => [newGoal, ...prev])

      toast({
        title: 'Success',
        description: 'Savings goal created successfully',
      })

      return newGoal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create savings goal',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const updateSavingsGoal = useCallback(async (id: string, data: UpdateSavingsGoalData) => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/savings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update savings goal')
      }

      const updatedGoal = await response.json()
      setSavingsGoals(prev => prev.map(goal =>
        goal.id === updatedGoal.id ? updatedGoal : goal
      ))

      toast({
        title: 'Success',
        description: 'Savings goal updated successfully',
      })

      return updatedGoal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update savings goal',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const deleteSavingsGoal = useCallback(async (id: string) => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/savings/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete savings goal')
      }

      setSavingsGoals(prev => prev.filter(goal => goal.id !== id))

      toast({
        title: 'Success',
        description: 'Savings goal deleted successfully',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete savings goal',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const contributeToGoal = useCallback(async (id: string, amount: number, type: string = 'MANUAL') => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/savings/${id}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, type }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to contribute to savings goal')
      }

      const updatedGoal = await response.json()
      setSavingsGoals(prev => prev.map(goal =>
        goal.id === updatedGoal.id ? updatedGoal : goal
      ))

      toast({
        title: 'Success',
        description: 'Contribution added successfully',
      })

      return updatedGoal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to contribute to savings goal',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const calculateProgress = useCallback((goal: SavingsGoal) => {
    return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
  }, [])

  const calculateTotalSavings = useCallback(() => {
    return savingsGoals.reduce((total, goal) => total + goal.currentAmount, 0)
  }, [savingsGoals])

  const getGoalsByCategory = useCallback((category: string) => {
    return savingsGoals.filter(goal => goal.category === category)
  }, [savingsGoals])

  const getActiveGoals = useCallback(() => {
    return savingsGoals.filter(goal => !goal.isCompleted)
  }, [savingsGoals])

  const getCompletedGoals = useCallback(() => {
    return savingsGoals.filter(goal => goal.isCompleted)
  }, [savingsGoals])

  const getGoalById = useCallback((id: string) => {
    return savingsGoals.find(goal => goal.id === id)
  }, [savingsGoals])

  return {
    savingsGoals,
    isLoading,
    error,
    fetchSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeToGoal,
    calculateProgress,
    calculateTotalSavings,
    getGoalsByCategory,
    getActiveGoals,
    getCompletedGoals,
    getGoalById,
  }
}