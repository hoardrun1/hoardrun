'use client'

import { useCallback, useRef, useEffect } from 'react'

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

interface NavigationCache {
  get: (key: string) => any | null
  set: (key: string, data: any, ttl?: number) => void
  prefetch: (routes: string[]) => void
  clear: () => void
  has: (key: string) => boolean
}

class NavigationCacheManager {
  private cache = new Map<string, CacheEntry>()
  private prefetchQueue = new Set<string>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_CACHE_SIZE = 50

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  prefetch(routes: string[]): void {
    routes.forEach(route => {
      if (!this.has(route) && !this.prefetchQueue.has(route)) {
        this.prefetchQueue.add(route)
        this.prefetchRoute(route)
      }
    })
  }

  private async prefetchRoute(route: string): Promise<void> {
    try {
      // Prefetch the route by creating a link element
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = route
      document.head.appendChild(link)

      // Remove after a short delay
      setTimeout(() => {
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
        this.prefetchQueue.delete(route)
      }, 1000)

      // Mark as prefetched in cache
      this.set(`prefetch:${route}`, true, 10 * 60 * 1000) // 10 minutes
    } catch (error) {
      console.warn(`Failed to prefetch route: ${route}`, error)
      this.prefetchQueue.delete(route)
    }
  }

  clear(): void {
    this.cache.clear()
    this.prefetchQueue.clear()
  }

  // Get cache statistics for debugging
  getStats() {
    return {
      size: this.cache.size,
      prefetchQueue: this.prefetchQueue.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Global cache instance
const cacheManager = new NavigationCacheManager()

// Hook for using navigation cache
export function useNavigationCache(): NavigationCache {
  const prefetchTimeoutRef = useRef<NodeJS.Timeout>()

  const prefetch = useCallback((routes: string[]) => {
    // Debounce prefetch requests
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current)
    }

    prefetchTimeoutRef.current = setTimeout(() => {
      cacheManager.prefetch(routes)
    }, 100)
  }, [])

  useEffect(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current)
      }
    }
  }, [])

  return {
    get: cacheManager.get.bind(cacheManager),
    set: cacheManager.set.bind(cacheManager),
    prefetch,
    clear: cacheManager.clear.bind(cacheManager),
    has: cacheManager.has.bind(cacheManager)
  }
}

// Common routes for prefetching
export const COMMON_ROUTES = [
  '/home',
  '/overview',
  '/savings',
  '/send',
  '/cards',
  '/transactions',
  '/analytics',
  '/profile',
  '/settings'
]

// Route groups for intelligent prefetching
export const ROUTE_GROUPS = {
  financial: ['/home', '/overview', '/savings', '/investment', '/analytics'],
  transactions: ['/send', '/transactions', '/cards'],
  account: ['/profile', '/settings', '/security', '/notifications']
}

export default cacheManager
