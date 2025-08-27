'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  AlertTriangle,
  Info,
  DollarSign,

  Shield,
  Clock,
  Trash2,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';


interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'transaction' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  amount?: number;
  category?: string;
}

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}

export function Notifications({ isOpen, onClose, onMarkAllRead }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'transaction',
      title: 'Payment Received',
      message: 'You received a payment from John Doe',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      amount: 250.00,
      category: 'Income'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Budget Alert',
      message: 'You\'ve spent 85% of your monthly dining budget',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      category: 'Budget'
    },
    {
      id: '3',
      type: 'success',
      title: 'Goal Achieved',
      message: 'Congratulations! You\'ve reached your emergency fund goal',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: false,
      category: 'Savings'
    },
    {
      id: '4',
      type: 'security',
      title: 'Security Alert',
      message: 'New device login detected from Chrome on Windows',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      category: 'Security'
    },
    {
      id: '5',
      type: 'info',
      title: 'Investment Update',
      message: 'Your portfolio gained 2.3% this week',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      amount: 156.78,
      category: 'Investment'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction': return DollarSign;
      case 'success': return Check;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'security': return Shield;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'transaction': return 'text-gray-800 bg-gray-100 dark:bg-gray-800 dark:text-gray-200';
      case 'success': return 'text-gray-800 bg-gray-100 dark:bg-gray-800 dark:text-gray-200';
      case 'warning': return 'text-gray-900 bg-gray-200 dark:bg-gray-700 dark:text-gray-100';
      case 'error': return 'text-black bg-gray-300 dark:bg-gray-600 dark:text-white';
      case 'security': return 'text-gray-700 bg-gray-150 dark:bg-gray-750 dark:text-gray-300';
      case 'info': return 'text-gray-800 bg-gray-100 dark:bg-gray-800 dark:text-gray-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return timestamp.toLocaleDateString();
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: false }
          : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    onMarkAllRead();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70]"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-4 space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                </div>
              ) : (
                notifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        notification.read
                          ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className={`font-medium ${
                              notification.read
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                              >
                                {notification.read ? (
                                  <Mail className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              {notification.category && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {notification.category}
                                  </Badge>
                                </>
                              )}
                            </div>

                            {notification.amount && (
                              <span className={`text-sm font-medium ${
                                notification.type === 'transaction'
                                  ? 'text-gray-800 dark:text-gray-200'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.type === 'transaction' ? '+' : ''}${notification.amount.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
