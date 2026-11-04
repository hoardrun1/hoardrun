import { useNotifications } from '@/contexts/NotificationContext'

/** The unread count for badges, from the same notification list the bell and the page use. */
export function useNotificationCount() {
  const { unreadCount, refreshNotifications } = useNotifications()
  return {
    unreadCount,
    isLoading: false,
    error: null as string | null,
    refreshCount: refreshNotifications,
  }
}
