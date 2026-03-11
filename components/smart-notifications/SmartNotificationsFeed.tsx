'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { SmartNotificationCard, SmartNotification } from './SmartNotificationCard';
import { RefreshCw, Settings, Filter, Bell, BellOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SmartNotificationsFeedProps {
  userId?: string;
  maxNotifications?: number;
  showSettings?: boolean;
}

export function SmartNotificationsFeed({ 
  userId, 
  maxNotifications = 10,
  showSettings = true 
}: SmartNotificationsFeedProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('all');

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/smart-notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Generate new notifications
  const generateNotifications = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/smart-notifications/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/smart-notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Handle action
  const handleTakeAction = async (notification: SmartNotification) => {
    // Mark as acted upon
    try {
      await fetch(`/api/v1/smart-notifications/${notification.id}/action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, is_acted_upon: true } : n)
      );

      // Route based on action type
      switch (notification.recommended_action) {
        case 'invest_now':
          router.push('/finance/investments');
          break;
        case 'save_now':
          router.push('/finance/savings');
          break;
        case 'reduce_spending':
          router.push('/finance/budget');
          break;
        case 'increase_contribution':
          if (notification.goal_id) {
            router.push(`/finance/savings?goal=${notification.goal_id}`);
          }
          break;
        default:
          router.push('/finance');
      }
    } catch (err) {
      console.error('Failed to mark as acted upon:', err);
    }
  };

  // Dismiss notification
  const handleDismiss = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'high_priority') return n.priority === 'high' || n.priority === 'urgent';
    return true;
  }).slice(0, maxNotifications);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">Smart Notifications</h2>
              <p className="text-sm text-gray-500">Intelligent financial nudges</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">{unreadCount} Unread</Badge>
            {highPriorityCount > 0 && (
              <Badge className="bg-orange-500">{highPriorityCount} High Priority</Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchNotifications}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={generateNotifications}
            disabled={loading}
          >
            Generate New
          </Button>
          {showSettings && (
            <Button size="sm" variant="ghost">
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          size="sm"
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          size="sm"
          variant={filter === 'high_priority' ? 'default' : 'outline'}
          onClick={() => setFilter('high_priority')}
        >
          High Priority ({highPriorityCount})
        </Button>
      </div>

      {/* Notifications List */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {loading && !notifications.length ? (
        <Card className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Loading notifications...</p>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="p-8 text-center">
          <BellOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">No notifications to display</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <SmartNotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onTakeAction={handleTakeAction}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}

