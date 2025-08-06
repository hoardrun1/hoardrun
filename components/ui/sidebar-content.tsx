'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
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
  Calculator
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { navigation } from '@/lib/navigation'
import { useSidebar } from './sidebar-layout'

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
}

const menuSections = {
  main: [
    { id: 'overview', label: 'Overview', icon: Home, href: '/overview', description: 'Dashboard home' },
    { id: 'budget', label: 'Budget', icon: Calculator, href: '/budget', description: 'Track spending' },
    { id: 'savings', label: 'Savings', icon: PiggyBank, href: '/savings', description: 'Goals & plans' },
    { id: 'investment', label: 'Investment', icon: TrendingUp, href: '/investment', description: 'Grow wealth' },
  ],
  financial: [
    { id: 'cards', label: 'Cards', icon: CreditCard, href: '/cards', description: 'Manage cards' },
    { id: 'send', label: 'Send Money', icon: ArrowUpRight, href: '/send', description: 'Transfer funds' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, href: '/transactions', description: 'History' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics', description: 'Insights' },
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
  const { user } = useAuth()
  const { setIsOpen } = useSidebar()
  const sidebarRef = useRef<HTMLDivElement>(null)

  const isActiveRoute = (href: string) => {
    if (href === '/overview') return pathname === '/overview' || pathname === '/'
    return pathname.startsWith(href)
  }

  const handleNavigation = (href: string) => {
    navigation.connect(pathname.split('/')[1] || 'overview', href.split('/')[1])
    router.push(href)
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logout clicked')
    setIsOpen(false)
  }

  const renderMenuSection = (title: string, items: MenuItem[]) => (
    <div className="mb-8">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handleNavigation(item.href)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
              isActiveRoute(item.href)
                ? 'bg-white text-black shadow-lg'
                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Active indicator */}
            {isActiveRoute(item.href) && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-0 w-1 h-full bg-black"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              isActiveRoute(item.href) 
                ? 'bg-black shadow-lg' 
                : 'bg-gray-800/50 group-hover:bg-gray-700/70'
            }`}>
              <item.icon className={`h-5 w-5 transition-colors duration-300 ${
                isActiveRoute(item.href) ? 'text-white' : 'text-gray-300 group-hover:text-white'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-sm transition-colors duration-300 ${
                  isActiveRoute(item.href) ? 'text-black' : 'group-hover:text-white'
                }`}>
                  {item.label}
                </span>
                {item.badge && (
                  <Badge 
                    className={`ml-2 text-[10px] font-bold px-2 py-0.5 transition-colors duration-300 ${
                      isActiveRoute(item.href)
                        ? 'bg-black text-white'
                        : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600 group-hover:text-white'
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className={`text-xs mt-1 transition-colors duration-300 ${
                  isActiveRoute(item.href) 
                    ? 'text-gray-600' 
                    : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  {item.description}
                </p>
              )}
            </div>
            
            <motion.div
              animate={{ 
                x: isActiveRoute(item.href) ? 0 : -4,
                opacity: isActiveRoute(item.href) ? 1 : 0.5
              }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className={`h-4 w-4 transition-colors duration-300 ${
                isActiveRoute(item.href) ? 'text-black' : 'text-gray-500 group-hover:text-gray-300'
              }`} />
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  )

  return (
    <div
      ref={sidebarRef}
      className="h-full w-full bg-black border-r border-gray-800/50 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0f0f0f 100%)'
      }}
    >
      {/* Glass overlay for premium effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Scrollable content */}
      <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {/* Header */}
        <div className="pt-8 px-6 pb-8 border-b border-gray-800/30 relative">
          {/* Brand Identity */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="bg-white p-3 rounded-2xl shadow-2xl shadow-white/10">
                <Wallet className="h-7 w-7 text-black" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl -z-10 blur-lg"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">HoardRun</h1>
              <p className="text-sm text-gray-400 font-medium">Premium Banking</p>
            </div>
          </div>

          {/* User Profile */}
          <motion.div 
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-white/[0.08] to-white/[0.04] rounded-2xl border border-white/10 backdrop-blur-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 rounded-2xl flex items-center justify-center shadow-xl">
                <User className="h-6 w-6 text-gray-700" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">
                {user?.name || 'Demo User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Quick Action */}
        <div className="px-6 py-6 border-b border-gray-800/30">
          <Button
            onClick={onAddMoney}
            className="w-full bg-gradient-to-r from-white to-gray-100 text-black font-bold py-4 rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Money
          </Button>
        </div>

        {/* Navigation Menu */}
        <div className="px-6 py-6">
          {renderMenuSection('Main', menuSections.main)}
          {renderMenuSection('Financial', menuSections.financial)}
          {renderMenuSection('Account', menuSections.account)}
          {renderMenuSection('Support', menuSections.support)}
        </div>

        {/* Logout */}
        <div className="px-6 py-6 border-t border-gray-800/30">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl p-3"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
