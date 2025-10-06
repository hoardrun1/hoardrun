'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
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
  Crown,
  Circle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from './sidebar-layout'
import { useNotificationCount } from '@/hooks/useNotificationCount'
import { useAppNavigation } from '@/hooks/useAppNavigation'
import { LanguageSwitcher } from './language-switcher'

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



export function SidebarContent({ onAddMoney }: SidebarContentProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { setIsOpen } = useSidebar()
  const { unreadCount } = useNotificationCount()
  const { navigate } = useAppNavigation()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const menuSections = {
    main: [
      { id: 'home', label: t('dashboard.sidebar.home'), icon: Layout, href: '/home', description: t('dashboard.sidebar.home'), color: 'from-white to-gray-100' },
      { id: 'overview', label: t('dashboard.sidebar.overview'), icon: BarChart3, href: '/overview', description: t('dashboard.sidebar.overview'), color: 'from-white to-gray-100' },
      { id: 'budget', label: t('dashboard.sidebar.budget'), icon: Calculator, href: '/budget', description: t('dashboard.sidebar.budget'), color: 'from-white to-gray-100' },
      { id: 'savings', label: t('dashboard.sidebar.savings'), icon: PiggyBank, href: '/savings', description: t('dashboard.sidebar.savings'), color: 'from-white to-gray-100' },
      { id: 'investment', label: t('dashboard.sidebar.investment'), icon: TrendingUp, href: '/investment', description: t('dashboard.sidebar.investment'), color: 'from-white to-gray-100', premium: true },
    ],
    financial: [
      { id: 'cards', label: t('dashboard.sidebar.cards'), icon: CreditCard, href: '/cards', description: t('dashboard.sidebar.cards'), color: 'from-white to-gray-100' },
      { id: 'send', label: t('dashboard.sidebar.send'), icon: ArrowUpRight, href: '/send', description: t('dashboard.sidebar.send'), color: 'from-white to-gray-100' },
      { id: 'transactions', label: t('dashboard.sidebar.transactions'), icon: Receipt, href: '/transactions', description: t('dashboard.sidebar.transactions'), color: 'from-white to-gray-100' },
      { id: 'analytics', label: t('dashboard.sidebar.analytics'), icon: BarChart3, href: '/analytics', description: t('dashboard.sidebar.analytics'), color: 'from-white to-gray-100', premium: true },
    ],
    account: [
      { id: 'profile', label: t('dashboard.sidebar.profile'), icon: User, href: '/profile', description: t('dashboard.sidebar.profile'), color: 'from-white to-gray-100' },
      { id: 'settings', label: t('dashboard.sidebar.settings'), icon: Settings, href: '/settings', description: t('dashboard.sidebar.settings'), color: 'from-white to-gray-100' },
      { id: 'security', label: t('dashboard.sidebar.security'), icon: Shield, href: '/security', description: t('dashboard.sidebar.security'), color: 'from-white to-gray-100' },
      { id: 'notifications', label: t('dashboard.sidebar.notifications'), icon: Bell, href: '/notifications', badge: '3', color: 'from-white to-gray-100' },
    ],
    support: [
      { id: 'help', label: t('dashboard.sidebar.help'), icon: HelpCircle, href: '/help', description: t('dashboard.sidebar.help'), color: 'from-white to-gray-100' },
      { id: 'contact', label: t('dashboard.sidebar.contact'), icon: Phone, href: '/contact', description: t('dashboard.sidebar.contact'), color: 'from-white to-gray-100' },
    ]
  }

  // Check scroll position - optimized for performance
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
      scrollElement.addEventListener('scroll', checkScrollPosition, { passive: true })
      
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
    // Use enhanced navigation with prefetching for faster navigation
    navigate(href, { prefetch: true, immediate: true })
    // Close sidebar on mobile after navigation
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        setIsOpen(false)
      }, 50) // Reduced delay for faster response
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      setIsOpen(false)
      router.push('/')
    }
  }

  const renderMenuSection = (titleKey: string, items: MenuItem[]) => {
    return (
      <div className="mb-4 lg:mb-5">
        <div className="flex items-center gap-2 mb-3 lg:mb-3 px-1 lg:px-2">
          <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.2))' }} />
          <h3 className="text-[10px] lg:text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {t(`dashboard.sidebar.${titleKey}`)}
          </h3>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.2), transparent)' }} />
        </div>
        <div className="space-y-1 lg:space-y-1">
          {items.map((item) => {
            // Use real notification count for notifications item
            const displayBadge = item.id === 'notifications' 
              ? (unreadCount > 0 ? unreadCount.toString() : undefined)
              : item.badge
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center gap-3 lg:gap-3 p-2 lg:p-2 rounded-xl lg:rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActiveRoute(item.href)
                    ? 'shadow-lg border border-white/30'
                    : 'hover:shadow-lg'
                }`}
                style={{
                  backgroundColor: isActiveRoute(item.href) 
                    ? 'rgba(255,255,255,0.15)' 
                    : 'transparent',
                  color: isActiveRoute(item.href) ? '#ffffff' : 'rgba(255,255,255,0.7)'
                }}
                onMouseEnter={(e) => {
                  if (!isActiveRoute(item.href)) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveRoute(item.href)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
              >
                {/* Active indicator with gradient */}
                {isActiveRoute(item.href) && (
                  <div className="absolute left-0 top-0 w-1 lg:w-1.5 h-full rounded-r-full" style={{ background: 'linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.5))' }} />
                )}
                
                {/* Icon container with enhanced styling */}
                <div 
                  className="relative p-2 lg:p-2 rounded-lg lg:rounded-lg transition-all duration-200 backdrop-blur-sm"
                  style={{
                    backgroundColor: isActiveRoute(item.href) 
                      ? 'rgba(255,255,255,0.15)' 
                      : 'rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Premium badge */}
                  {item.premium && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center border border-black" style={{ backgroundColor: '#ffffff' }}>
                      <Crown className="w-1.5 h-1.5 text-black" />
                    </div>
                  )}
                  
                  <item.icon 
                    className={`h-4 w-4 lg:h-4 lg:w-4 transition-all duration-200 ${
                      isActiveRoute(item.href) ? 'text-white' : 'text-white/70'
                    }`}
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span 
                      className="font-semibold text-[11px] lg:text-xs transition-all duration-200"
                      style={{ 
                        color: isActiveRoute(item.href) ? '#ffffff' : 'inherit',
                        filter: isActiveRoute(item.href) ? 'drop-shadow(0 0 2px rgba(255,255,255,0.2))' : 'none'
                      }}
                    >
                      {item.label}
                    </span>
                    {displayBadge && (
                      <Badge
                        className="ml-2 text-[8px] lg:text-[9px] font-bold px-1.5 lg:px-1.5 py-0.5 transition-all duration-200 border border-white/20"
                        style={{
                          backgroundColor: isActiveRoute(item.href) 
                            ? 'rgba(255,255,255,0.25)' 
                            : 'rgba(255,255,255,0.2)',
                          color: isActiveRoute(item.href) ? '#ffffff' : 'rgba(255,255,255,0.7)'
                        }}
                      >
                        {displayBadge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p 
                      className="text-[9px] lg:text-[10px] mt-0.5 lg:mt-0.5 transition-all duration-200 hidden lg:block"
                      style={{ 
                        color: isActiveRoute(item.href) 
                          ? 'rgba(255,255,255,0.8)' 
                          : 'rgba(255,255,255,0.5)'
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
                
                {/* Arrow */}
                <ChevronRight 
                  className="h-3 w-3 lg:h-3 lg:w-3 transition-all duration-200" 
                  style={{ 
                    color: isActiveRoute(item.href) ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    filter: isActiveRoute(item.href) ? 'drop-shadow(0 0 2px rgba(255,255,255,0.2))' : 'none'
                  }} 
                />
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
      className="h-full w-full overflow-hidden relative bg-black border-r border-white/20"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to overlay
      style={{ backgroundColor: '#000000' }} // Hardcoded black background
    >
      {/* Subtle background pattern - hardcoded for black theme */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
      </div>

      {/* Simple scroll indicators - hardcoded black */}
      {canScrollUp && (
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black via-black/80 to-transparent z-10 flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
          <div className="w-2 h-2 border-t-2 border-l-2 border-white transform rotate-45 -translate-y-1" />
        </div>
      )}
      {canScrollDown && (
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10 flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
          <div className="w-2 h-2 border-b-2 border-r-2 border-white transform rotate-45 translate-y-1" />
        </div>
      )}

      {/* Scrollable content */}
      <div 
        ref={scrollRef}
        className="h-full overflow-y-auto overflow-x-hidden sidebar-scrollbar pt-6 pb-6 relative z-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) transparent',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        {/* Enhanced Header - hardcoded white text on black */}
        <div className="pt-4 px-4 pb-4 lg:pt-5 lg:px-5 lg:pb-5 border-b border-white/20 relative">
          {/* Brand Identity with enhanced styling */}
          <div className="flex items-center gap-3 mb-4 lg:gap-3 lg:mb-4">
            <div className="relative">
              <div className="bg-white p-2 lg:p-2 rounded-xl lg:rounded-xl shadow-2xl border border-white/20" style={{ backgroundColor: '#ffffff' }}>
                <Wallet className="h-5 w-5 lg:h-5 lg:w-5 text-black" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white/20 rounded-xl lg:rounded-2xl blur-xl -z-10" />
            </div>
            <div>
              <h1 className="text-xl lg:text-xl font-black tracking-tight" style={{ color: '#ffffff' }}>
                HoardRun
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] lg:text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('dashboard.sidebar.premiumBanking')}</p>
              </div>
            </div>
          </div>

          {/* Enhanced User Profile - hardcoded white text */}
          <div className="flex items-center gap-3 p-3 lg:gap-3 lg:p-3 rounded-xl lg:rounded-xl border border-white/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-200" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="relative">
              <div className="w-10 h-10 lg:w-10 lg:h-10 rounded-xl lg:rounded-xl flex items-center justify-center shadow-xl border border-white/30" style={{ backgroundColor: '#ffffff' }}>
                <User className="h-5 w-5 lg:h-5 lg:w-5 text-black" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
                <Circle className="w-1.5 h-1.5 text-black fill-current" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[11px] lg:text-xs truncate" style={{ color: '#ffffff' }}>
                {user?.name || 'Guest'}
              </p>
              <p className="text-[9px] lg:text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {user?.email || 'Please sign in'}
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="mt-3">
            <LanguageSwitcher variant="desktop" />
          </div>
        </div>

        {/* Enhanced Quick Action - hardcoded white button */}
        <div className="px-4 py-3 lg:px-5 lg:py-4 border-b border-white/20">
          <Button
            onClick={onAddMoney}
            className="w-full font-bold py-3 lg:py-3 text-xs lg:text-xs rounded-xl lg:rounded-xl shadow-2xl transition-all duration-200 hover:scale-105 hover:shadow-3xl border border-white/20 group relative overflow-hidden"
            style={{ backgroundColor: '#ffffff', color: '#000000' }}
          >
            <Plus className="h-4 w-4 lg:h-4 lg:w-4 mr-2 relative z-10" />
            <span className="relative z-10">{t('dashboard.sidebar.addMoney')}</span>
          </Button>
        </div>

        {/* Enhanced Navigation Menu */}
        <div className="px-4 py-3 lg:px-5 lg:py-4">
          {renderMenuSection('main', menuSections.main)}
          {renderMenuSection('financial', menuSections.financial)}
          {renderMenuSection('account', menuSections.account)}
          {renderMenuSection('support', menuSections.support)}
        </div>

        {/* Enhanced Logout - hardcoded white text */}
        <div className="px-4 py-3 lg:px-5 lg:py-4 border-t border-white/20">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start rounded-xl lg:rounded-xl p-3 lg:p-3 text-xs lg:text-xs transition-all duration-200 group border border-transparent hover:border-white/20"
            style={{
              color: 'rgba(255,255,255,0.6)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = 'linear-gradient(to right, rgba(239,68,68,0.2), rgba(236,72,153,0.2))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut className="h-4 w-4 lg:h-4 lg:w-4 mr-3 transition-colors duration-200" style={{ color: 'inherit' }} />
            {t('dashboard.sidebar.signOut')}
          </Button>
        </div>
      </div>
    </div>
  )
}
