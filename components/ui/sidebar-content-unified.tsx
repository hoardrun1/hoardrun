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
  Circle,
  Sparkles,
  ShieldCheck,
  type LucideIcon
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from './sidebar-layout'
import { useNotificationCount } from '@/hooks/useNotificationCount'
import { useAppNavigation } from '@/hooks/useAppNavigation'
import { LanguageSwitcher } from './language-switcher'
import { apiClient } from '@/lib/api-client'

interface SidebarContentProps {
  onAddMoney?: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: LucideIcon
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
  const { user } = useAuth()
  const { setIsOpen } = useSidebar()
  const { unreadCount } = useNotificationCount()
  const { navigate } = useAppNavigation()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)
  // Hoardrun admins get a link to the admin area; the server decides who they are
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    apiClient.getAdminStatus().then((response) => {
      if (!cancelled) setIsAdmin(!!response.data?.is_admin)
    })
    return () => { cancelled = true }
  }, [user])

  const menuSections = {
    main: [
      { id: 'home', label: t('dashboard.sidebar.home'), icon: Layout, href: '/home', description: t('dashboard.sidebar.home'), color: 'from-white to-gray-100' },
      { id: 'overview', label: t('dashboard.sidebar.overview'), icon: BarChart3, href: '/overview', description: t('dashboard.sidebar.overview'), color: 'from-white to-gray-100' },
      { id: 'budget', label: t('dashboard.sidebar.budget'), icon: Calculator, href: '/budget', description: t('dashboard.sidebar.budget'), color: 'from-white to-gray-100' },
      { id: 'savings', label: t('dashboard.sidebar.savings'), icon: PiggyBank, href: '/savings', description: t('dashboard.sidebar.savings'), color: 'from-white to-gray-100' },
      { id: 'investment', label: t('dashboard.sidebar.investment'), icon: TrendingUp, href: '/investment', description: t('dashboard.sidebar.investment'), color: 'from-white to-gray-100', premium: true },
      { id: 'assistant', label: 'Hoardrun AI', icon: Sparkles, href: '/assistant', description: 'Ask about your money', color: 'from-white to-gray-100' },
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
      { id: 'notifications', label: t('dashboard.sidebar.notifications'), icon: Bell, href: '/notifications', color: 'from-white to-gray-100' },
    ],
    support: [
      { id: 'help', label: t('dashboard.sidebar.help'), icon: HelpCircle, href: '/help', description: t('dashboard.sidebar.help'), color: 'from-white to-gray-100' },
      { id: 'contact', label: t('dashboard.sidebar.contact'), icon: Phone, href: '/contact', description: t('dashboard.sidebar.contact'), color: 'from-white to-gray-100' },
      ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck, href: '/admin-panel', description: 'Run Hoardrun', color: 'from-white to-gray-100' }] : []),
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

  const handleLogout = () => {
    // The sign-out page ends the session. Doing it here would trigger the
    // dashboard's redirect to sign-in before this navigation happens.
    setIsOpen(false)
    router.push('/signout')
  }

  const renderMenuSection = (titleKey: string, items: MenuItem[]) => {
    return (
      <div key={titleKey}>
        <h3 className="hr-side-title">{t(`dashboard.sidebar.${titleKey}`)}</h3>
        <div className="space-y-0.5">
          {items.map((item) => {
            const active = isActiveRoute(item.href)
            const count = item.id === 'notifications' && unreadCount > 0 ? unreadCount : undefined
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                data-href={item.href}
                aria-current={active ? 'page' : undefined}
                className="hr-side-item hr-focus"
              >
                <item.icon className="h-[18px] w-[18px] flex-none" strokeWidth={active ? 2 : 1.7} />
                <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                {count !== undefined && (
                  <span className="flex h-5 min-w-5 flex-none items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-medium text-black">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const initials = (user?.name || user?.email || '?')
    .split(' ')
    .map((part: string) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div ref={sidebarRef} className="h-full w-full" onClick={(e) => e.stopPropagation()}>
      <div ref={scrollRef} className="hr-side flex flex-col px-3" style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <button
          onClick={() => {
            onAddMoney?.()
            setIsOpen(window.innerWidth >= 1024)
          }}
          className="hr-focus flex h-11 w-full flex-none items-center justify-center gap-2 rounded-full bg-white text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          {t('dashboard.sidebar.addMoney')}
        </button>

        <nav className="mt-1 flex-1">
          {renderMenuSection('main', menuSections.main)}
          {renderMenuSection('financial', menuSections.financial)}
          {renderMenuSection('account', menuSections.account)}
          {renderMenuSection('support', menuSections.support)}
        </nav>

        <div className="mt-5 flex-none space-y-1 border-t border-white/10 pt-3">
          <LanguageSwitcher variant="desktop" />
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white text-[13px] font-semibold text-black">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{user?.name || 'Guest'}</span>
              <span className="block truncate text-xs text-[#8e8e93]">{user?.email}</span>
            </span>
          </div>
          <button onClick={handleLogout} className="hr-side-item hr-focus">
            <LogOut className="h-[18px] w-[18px] flex-none" strokeWidth={1.7} />
            {t('dashboard.sidebar.signOut')}
          </button>
        </div>
      </div>
    </div>
  )
}
