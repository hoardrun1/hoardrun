import { useCallback, useEffect, useRef, useState, startTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useNavigationCache, COMMON_ROUTES, ROUTE_GROUPS } from '@/lib/navigation-cache'

interface NavigationOptions {
  replace?: boolean
  prefetch?: boolean
  immediate?: boolean
}

export const useAppNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const cache = useNavigationCache()
  const navigationTimeoutRef = useRef<NodeJS.Timeout>()

  // Prefetch common routes on mount
  useEffect(() => {
    // Prefetch common routes after a short delay
    const prefetchTimeout = setTimeout(() => {
      cache.prefetch(COMMON_ROUTES)
    }, 1000)

    return () => clearTimeout(prefetchTimeout)
  }, [cache])

  // Intelligent prefetching based on current route
  useEffect(() => {
    const currentGroup = Object.entries(ROUTE_GROUPS).find(([_, routes]) =>
      routes.some(route => pathname?.startsWith(route))
    )

    if (currentGroup) {
      // Prefetch related routes in the same group
      const [groupName, routes] = currentGroup
      const otherRoutes = routes.filter(route => !pathname?.startsWith(route))
      
      if (otherRoutes.length > 0) {
        cache.prefetch(otherRoutes)
      }
    }
  }, [pathname, cache])

  const navigate = useCallback(async (to: string, options: NavigationOptions = {}) => {
    const { replace = false, prefetch = true, immediate = false } = options

    // Clear any pending navigation
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current)
    }

    // Prefetch the target route if not already cached
    if (prefetch && !cache.has(`prefetch:${to}`)) {
      cache.prefetch([to])
    }

    const performNavigation = () => {
      startTransition(() => {
        if (replace) {
          router.replace(to)
        } else {
          router.push(to)
        }
      })
    }

    if (immediate) {
      performNavigation()
    } else {
      // Small delay to allow prefetching to complete
      navigationTimeoutRef.current = setTimeout(performNavigation, 50)
    }
  }, [router, cache])

  const goBack = useCallback(async () => {
    startTransition(() => {
      router.back()
    })
  }, [router])

  const goForward = useCallback(async () => {
    startTransition(() => {
      router.forward()
    })
  }, [router])

  const reset = useCallback(() => {
    startTransition(() => {
      router.push('/')
    })
  }, [router])

  const prefetchRoute = useCallback((route: string) => {
    cache.prefetch([route])
  }, [cache])

  const prefetchRouteGroup = useCallback((groupName: keyof typeof ROUTE_GROUPS) => {
    const routes = ROUTE_GROUPS[groupName]
    if (routes) {
      cache.prefetch(routes)
    }
  }, [cache])

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
    cache: {
      clear: cache.clear,
      has: cache.has,
      get: cache.get,
      set: cache.set
    }
  }
}

// Hook for navigation with loading states
export const useAppNavigationWithLoading = () => {
  const navigation = useAppNavigation()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigateWithLoading = useCallback(async (to: string, options?: NavigationOptions) => {
    setIsNavigating(true)
    try {
      await navigation.navigate(to, options)
    } finally {
      // Reset loading state after navigation completes
      setTimeout(() => setIsNavigating(false), 100)
    }
  }, [navigation])

  return {
    ...navigation,
    navigate: navigateWithLoading,
    isNavigating
  }
}

export default useAppNavigation
