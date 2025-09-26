'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { FinanceProvider } from '@/contexts/FinanceContext'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { NotificationProvider } from '@/contexts/NotificationContext'


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
  '/send-money',
  '/receive-money',
  '/transfer',
  '/finance',
  '/cards',
  '/overview',
  '/market',
  '/create-profile',
  '/face-verification',
  '/api-test'
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

// Check if a route is a dashboard route (only routes that start with /dashboard)
const isDashboardRoute = (pathname: string): boolean => {
  return pathname.startsWith('/dashboard')
}

export function ConditionalProviders({ children }: ConditionalProvidersProps) {
  const pathname = usePathname()
  
  // Handle null pathname case
  if (!pathname) {
    return <>{children}</>
  }
  
  // For public routes, only provide minimal contexts
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>
  }
  
  // For dashboard routes, don't provide contexts here since dashboard layout handles them
  if (isDashboardRoute(pathname)) {
    return <>{children}</>
  }
  
  // Check if current route needs heavy contexts
  const needsHeavyContexts = AUTHENTICATED_ROUTES.some(route => 
    pathname.startsWith(route) || pathname === route
  )
  
  // For authenticated routes that need contexts, provide all contexts
  if (needsHeavyContexts) {
    return (
      <FinanceProvider>
        <NavigationProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </NavigationProvider>
      </FinanceProvider>
    )
  }
  
  // For all other routes, provide minimal contexts
  return <>{children}</>
}
