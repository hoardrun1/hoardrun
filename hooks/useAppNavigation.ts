import { useCallback } from 'react'
import { useNavigationStore, navigationService } from '@/services/navigation'
import { useRouter, usePathname } from 'next/navigation'
import { navigationPerformance } from '@/lib/navigation-performance'

export const useAppNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const currentPage = useNavigationStore((state) => state.currentPage)
  const previousPage = useNavigationStore((state) => state.previousPage)
  const navigationStack = useNavigationStore((state) => state.navigationStack)

  const navigate = useCallback(async (to: string, options?: { replace?: boolean }) => {
    navigationPerformance.startNavigation(pathname || '/', to)
    if (options?.replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
    setTimeout(() => {
      navigationPerformance.endNavigation()
    }, 100)
  }, [router, pathname])

  const goBack = useCallback(async () => {
    router.back()
  }, [router])

  const reset = useCallback(() => {
    navigationService.reset()
    router.push('/')
  }, [router])

  return {
    currentPage,
    previousPage,
    navigationStack,
    navigate,
    goBack,
    reset,
  }
}
