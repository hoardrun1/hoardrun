'use client'

import Link from 'next/link'
import { 
  Home, 
  BarChart3, 
  Calculator, 
  PiggyBank, 
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  Receipt,
  User,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  Phone
} from 'lucide-react'

interface FooterItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  active?: boolean
}

interface SectionFooterProps {
  section: 'main' | 'financial' | 'account' | 'support'
  activePage: string
}

const sectionItems = {
  main: [
    { icon: Home, label: 'Home', href: '/home' },
    { icon: BarChart3, label: 'Overview', href: '/overview' },
    { icon: Calculator, label: 'Budget', href: '/budget' },
    { icon: PiggyBank, label: 'Savings', href: '/savings' },
    { icon: TrendingUp, label: 'Investment', href: '/investment' }
  ],
  financial: [
    { icon: CreditCard, label: 'Cards', href: '/cards' },
    { icon: ArrowUpRight, label: 'Send', href: '/send' },
    { icon: Receipt, label: 'Transactions', href: '/transactions' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' }
  ],
  account: [
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: Shield, label: 'Security', href: '/security' },
    { icon: Bell, label: 'Notifications', href: '/notifications' }
  ],
  support: [
    { icon: HelpCircle, label: 'Help', href: '/help' },
    { icon: Phone, label: 'Contact', href: '/contact' }
  ]
}

export function SectionFooter({ section, activePage }: SectionFooterProps) {
  const items = sectionItems[section]
  const gridCols = items.length === 2 ? 'grid-cols-2' : items.length === 4 ? 'grid-cols-4' : 'grid-cols-5'

  return (
    <footer className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-2 z-40">
      <div className="container mx-auto px-4">
        <nav className={`grid ${gridCols} gap-1 sm:gap-2`}>
          {items.map((item, index) => {
            const isActive = activePage === item.href || 
              (item.href === '/home' && (activePage === '/home' || activePage === '/'))
            
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </footer>
  )
}
