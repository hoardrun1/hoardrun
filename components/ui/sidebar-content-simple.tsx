'use client'

import { useEffect, useRef, useState } from 'react'
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
  Layout
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from './sidebar-layout'
import { useNotificationCount } from '@/hooks/useNotificationCount'
import { useAppNavigation } from '@/hooks/useAppNavigation'

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
  premium?: boolean
}

const menuSections = {
  main: [
    { id: 'home', label: 'Home', icon: Layout, href: '/home', description: 'Main dashboard' },
    { id: 'overview', label: 'Overview', icon: BarChart3, href: '/overview', description: 'Financial overview' },
    { id: 'budget', label: 'Budget', icon: Calculator, href: '/budget', description: 'Track spending' },
    { id: 'savings', label: 'Savings', icon: PiggyBank, href: '/savings', description: 'Goals & plans' },
    { id: 'investment', label: 'Investment', icon: TrendingUp, href: '/investment', description: 'Grow wealth', premium: true },
  ],
  financial: [
    { id: 'cards', label: 'Cards', icon: CreditCard, href: '/cards', description: 'Manage cards' },
    { id: 'send', label: 'Send Money', icon: ArrowUpRight, href: '/send', description: 'Transfer funds' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, href: '/transactions', description: 'History' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics', description: 'Insights', premium: true },
  ],
  account: [
    { id: 'profile', label: 'Profile', icon: User, href: '/profile', description: 'Personal info' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings', description: 'Preferences' },
    { id: 'security', label: 'Security', icon: Shield, href: '/security', description: 'Account safety' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/notifications', badge: '3' },
  ],
  support: [
    { id: 'help', label: 'Help Center', icon: HelpCircle, href: '/help', description: 'Get support' },
    { id: 'contact', label: 'Contact', icon: Phone, href: '/contact', description: 'Reach us' },
  ]
}

export function SidebarContent({ onAddMoney }: SidebarContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { setIsOpen } = useSidebar()
  const { unreadCount } = useNotificationCount()
  const { navigate } = useAppNavigation()

  const isActiveRoute = (href: string) => {
    if (href === '/home') return pathname === '/home' || pathname === '/'
    if (href === '/overview') return pathname === '/overview'
    return pathname?.startsWith(href) || false
  }

  const handleNavigation = (href: string) => {
    // Use enhanced navigation for faster navigation
    navigate(href, { prefetch: true, immediate: true })
    // Close sidebar on mobile after navigation
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsOpen(false)
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

  const renderMenuSection = (title: string, items: MenuItem[]) => {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3 px-2">
          <div className="w-1 h-4 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }} />
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {title}
          </h3>
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </div>
        <div className="space-y-1">
          {items.map((item) => {
            // Use real notification count for notifications item
            const displayBadge = item.id === 'notifications' 
              ? (unreadCount > 0 ? unreadCount.toString() : undefined)
              : item.badge
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className="w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group shadow-lg border border-white/30"
                style={{
                  backgroundColor: isActiveRoute(item.href) 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'transparent',
                  color: isActiveRoute(item.href) ? '#ffffff' : 'rgba(255,255,255,0.7)'
                }}
                onMouseEnter={(e) => {
                  if (!isActiveRoute(item.href)) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
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
                {/* Active indicator */}
                {isActiveRoute(item.href) && (
                  <div className="absolute left-0 top-0 w-1 h-full rounded-r-full" style={{ backgroundColor: '#ffffff' }} />
                )}
                
                {/* Icon container */}
                <div 
                  className="relative p-2 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: isActiveRoute(item.href) 
                      ? 'rgba(255,255,255,0.2)' 
                      : 'rgba(255,255,255,0.1)'
                  }}
                >
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs" style={{ color: 'inherit' }}>
                      {item.label}
                    </span>
                    {displayBadge && (
                      <Badge 
                        className="ml-2 text-xs font-bold px-1.5 py-0.5 border border-white/20"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: '#ffffff'
                        }}
                      >
                        {displayBadge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs mt-0.5 hidden lg:block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {item.description}
                    </p>
                  )}
                </div>
                
                {/* Arrow */}
                <ChevronRight className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-hidden bg-black border-r border-white/20" style={{ backgroundColor: '#000000' }}>
      {/* Scrollable content */}
      <div className="h-full overflow-y-auto pt-6 pb-6">
        {/* Header - hardcoded white text on black */}
        <div className="pt-4 px-4 pb-4 border-b border-white/20">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl shadow-lg" style={{ backgroundColor: '#ffffff' }}>
              <Wallet className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color: '#ffffff' }}>HoardRun</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Premium Banking</p>
            </div>
          </div>

          {/* User Profile - hardcoded white text */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-white/20" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
              <User className="h-5 w-5 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs truncate" style={{ color: '#ffffff' }}>
                {user?.name || 'Guest'}
              </p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {user?.email || 'Please sign in'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action - hardcoded white button */}
        <div className="px-4 py-3 border-b border-white/20">
          <Button
            onClick={onAddMoney}
            className="w-full font-bold py-3 text-xs rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            style={{ backgroundColor: '#ffffff', color: '#000000' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Money
          </Button>
        </div>

        {/* Navigation Menu */}
        <div className="px-4 py-3">
          {renderMenuSection('Main', menuSections.main)}
          {renderMenuSection('Financial', menuSections.financial)}
          {renderMenuSection('Account', menuSections.account)}
          {renderMenuSection('Support', menuSections.support)}
        </div>

        {/* Logout - hardcoded white text */}
        <div className="px-4 py-3 border-t border-white/20">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start rounded-xl p-3 text-xs transition-all duration-200"
            style={{ 
              color: 'rgba(255,255,255,0.6)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut className="h-4 w-4 mr-3" style={{ color: 'inherit' }} />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
