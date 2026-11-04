'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowDownLeft, Bell, Check, Info, Shield, Trash2, X } from 'lucide-react';
import { useNotifications, type GlobalNotification } from '@/contexts/NotificationContext';

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}

const ICONS: Record<GlobalNotification['type'], typeof Bell> = {
  transaction: ArrowDownLeft,
  success: Check,
  warning: AlertTriangle,
  error: AlertTriangle,
  security: Shield,
  info: Info,
};

const formatTimeAgo = (timestamp: Date) => {
  const diffInMinutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return timestamp.toLocaleDateString();
};

/** Shows what the app has actually told the user: nothing is invented here. */
export function Notifications({ isOpen, onClose, onMarkAllRead }: NotificationsProps) {
  const { notifications, unreadCount, markAsRead, removeNotification, markNotificationsAsSeen } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) markNotificationsAsSeen();
  }, [isOpen, markNotificationsAsSeen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="notifications"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="hr-sheet fixed right-0 top-0 flex h-full w-full max-w-[400px] flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
              <h2 className="hr-section-title">Notifications</h2>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={onMarkAllRead} className="hr-focus h-9 rounded-full px-3 text-[13px] font-medium text-[#c7c7cc] hover:text-white">
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="hr-round hr-focus" aria-label="Close notifications">
                  <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 pb-24 text-center">
                <div className="hr-sheet-empty-art" aria-hidden="true">
                  <Bell className="h-9 w-9" strokeWidth={1.6} />
                </div>
                <p className="hr-card-title mt-6 text-[22px]">You're all caught up</p>
                <p className="hr-sub mt-2 max-w-[260px]">We'll let you know here when money moves or something needs your attention.</p>
              </div>
            ) : (
              <ul className="flex-1 space-y-2 overflow-y-auto px-3 pb-6">
                {notifications.map((notification) => {
                  const Icon = ICONS[notification.type] ?? Bell;
                  return (
                    <li key={notification.id}>
                      <div
                        className="hr-sheet-row"
                        data-unread={!notification.read}
                        onClick={() => {
                          if (!notification.read) markAsRead(notification.id);
                          // Notifications about money open the page where it happened
                          if (notification.link) { onClose(); router.push(notification.link); }
                        }}
                      >
                        <span className="hr-sheet-icon" aria-hidden="true">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-[15px] font-medium text-white">{notification.title}</p>
                            <span className="shrink-0 text-[12px] text-[#8e8e93]">{formatTimeAgo(notification.timestamp)}</span>
                          </div>
                          <p className="mt-0.5 text-[13.5px] leading-snug text-[#a1a1a6]">{notification.message}</p>
                        </div>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="hr-focus -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8e8e93] hover:bg-white/10 hover:text-white"
                          aria-label={`Delete ${notification.title}`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
