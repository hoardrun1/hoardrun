'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertTriangle, Info, DollarSign, Shield } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FloatingNotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    hasNewNotifications, 
    markNotificationsAsSeen, 
    markAsRead, 
    removeNotification,
    markAllAsRead 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [shouldPeep, setShouldPeep] = useState(false);

  // Trigger peep animation when new notifications arrive
  useEffect(() => {
    if (hasNewNotifications && !isOpen) {
      setShouldPeep(true);
      // Stop peeping after 3 seconds
      const timer = setTimeout(() => {
        setShouldPeep(false);
        markNotificationsAsSeen();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasNewNotifications, isOpen, markNotificationsAsSeen]);

  // Stop peeping when bell is clicked
  const handleBellClick = () => {
    setIsOpen(!isOpen);
    setShouldPeep(false);
    if (!isOpen) {
      markNotificationsAsSeen();
    }
  };

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
      case 'transaction': return 'text-gray-800 bg-gray-100';
      case 'success': return 'text-gray-800 bg-gray-100';
      case 'warning': return 'text-gray-900 bg-gray-200';
      case 'error': return 'text-black bg-gray-300';
      case 'security': return 'text-gray-700 bg-gray-150';
      case 'info': return 'text-gray-800 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
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

  return (
    <>
      {/* Floating Bell Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-[90]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <motion.button
          onClick={handleBellClick}
          className="relative bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full shadow-2xl transition-colors duration-200"
          animate={shouldPeep ? {
            scale: [1, 1.1, 1, 1.05, 1],
            rotate: [0, -10, 10, -5, 0],
          } : {}}
          transition={shouldPeep ? {
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 0.8,
          } : {}}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="h-5 w-5" />
          
          {/* Notification Count Badge */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}

          {/* Peep Animation Ring */}
          {shouldPeep && (
            <motion.div
              className="absolute inset-0 border-2 border-gray-400 rounded-full"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>
      </motion.div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[80]"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-24 right-6 w-80 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-[90]"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gray-800" />
                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="w-full text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark All as Read
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <ScrollArea className="max-h-96">
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      const colorClass = getNotificationColor(notification.type);

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border mb-2 transition-all duration-200 hover:shadow-md ${
                            notification.read
                              ? 'bg-gray-50 border-gray-200'
                              : 'bg-white border-gray-300 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${colorClass}`}>
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h4 className={`font-medium text-sm ${
                                  notification.read ? 'text-gray-700' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </h4>
                                <button
                                  onClick={() => removeNotification(notification.id)}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>

                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                {notification.message}
                              </p>

                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Mark as read
                                  </button>
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
          </>
        )}
      </AnimatePresence>
    </>
  );
}
