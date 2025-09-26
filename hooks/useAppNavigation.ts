import { useCallback, useEffect, useRef, useState, startTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface NavigationOptions {
  replace?: boolean
  prefetch?: boolean
  immediate?: boolean
}

// Common routes for prefetching
const COMMON_ROUTES = [
  '/home',
  '/overview', 
  '/savings',
  '/send',
  '/cards',
  '/transactions',
  '/analytics',
  '/profile'
]

// Route groups for intelligent prefetching
const ROUTE_GROUPS = {
  financial: ['/home', '/overview', '/savings', '/investment', '/analytics'],
  transactions: ['/send', '/transactions', '/cards'],
  account: ['/profile', '/settings', '/security', '/notifications']
}

export const useAppNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const navigationTimeoutRef = useRef<NodeJS.Timeout>()
  const prefetchedRoutes = useRef(new Set<string>())

  // Prefetch using Next.js built-in prefetching
  const prefetchRoute = useCallback((route: string) => {
    if (!prefetchedRoutes.current.has(route)) {
      router.prefetch(route)
      prefetchedRoutes.current.add(route)
    }
  }, [router])

  // Prefetch common routes on mount
  useEffect(() => {
    const prefetchTimeout = setTimeout(() => {
      COMMON_ROUTES.forEach(route => prefetchRoute(route))
    }, 100) // Reduced delay

    return () => clearTimeout(prefetchTimeout)
  }, [prefetchRoute])

  // Intelligent prefetching based on current route
  useEffect(() => {
    const currentGroup = Object.entries(ROUTE_GROUPS).find(([_, routes]) =>
      routes.some(route => pathname?.startsWith(route))
    )

    if (currentGroup) {
      const [, routes] = currentGroup
      const otherRoutes = routes.filter(route => !pathname?.startsWith(route))
      
      otherRoutes.forEach(route => prefetchRoute(route))
    }
  }, [pathname, prefetchRoute])

  const navigate = useCallback((to: string, options: NavigationOptions = {}) => {
    const { replace = false, prefetch = true, immediate = true } = options // Changed immediate to true by default

    // Clear any pending navigation
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current)
    }

    // Prefetch the target route if not already prefetched
    if (prefetch) {
      prefetchRoute(to)
    }

    const performNavigation = () => {
      setIsNavigating(true)
      
      startTransition(() => {
        if (replace) {
          router.replace(to)
        } else {
          router.push(to)
        }
      })

      // Reset loading state after a short delay
      setTimeout(() => setIsNavigating(false), 300)
    }

    if (immediate) {
      performNavigation()
    } else {
      // Minimal delay for non-immediate navigation
      navigationTimeoutRef.current = setTimeout(performNavigation, 10)
    }
  }, [router, prefetchRoute])

  const goBack = useCallback(() => {
    setIsNavigating(true)
    startTransition(() => {
      router.back()
    })
    setTimeout(() => setIsNavigating(false), 300)
  }, [router])

  const goForward = useCallback(() => {
    setIsNavigating(true)
    startTransition(() => {
      router.forward()
    })
    setTimeout(() => setIsNavigating(false), 300)
  }, [router])

  const reset = useCallback(() => {
    setIsNavigating(true)
    startTransition(() => {
      router.push('/')
    })
    setTimeout(() => setIsNavigating(false), 300)
  }, [router])

  const prefetchRouteGroup = useCallback((groupName: keyof typeof ROUTE_GROUPS) => {
    const routes = ROUTE_GROUPS[groupName]
    if (routes) {
      routes.forEach(route => prefetchRoute(route))
    }
  }, [prefetchRoute])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
    }
  }, [])

  return {
    navigate,
    goBack,
    goForward,
    reset,
    prefetchRoute,
    prefetchRouteGroup,
    currentPath: pathname,
    isNavigating
  }
}

// Hook for navigation with loading states (kept for backward compatibility)
export const useAppNavigationWithLoading = () => {
  const navigation = useAppNavigation()
  
  return {
    ...navigation,
    navigateWithLoading: navigation.navigate // Alias for backward compatibility
  }
}

export default useAppNavigation
