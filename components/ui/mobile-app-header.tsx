'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { Notifications } from './notifications'

interface MobileAppHeaderProps {
  onProfileClick?: () => void
  onNotificationClick?: () => void
}

export function MobileAppHeader({ onProfileClick, onNotificationClick }: MobileAppHeaderProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { unreadCount, markAllAsRead } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick()
    } else {
      router.push('/profile')
    }
  }

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick()
    } else {
      setShowNotifications(true)
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.320, 1] }}
        className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 h-16">
          {/* Left Side - Logo Only */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center border border-gray-200">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-lg font-bold text-gray-900">HoardRun</span>
          </div>

          {/* Right Side - Profile & Notifications */}
          <div className="flex items-center gap-2">
            {/* Notification Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="relative h-10 w-10 rounded-full hover:bg-gray-100"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* Profile Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleProfileClick}
              className="h-10 w-10 rounded-full hover:bg-gray-100"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-700" />
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Notifications Panel - Mobile Only */}
      <div className="lg:hidden">
        <Notifications
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={() => {
            markAllAsRead()
            setShowNotifications(false)
          }}
        />
      </div>
    </>
  )
}
