'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface GlobalNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'transaction' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  seen: boolean; // Track if notification has been seen to avoid showing on refresh
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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

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

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('hoardrun-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsed);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('hoardrun-notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'read' | 'seen'>) => {
    const newNotification: GlobalNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
      seen: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const markNotificationsAsSeen = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, seen: true }))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('hoardrun-notifications');
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read);
  const hasUnreadNotifications = unreadNotifications.length > 0;
  const unreadCount = unreadNotifications.length;
  const hasNewNotifications = notifications.some(n => !n.seen);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    hasUnreadNotifications,
    unreadCount,
    hasNewNotifications,
    markNotificationsAsSeen,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
