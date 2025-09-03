'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, Info, DollarSign, Shield } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

export function GlobalNotificationBanner() {
  const { notifications, removeNotification } = useNotifications();

  // Only show the most recent notification
  const currentNotification = notifications[0];

  if (!currentNotification) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction': return DollarSign;
      case 'success': return Check;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'security': return Shield;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'transaction':
        return 'bg-gray-900 border-gray-700 text-white';
      case 'success':
        return 'bg-gray-800 border-gray-600 text-gray-100';
      case 'warning':
        return 'bg-gray-700 border-gray-500 text-gray-100';
      case 'error':
        return 'bg-gray-900 border-gray-600 text-white';
      case 'security':
        return 'bg-gray-800 border-gray-600 text-gray-100';
      case 'info':
        return 'bg-gray-900 border-gray-700 text-white';
      default:
        return 'bg-gray-800 border-gray-600 text-gray-100';
    }
  };

  const Icon = getNotificationIcon(currentNotification.type);
  const styles = getNotificationStyles(currentNotification.type);

  return (
    <AnimatePresence>
      <motion.div
        key={currentNotification.id}
        initial={{ opacity: 0, y: -100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.95 }}
        transition={{ 
          type: 'spring', 
          damping: 25, 
          stiffness: 200,
          duration: 0.4
        }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4"
      >
        <div className={`${styles} border rounded-lg shadow-lg backdrop-blur-sm`}>
          <div className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <div className="p-1.5 sm:p-2 bg-white/10 rounded-full">
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">
                  {currentNotification.title}
                </h4>
                <p className="text-xs sm:text-sm opacity-90 leading-tight sm:leading-relaxed">
                  {currentNotification.message}
                </p>
              </div>

              <button
                onClick={() => removeNotification(currentNotification.id)}
                className="flex-shrink-0 p-0.5 sm:p-1 hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Close notification"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>

            {/* Progress bar showing time remaining */}
            <motion.div
              className="mt-2 sm:mt-3 h-0.5 sm:h-1 bg-white/20 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="h-full bg-white/60 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ 
                  duration: (currentNotification.duration || 5000) / 1000,
                  ease: 'linear'
                }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
