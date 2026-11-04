'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, ChevronRight, CreditCard, Home, Languages, LogOut, Settings, Sparkles, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { Notifications } from './notifications'
import i18n from '@/lib/i18n'
import { languages } from './language-switcher'

interface MobileAppHeaderProps {
  onProfileClick?: () => void
  onNotificationClick?: () => void
}

const initialsOf = (name?: string, email?: string) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length) return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  return (email?.[0] || 'H').toUpperCase()
}

function Avatar({ size, name, email, picture }: { size: number; name?: string; email?: string; picture?: string }) {
  return (
    <span className="hr-avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {picture ? <img src={picture} alt="" className="h-full w-full rounded-full object-cover" /> : initialsOf(name, email)}
    </span>
  )
}

export function MobileAppHeader({ onProfileClick, onNotificationClick }: MobileAppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { unreadCount, markAllAsRead } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  const [language, setLanguage] = useState(i18n.language)
  // Like most banking apps, the bell lives on Home; elsewhere the avatar carries the unread dot
  const onHome = pathname === '/home' || pathname === '/dashboard'
  const currentLanguage = languages.find((item) => item.code === language) || languages[0]

  // The bar stays clear over the page's hero and frosts once content slides under it
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleProfileClick = () => {
    if (onProfileClick) onProfileClick()
    else setShowProfileMenu(!showProfileMenu)
    setShowLanguages(false)
  }

  const chooseLanguage = (code: string) => {
    i18n.changeLanguage(code)
    setLanguage(code)
    setShowLanguages(false)
  }

  const openNotifications = () => {
    setShowProfileMenu(false)
    handleNotificationClick()
  }

  const handleNotificationClick = () => {
    if (onNotificationClick) onNotificationClick()
    else setShowNotifications(true)
  }

  const go = (path: string) => {
    setShowProfileMenu(false)
    router.push(path)
  }

  const menuItems = [
    { label: 'Profile', icon: User, path: '/profile' },
    { label: 'Home', icon: Home, path: '/home' },
    { label: 'Cards', icon: CreditCard, path: '/cards' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="hr-topbar lg:hidden fixed top-0 left-0 right-0 z-40"
        data-scrolled={scrolled}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <div className="relative">
            <button onClick={handleProfileClick} className="hr-focus relative flex items-center rounded-full" aria-label={!onHome && unreadCount > 0 ? `Open account menu, ${unreadCount} unread notifications` : "Open account menu"} aria-expanded={showProfileMenu}>
              <Avatar size={38} name={user?.name} email={user?.email} picture={user?.profilePictureUrl} />
              {!onHome && unreadCount > 0 && <span className="hr-avatar-dot" aria-hidden="true" />}
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -8 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                    style={{ transformOrigin: 'top left' }}
                    className="hr-menu absolute left-0 top-12 z-50 max-h-[calc(100dvh-5rem)] w-[min(18rem,calc(100vw-2rem))] !overflow-y-auto"
                  >
                    <div className="flex items-center gap-3 p-4">
                      <Avatar size={44} name={user?.name} email={user?.email} picture={user?.profilePictureUrl} />
                      <div className="min-w-0">
                        <p className="hr-card-title truncate text-[17px] text-white">{user?.name || 'Your account'}</p>
                        <p className="truncate text-[13px] text-[#8e8e93]">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mx-4 h-px bg-white/10" />
                    <div className="p-2">
                      {menuItems.map(({ label, icon: Icon, path }) => (
                        <button key={path} onClick={() => go(path)} className="hr-menu-item hr-focus">
                          <Icon className="h-[18px] w-[18px] text-[#a1a1a6]" strokeWidth={1.8} />
                          <span className="flex-1 text-left">{label}</span>
                          <ChevronRight className="h-4 w-4 text-[#48484a]" strokeWidth={2} />
                        </button>
                      ))}
                      <button onClick={() => go('/assistant')} className="hr-menu-item hr-focus">
                        <Sparkles className="h-[18px] w-[18px] text-[#5aa9ff]" strokeWidth={1.8} />
                        <span className="flex-1 text-left">Hoardrun AI</span>
                        <ChevronRight className="h-4 w-4 text-[#48484a]" strokeWidth={2} />
                      </button>
                      <button onClick={openNotifications} className="hr-menu-item hr-focus">
                        <Bell className="h-[18px] w-[18px] text-[#a1a1a6]" strokeWidth={1.8} />
                        <span className="flex-1 text-left">Notifications</span>
                        {unreadCount > 0 && <span className="hr-menu-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                        <ChevronRight className="h-4 w-4 text-[#48484a]" strokeWidth={2} />
                      </button>
                      <button onClick={() => setShowLanguages(!showLanguages)} className="hr-menu-item hr-focus" aria-expanded={showLanguages}>
                        <Languages className="h-[18px] w-[18px] text-[#a1a1a6]" strokeWidth={1.8} />
                        <span className="flex-1 text-left">Language</span>
                        <span className="text-[13px] text-[#8e8e93]">{currentLanguage.name}</span>
                        <ChevronRight className="h-4 w-4 text-[#48484a] transition-transform" style={{ rotate: showLanguages ? '90deg' : '0deg' }} strokeWidth={2} />
                      </button>
                      <AnimatePresence initial={false}>
                        {showLanguages && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="hr-lang-grid">
                              {languages.map((item) => (
                                <button key={item.code} onClick={() => chooseLanguage(item.code)} className="hr-lang hr-focus" data-active={item.code === currentLanguage.code}>
                                  <span className="text-base leading-none">{item.flag}</span>
                                  <span className="min-w-0 flex-1 truncate text-left">{item.name}</span>
                                  {item.code === currentLanguage.code && <Check className="h-3.5 w-3.5" strokeWidth={2.4} />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="mx-2 my-1.5 h-px bg-white/10" />
                      <button onClick={() => go('/signout')} className="hr-menu-item hr-focus">
                        <LogOut className="h-[18px] w-[18px] text-[#a1a1a6]" strokeWidth={1.8} />
                        <span className="flex-1 text-left">Sign out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {onHome && (
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => router.push('/assistant')}
              className="hr-round hr-focus"
              aria-label="Ask Hoardrun AI"
            >
              <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleNotificationClick}
              className="hr-round hr-focus"
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="hr-badge"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          )}
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
