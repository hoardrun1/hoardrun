import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/AuthContext'

export function useNotificationCount() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotificationCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      
      // Fetch notification summary to get unread count
      const response = await apiClient.getNotificationSummary()
      
      if (response.error) {
        console.error('Failed to fetch notification count:', response.error)
        setError(response.error)
        return
      }

      if (response.data) {
        // Extract unread count from summary data
        const count = response.data.unread_count || response.data.total_unread || 0
        setUnreadCount(count)
      }
    } catch (err) {
      console.error('Error fetching notification count:', err)
      setError('Failed to load notification count')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Fetch count on mount and when user changes
  useEffect(() => {
    fetchNotificationCount()
  }, [fetchNotificationCount])

  // Refresh function for manual updates
  const refreshCount = useCallback(() => {
    fetchNotificationCount()
  }, [fetchNotificationCount])

  return {
    unreadCount,
    isLoading,
    error,
    refreshCount
  }
}
