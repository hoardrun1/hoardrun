'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { FinanceProvider } from '@/contexts/FinanceContext'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { FloatingNotificationBell } from '@/components/ui/floating-notification-bell'

interface ConditionalProvidersProps {
  children: ReactNode
}

// Routes that need heavy context providers
const AUTHENTICATED_ROUTES = [
  '/dashboard',
  '/home',
  '/savings',
  '/investments',
  '/transactions',
  '/analytics',
  '/profile',
  '/settings',
  '/security',
  '/notifications',
  '/send',
  '/receive-money',
  '/transfer',
  '/finance',
  '/cards',
  '/overview'
]

// Routes that are public and don't need heavy contexts
const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/check-email',
  '/terms',
  '/privacy'
]

// Check if a route is a dashboard route (starts with /dashboard or is in authenticated routes)
const isDashboardRoute = (pathname: string): boolean => {
  return pathname.startsWith('/dashboard') || 
         pathname.includes('dashboard') ||
         AUTHENTICATED_ROUTES.some(route => pathname.startsWith(route) || pathname.includes(route))
}

export function ConditionalProviders({ children }: ConditionalProvidersProps) {
  const pathname = usePathname()
  
  // Handle null pathname case
  if (!pathname) {
    return <>{children}</>
  }
  
  // Check if current route needs heavy contexts
  const needsHeavyContexts = AUTHENTICATED_ROUTES.some(route => 
    pathname.startsWith(route) || pathname.includes('dashboard')
  )
  
  // For public routes, only provide minimal contexts
  if (PUBLIC_ROUTES.includes(pathname) || !needsHeavyContexts) {
    return <>{children}</>
  }
  
  // For dashboard routes, don't provide contexts here since dashboard layout handles them
  if (isDashboardRoute(pathname)) {
    return <>{children}</>
  }
  
  // For other authenticated routes, provide all contexts including FloatingNotificationBell
  return (
    <FinanceProvider>
      <NavigationProvider>
        <NotificationProvider>
          {children}
          <FloatingNotificationBell />
        </NotificationProvider>
      </NavigationProvider>
    </FinanceProvider>
  )
}
