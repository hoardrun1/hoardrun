'use client'

import { useCallback, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient, type SavingsGoalInput } from '@/lib/api-client'

export interface SavingsGoal {
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

const unwrap = <T,>(response: { data?: T; error?: string }): T => {
  if (response.error || response.data === undefined) throw new Error(response.error || 'Something went wrong')
  return response.data
}

/** Savings goals stored on the server. Adding money takes it from Hoardrun cash; withdrawing puts it back. */
export function useSavings() {
  const { user } = useAuth()
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSavingsGoals = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const goals = unwrap(await apiClient.getSavings())
      setSavingsGoals(Array.isArray(goals) ? goals : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your goals')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const replace = (goal: SavingsGoal) => setSavingsGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)))

  const createSavingsGoal = useCallback(async (data: SavingsGoalInput) => {
    const goal = unwrap<SavingsGoal>(await apiClient.createSavingsGoal(data))
    setSavingsGoals((prev) => [goal, ...prev])
    return goal
  }, [])

  const updateSavingsGoal = useCallback(async (id: string, data: Partial<SavingsGoalInput>) => {
    const goal = unwrap<SavingsGoal>(await apiClient.updateSavingsGoal(id, data))
    replace(goal)
    return goal
  }, [])

  const deleteSavingsGoal = useCallback(async (id: string) => {
    const result = unwrap<{ returnedToCash: number }>(await apiClient.deleteSavingsGoal(id))
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id))
    return result
  }, [])

  const moveGoalMoney = useCallback(async (id: string, direction: 'contribute' | 'withdraw', amount: number) => {
    const goal = unwrap<SavingsGoal & { cashAvailable: number }>(await apiClient.moveGoalMoney(id, direction, amount))
    replace(goal)
    return goal
  }, [])

  return {
    savingsGoals,
    isLoading,
    error,
    fetchSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    moveGoalMoney,
  }
}
