'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export interface GlobalNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'transaction' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  seen: boolean; // Track if notification has been seen to avoid showing on refresh
  link?: string | null; // App page the notification opens
}

interface NotificationContextType {
  notifications: GlobalNotification[];
  addNotification: (notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'read' | 'seen'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  hasUnreadNotifications: boolean;
  unreadCount: number;
  hasNewNotifications: boolean; // For bell animation
  markNotificationsAsSeen: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// How often to check for new notifications while the app is open
const POLL_MS = 30_000;

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

/** Notifications live on the server, raised by real events; this keeps the open app in step with them. */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    const response = await apiClient.getNotifications({ limit: 100 });
    const items = response.data?.items;
    if (Array.isArray(items)) {
      setNotifications(items.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
    }
  }, [user]);

  // Load now, every half minute, and when the person comes back to the tab
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    refreshNotifications();
    const timer = window.setInterval(refreshNotifications, POLL_MS);
    const onFocus = () => document.visibilityState === 'visible' && refreshNotifications();
    document.addEventListener('visibilitychange', onFocus);
    // Money moved in this tab (a send, a deposit) can create a notification straight away
    window.addEventListener('hoardrun:balance-changed', refreshNotifications);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('hoardrun:balance-changed', refreshNotifications);
    };
  }, [user, refreshNotifications]);

  // A note for this visit only, for messages the server doesn't need to keep
  const addNotification = useCallback((notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'read' | 'seen'>) => {
    setNotifications(prev => [{ ...notification, id: `local-${Date.now()}`, timestamp: new Date(), read: false, seen: false }, ...prev]);
  }, []);

  // Each change shows at once and is saved on the server; local-only notes skip the server
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!id.startsWith('local-')) apiClient.deleteNotification(id);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true, seen: true } : n)));
    if (!id.startsWith('local-')) apiClient.markNotificationAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true, seen: true })));
    apiClient.markAllNotificationsRead();
  }, []);

  const markNotificationsAsSeen = useCallback(() => {
    setNotifications(prev => {
      if (prev.every(n => n.seen)) return prev;
      apiClient.markNotificationsSeen();
      return prev.map(n => ({ ...n, seen: true }));
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    apiClient.clearNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    hasUnreadNotifications: unreadCount > 0,
    unreadCount,
    hasNewNotifications: notifications.some(n => !n.seen),
    markNotificationsAsSeen,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
