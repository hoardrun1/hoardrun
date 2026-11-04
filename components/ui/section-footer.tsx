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

/** Pages still render this, but the shared tab bar and its More menu now cover it. */
export function SectionFooter(_props: SectionFooterProps) {
  return null
}
