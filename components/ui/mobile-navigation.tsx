'use client'

import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CreditCard, Home, MoreHorizontal, PiggyBank, Plus } from 'lucide-react'
import { useSidebar } from './sidebar-layout'

interface MobileNavigationProps {
  onAddMoney?: () => void
}

/** Floating glass tab bar for phones and tablets. Every other page is under More. */
export function MobileNavigation({ onAddMoney }: MobileNavigationProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const { toggle: toggleSidebar } = useSidebar()

  const leading = [
    { id: 'home', label: t('dashboard.sidebar.home', 'Home'), icon: Home, href: '/home' },
    { id: 'savings', label: t('dashboard.sidebar.savings', 'Savings'), icon: PiggyBank, href: '/savings' },
  ]
  const trailing = [{ id: 'cards', label: t('dashboard.sidebar.cards', 'Cards'), icon: CreditCard, href: '/cards' }]

  const renderTab = (item: (typeof leading)[number]) => {
    const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
    return (
      <button
        key={item.id}
        onClick={() => router.push(item.href)}
        aria-current={active ? 'page' : undefined}
        className="hr-tab hr-focus"
      >
        {active && <motion.span layoutId="hr-tab-lens" className="hr-tab-lens" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
        <item.icon className="relative h-[21px] w-[21px]" strokeWidth={active ? 2.1 : 1.8} />
        <span className="relative">{item.label}</span>
      </button>
    )
  }

  return (
    <nav className="hr-tabbar lg:hidden" aria-label="Main">
      <div className="hr-tabbar-inner">
        {leading.map(renderTab)}
        <button onClick={onAddMoney} aria-label={t('dashboard.home.addMoney')} className="hr-tab-add hr-focus">
          <Plus className="h-6 w-6" strokeWidth={2.4} />
        </button>
        {trailing.map(renderTab)}
        <button onClick={toggleSidebar} aria-label="Open full navigation menu" className="hr-tab hr-focus">
          <MoreHorizontal className="relative h-[21px] w-[21px]" strokeWidth={1.8} />
          <span className="relative">{t('dashboard.sidebar.more', 'More')}</span>
        </button>
      </div>
    </nav>
  )
}

export default MobileNavigation
