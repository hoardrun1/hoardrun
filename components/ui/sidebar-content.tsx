'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import {
  Home,
  PiggyBank,
  TrendingUp,
  ArrowUpRight,
  CreditCard,
  Settings,
  User,
  Bell,
  HelpCircle,
  LogOut,
  Wallet,
  BarChart3,
  Target,
  Receipt,
  Shield,
  Phone,
  ChevronRight,
  Plus,
  Calculator,
  Layout,
  Sparkles,
  Star,
  Crown,
  Zap,
  Circle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { navigation } from '@/lib/navigation'
import { useSidebar } from './sidebar-layout'
import { useNotificationCount } from '@/hooks/useNotificationCount'

interface SidebarContentProps {
  onAddMoney?: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: string
  description?: string
  color?: string
  premium?: boolean
}

const menuSections = {
  main: [
    { id: 'home', label: 'Home', icon: Layout, href: '/home', description: 'Main dashboard', color: 'from-white to-gray-100' },
    { id: 'overview', label: 'Overview', icon: BarChart3, href: '/overview', description: 'Financial overview', color: 'from-white to-gray-100' },
    { id: 'budget', label: 'Budget', icon: Calculator, href: '/budget', description: 'Track spending', color: 'from-white to-gray-100' },
    { id: 'savings', label: 'Savings', icon: PiggyBank, href: '/savings', description: 'Goals & plans', color: 'from-white to-gray-100' },
    { id: 'investment', label: 'Investment', icon: TrendingUp, href: '/investment', description: 'Grow wealth', color: 'from-white to-gray-100', premium: true },
  ],
  financial: [
    { id: 'cards', label: 'Cards', icon: CreditCard, href: '/cards', description: 'Manage cards', color: 'from-white to-gray-100' },
    { id: 'send', label: 'Send Money', icon: ArrowUpRight, href: '/send', description: 'Transfer funds', color: 'from-white to-gray-100' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, href: '/transactions', description: 'History', color: 'from-white to-gray-100' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics', description: 'Insights', color: 'from-white to-gray-100', premium: true },
  ],
  account: [
    { id: 'profile', label: 'Profile', icon: User, href: '/profile', description: 'Personal info', color: 'from-white to-gray-100' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings', description: 'Preferences', color: 'from-white to-gray-100' },
    { id: 'security', label: 'Security', icon: Shield, href: '/security', description: 'Account safety', color: 'from-white to-gray-100' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/notifications', badge: '3', color: 'from-white to-gray-100' },
  ],
  support: [
    { id: 'help', label: 'Help Center', icon: HelpCircle, href: '/help', description: 'Get support', color: 'from-white to-gray-100' },
    { id: 'contact', label: 'Contact', icon: Phone, href: '/contact', description: 'Reach us', color: 'from-white to-gray-100' },
  ]
}

export function SidebarContent({ onAddMoney }: SidebarContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { setIsOpen } = useSidebar()
  const { unreadCount, isLoading: notificationLoading } = useNotificationCount()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      setCanScrollUp(scrollTop > 0)
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1)
    }
  }

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      checkScrollPosition()
      scrollElement.addEventListener('scroll', checkScrollPosition)
      
      // Check on resize
      const resizeObserver = new ResizeObserver(checkScrollPosition)
      resizeObserver.observe(scrollElement)
      
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollPosition)
        resizeObserver.disconnect()
      }
    }
  }, [])

  const isActiveRoute = (href: string) => {
    if (href === '/home') return pathname === '/home' || pathname === '/'
    if (href === '/overview') return pathname === '/overview'
    return pathname?.startsWith(href) || false
  }

  const handleNavigation = (href: string) => {
    // Use direct router.push for faster navigation
    router.push(href)
    // Close sidebar on mobile after navigation
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsOpen(false)
    }
  }

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logout clicked')
    setIsOpen(false)
  }

  const renderMenuSection = (title: string, items: MenuItem[]) => {
    return (
      <div className="mb-4 lg:mb-5">
        <div className="flex items-center gap-2 mb-3 lg:mb-3 px-1 lg:px-2">
          <div className="w-1 h-4 bg-gradient-to-b from-white/60 to-white/20 rounded-full" />
          <h3 className="text-[10px] lg:text-xs font-bold text-white/60 uppercase tracking-wider">
            {title}
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
        </div>
        <div className="space-y-1 lg:space-y-1">
          {items.map((item, index) => {
            // Use real notification count for notifications item
            const displayBadge = item.id === 'notifications' 
              ? (unreadCount > 0 ? unreadCount.toString() : undefined)
              : item.badge
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center gap-3 lg:gap-3 p-2 lg:p-2 rounded-xl lg:rounded-xl transition-all duration-500 group relative overflow-hidden ${
                  isActiveRoute(item.href)
                    ? 'bg-gradient-to-r from-white/20 to-white/10 text-white shadow-2xl border border-white/30'
                    : 'text-white/70 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:text-white hover:shadow-xl'
                }`}
              >
                {/* Active indicator with gradient */}
                {isActiveRoute(item.href) && (
                  <div className={`absolute left-0 top-0 w-1 lg:w-1.5 h-full bg-gradient-to-b ${item.color || 'from-white to-white/50'} rounded-r-full`} />
                )}
                
                {/* Icon container with enhanced styling */}
                <div className={`relative p-2 lg:p-2 rounded-lg lg:rounded-lg transition-all duration-500 ${
                  isActiveRoute(item.href)
                    ? `bg-gradient-to-br ${item.color || 'from-white/20 to-white/10'} shadow-lg backdrop-blur-sm`
                    : 'bg-white/10 group-hover:bg-white/20 backdrop-blur-sm'
                }`}>
                  {/* Premium badge */}
                  {item.premium && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-white to-gray-200 rounded-full flex items-center justify-center border border-black">
                      <Crown className="w-1.5 h-1.5 text-black" />
                    </div>
                  )}
                  
                  <item.icon className={`h-4 w-4 lg:h-4 lg:w-4 transition-all duration-500 ${
                    isActiveRoute(item.href) ? 'text-white drop-shadow-lg' : 'text-white/70 group-hover:text-white'
                  }`} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-[11px] lg:text-xs transition-all duration-500 ${
                      isActiveRoute(item.href) ? 'text-white drop-shadow-sm' : 'group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                    {displayBadge && (
                      <Badge
                        className={`ml-2 text-[8px] lg:text-[9px] font-bold px-1.5 lg:px-1.5 py-0.5 transition-all duration-500 ${
                          isActiveRoute(item.href)
                            ? `bg-gradient-to-r ${item.color || 'from-white/30 to-white/20'} text-white border border-white/30`
                            : 'bg-white/20 text-white/70 group-hover:bg-white/30 group-hover:text-white border border-white/20'
                        }`}
                      >
                        {displayBadge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className={`text-[9px] lg:text-[10px] mt-0.5 lg:mt-0.5 transition-all duration-500 hidden lg:block ${
                      isActiveRoute(item.href)
                        ? 'text-white/80'
                        : 'text-white/50 group-hover:text-white/70'
                    }`}>
                      {item.description}
                    </p>
                  )}
                </div>
                
                {/* Arrow */}
                <ChevronRight className={`h-3 w-3 lg:h-3 lg:w-3 transition-all duration-500 ${
                  isActiveRoute(item.href) ? 'text-white drop-shadow-sm' : 'text-white/50 group-hover:text-white/70'
                }`} />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={sidebarRef}
      className="h-full w-full overflow-hidden relative bg-gradient-to-b from-gray-900 via-black to-gray-900 border-r border-white/20"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)]"
          animate={{ x: [-100, 100] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Enhanced scroll indicators */}
      <AnimatePresence key="scroll-indicators">
        {canScrollUp && (
          <motion.div
            key="scroll-up"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black via-black/80 to-transparent z-10 flex items-center justify-center"
          >
            <motion.div
              className="w-3 h-3 border-t-2 border-l-2 border-white/60 transform rotate-45 -translate-y-1"
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
        {canScrollDown && (
          <motion.div
            key="scroll-down"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black via-black/80 to-transparent z-10 flex items-center justify-center"
          >
            <motion.div
              className="w-3 h-3 border-b-2 border-r-2 border-white/60 transform rotate-45 translate-y-1"
              animate={{ y: [2, -2, 2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable content */}
      <div 
        ref={scrollRef}
        className="h-full overflow-y-auto overflow-x-hidden sidebar-scrollbar pt-6 pb-6 relative z-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#000000 #000000'
        }}
      >
        {/* Enhanced Header */}
        <motion.div 
          className="pt-4 px-4 pb-4 lg:pt-5 lg:px-5 lg:pb-5 border-b border-white/20 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Brand Identity with enhanced styling */}
          <div className="flex items-center gap-3 mb-4 lg:gap-3 lg:mb-4">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-gradient-to-br from-white via-gray-100 to-gray-200 p-2 lg:p-2 rounded-xl lg:rounded-xl shadow-2xl border border-white/20">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Wallet className="h-5 w-5 lg:h-5 lg:w-5 text-black" />
                </motion.div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white/20 rounded-xl lg:rounded-2xl blur-xl -z-10" />
            </motion.div>
            <div>
              <motion.h1 
                className="text-xl lg:text-xl font-black text-white tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                HoardRun
              </motion.h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] lg:text-xs text-white/60 font-medium">Premium Banking</p>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-3 w-3 text-white" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Enhanced User Profile */}
          <motion.div
            className="flex items-center gap-3 p-3 lg:gap-3 lg:p-3 bg-gradient-to-r from-white/10 to-white/5 rounded-xl lg:rounded-xl border border-white/20 backdrop-blur-sm"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <motion.div 
                className="w-10 h-10 lg:w-10 lg:h-10 bg-gradient-to-br from-white to-gray-200 rounded-xl lg:rounded-xl flex items-center justify-center shadow-xl border border-white/30"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <User className="h-5 w-5 lg:h-5 lg:w-5 text-black" />
              </motion.div>
              <motion.div 
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-white to-gray-200 rounded-full border-2 border-black flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Circle className="w-1.5 h-1.5 text-black fill-current" />
              </motion.div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-[11px] lg:text-xs truncate">
                {user?.name || 'Guest'}
              </p>
              <p className="text-[9px] lg:text-[10px] text-white/60 truncate">
                {user?.email || 'Please sign in'}
              </p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Star className="h-4 w-4 text-white" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Quick Action */}
        <motion.div 
          className="px-4 py-3 lg:px-5 lg:py-4 border-b border-white/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            onClick={onAddMoney}
            className="w-full bg-gradient-to-r from-white to-gray-100 text-black font-bold py-3 lg:py-3 text-xs lg:text-xs rounded-xl lg:rounded-xl shadow-2xl hover:from-gray-100 hover:to-white transition-all duration-500 hover:scale-105 hover:shadow-3xl border border-white/20 group relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Plus className="h-4 w-4 lg:h-4 lg:w-4 mr-2 relative z-10" />
            </motion.div>
            <span className="relative z-10">Add Money</span>
          </Button>
        </motion.div>

        {/* Enhanced Navigation Menu */}
        <motion.div 
          className="px-4 py-3 lg:px-5 lg:py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {renderMenuSection('Main', menuSections.main)}
          {renderMenuSection('Financial', menuSections.financial)}
          {renderMenuSection('Account', menuSections.account)}
          {renderMenuSection('Support', menuSections.support)}
        </motion.div>

        {/* Enhanced Logout */}
        <motion.div 
          className="px-4 py-3 lg:px-5 lg:py-4 border-t border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-white/60 hover:text-white hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 rounded-xl lg:rounded-xl p-3 lg:p-3 text-xs lg:text-xs transition-all duration-500 group border border-transparent hover:border-white/20"
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ duration: 0.2 }}
            >
              <LogOut className="h-4 w-4 lg:h-4 lg:w-4 mr-3 group-hover:text-red-400 transition-colors duration-300" />
            </motion.div>
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
