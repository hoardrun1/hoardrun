import { useCallback } from 'react'
import { useNavigationStore, navigationService } from '@/services/navigation'
import { useRouter, usePathname } from 'next/navigation'
import { navigationPerformance } from '@/lib/navigation-performance'

export const useAppNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const currentPage = useNavigationStore((state) => state.currentPage)
  const previousPage = useNavigationStore((state) => state.previousPage)
  const isTransitioning = useNavigationStore((state) => state.isTransitioning)
  const transitionDirection = useNavigationStore((state) => state.transitionDirection)
  const navigationStack = useNavigationStore((state) => state.navigationStack)

  const navigate = useCallback(async (to: string, options?: { replace?: boolean }) => {
    // Start performance monitoring
    navigationPerformance.startNavigation(pathname, to)

    // Skip complex navigation service for faster performance
    if (options?.replace) {
      router.replace(to)
    } else {
      router.push(to)
    }

    // End performance monitoring after a short delay to account for page load
    setTimeout(() => {
      navigationPerformance.endNavigation()
    }, 100)
  }, [router, pathname])

  const goBack = useCallback(async () => {
    // Use simple router.back() for faster performance
    router.back()
  }, [router])

  const reset = useCallback(() => {
    navigationService.reset()
    router.push('/')
  }, [router])

  return {
    currentPage,
    previousPage,
    isTransitioning,
    transitionDirection,
    navigationStack,
    navigate,
    goBack,
    reset,
  }
} 