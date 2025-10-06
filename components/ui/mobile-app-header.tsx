'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, User, Search, Settings, LogOut, CreditCard, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { useSidebar } from './sidebar-layout'
import { Notifications } from './notifications'
import { LanguageSwitcher } from './language-switcher'

interface MobileAppHeaderProps {
  onProfileClick?: () => void
  onNotificationClick?: () => void
}

export function MobileAppHeader({ onProfileClick, onNotificationClick }: MobileAppHeaderProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { unreadCount, markAllAsRead } = useNotifications()
  const { toggle: toggleSidebar, isLargeScreen } = useSidebar()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick()
    } else {
      setShowProfileMenu(!showProfileMenu)
    }
  }

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick()
    } else {
      setShowNotifications(true)
    }
  }



  const navigateToProfile = () => {
    router.push('/profile')
    setShowProfileMenu(false)
  }

  const navigateToSettings = () => {
    router.push('/settings')
    setShowProfileMenu(false)
  }

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.320, 1] }}
        className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-white/95 via-white/98 to-white/95 dark:from-gray-950/95 dark:via-gray-950/98 dark:to-gray-950/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between px-16 sm:px-4 py-3 h-14 sm:h-16">
          {/* Left Side - Logo */}
          <div className="flex items-center gap-8 sm:gap-3">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                  HoardRun
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium -mt-1 hidden sm:block">
                  Financial Hub
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher variant="mobile" />

            {/* Search Button - Hidden on small mobile */}
            <motion.div whileTap={{ scale: 0.95 }} className="hidden xs:block">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-300"
                aria-label="Search"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-300" />
              </Button>
            </motion.div>

            {/* Notification Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationClick}
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-300" />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs shadow-lg bg-gradient-to-br from-red-500 to-red-600 border-2 border-white dark:border-gray-950"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Profile Button */}
            <motion.div whileTap={{ scale: 0.95 }} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleProfileClick}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-300 shadow-sm hover:shadow-md border-2 border-transparent hover:border-primary/20"
                aria-label="View profile"
              >
                {user?.profilePictureUrl ? (
                  <div className="relative">
                    <img
                      src={user.profilePictureUrl}
                      alt="Profile"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-cover ring-2 ring-white dark:ring-gray-950"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-950 shadow-sm" />
                  </div>
                ) : (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-md">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </Button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute right-0 top-12 w-64 sm:w-72 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
                    >
                      {/* Profile Header */}
                      <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          {user?.profilePictureUrl ? (
                            <img
                              src={user.profilePictureUrl}
                              alt="Profile"
                              className="h-12 w-12 rounded-xl object-cover ring-2 ring-white dark:ring-gray-950 shadow-md"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-md">
                              <User className="h-6 w-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground truncate">
                              {user?.name || 'User'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {user?.email || 'user@example.com'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={navigateToProfile}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 group-hover:from-blue-500/20 group-hover:to-blue-500/10 transition-all">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-foreground">View Profile</span>
                        </button>
                        
                        <button
                          onClick={() => router.push('/cards')}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 group-hover:from-purple-500/20 group-hover:to-purple-500/10 transition-all">
                            <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-foreground">My Cards</span>
                        </button>

                        <button
                          onClick={() => router.push('/dashboard')}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 group-hover:from-green-500/20 group-hover:to-green-500/10 transition-all">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Dashboard</span>
                        </button>

                        <button
                          onClick={navigateToSettings}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500/10 to-gray-500/5 group-hover:from-gray-500/20 group-hover:to-gray-500/10 transition-all">
                            <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Settings</span>
                        </button>

                        <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

                        <button
                          onClick={() => {/* Handle logout */}}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/5 group-hover:from-red-500/20 group-hover:to-red-500/10 transition-all">
                            <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 origin-left"
        />
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