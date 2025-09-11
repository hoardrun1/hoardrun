'use client'

import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  BarChart3,
  PiggyBank,
  CreditCard,
  User,
  Plus,
  Wallet,
  TrendingUp,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MobileNavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: string
}

const navigationItems: MobileNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/home',
  },
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    href: '/overview',
  },
  {
    id: 'savings',
    label: 'Savings',
    icon: PiggyBank,
    href: '/savings',
  },
  {
    id: 'cards',
    label: 'Cards',
    icon: CreditCard,
    href: '/cards',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/profile',
  },
]

interface MobileNavigationProps {
  onAddMoney?: () => void
}

export function MobileNavigation({ onAddMoney }: MobileNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isActiveRoute = (href: string) => {
    if (href === '/home') return pathname === '/home' || pathname === '/'
    return pathname?.startsWith(href) || false
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border lg:hidden"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = isActiveRoute(item.href)
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg min-h-[60px] min-w-[60px] relative
                transition-colors duration-200
                ${isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
        
        {/* Add Money FAB */}
        <motion.div
          className="relative"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <Button
            onClick={onAddMoney}
            size="icon"
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
          
          {/* Floating action button glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-bottom" />
    </motion.nav>
  )
}

// Quick action buttons for mobile
export function MobileQuickActions({ onAddMoney }: { onAddMoney?: () => void }) {
  return (
    <div className="fixed bottom-20 right-4 z-40 lg:hidden">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col gap-3"
      >
        {/* Add Money Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onAddMoney}
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
        
        {/* Quick Transfer Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full shadow-lg"
          >
            <TrendingUp className="h-5 w-5" />
          </Button>
        </motion.div>
        
        {/* Wallet Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full shadow-lg"
          >
            <Wallet className="h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default MobileNavigation
