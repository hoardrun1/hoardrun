'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SmartNotification {
  id: string;
  user_id: string;
  type: 'surplus_detected' | 'investment_opportunity' | 'overspending_warning' | 
        'goal_progress_nudge' | 'savings_opportunity' | 'emergency_fund_reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recommended_action: string;
  action_details: Record<string, any>;
  amount?: number;
  category?: string;
  goal_id?: string;
  is_read: boolean;
  is_acted_upon: boolean;
  created_at: string;
}

export interface SmartNotificationSettings {
  enabled: boolean;
  surplus_notifications: boolean;
  investment_notifications: boolean;
  overspending_notifications: boolean;
  goal_notifications: boolean;
  savings_notifications: boolean;
  max_daily_nudges: number;
  min_surplus_amount: number;
  overspending_threshold_percentage: number;
}

export function useSmartNotifications() {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [settings, setSettings] = useState<SmartNotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/v1/smart-notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate new notifications
  const generateNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/v1/smart-notifications/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to generate notifications: ${response.statusText}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate notifications';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/v1/smart-notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  // Mark as acted upon
  const markAsActedUpon = useCallback(async (notificationId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/v1/smart-notifications/${notificationId}/action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark as acted upon');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_acted_upon: true, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as acted upon:', err);
      throw err;
    }
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/v1/smart-notifications/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      return data.settings;
    } catch (err) {
      console.error('Error fetching settings:', err);
      throw err;
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<SmartNotificationSettings>) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/v1/smart-notifications/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      return data.settings;
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  }, []);

  // Computed values
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length;
  const actedUponCount = notifications.filter(n => n.is_acted_upon).length;

  return {
    notifications,
    settings,
    loading,
    error,
    unreadCount,
    highPriorityCount,
    actedUponCount,
    fetchNotifications,
    generateNotifications,
    markAsRead,
    markAsActedUpon,
    fetchSettings,
    updateSettings,
  };
}

