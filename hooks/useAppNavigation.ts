import { useCallback } from 'react'
import { useNavigationStore, navigationService } from '@/services/navigation'
import { useRouter } from 'next/navigation'

export const useAppNavigation = () => {
  const router = useRouter()
  const currentPage = useNavigationStore((state) => state.currentPage)
  const previousPage = useNavigationStore((state) => state.previousPage)
  const isTransitioning = useNavigationStore((state) => state.isTransitioning)
  const transitionDirection = useNavigationStore((state) => state.transitionDirection)
  const navigationStack = useNavigationStore((state) => state.navigationStack)

  const navigate = useCallback(async (to: string, options?: { replace?: boolean }) => {
    await navigationService.navigate(to, options)
    router.push(to)
  }, [router])

  const goBack = useCallback(async () => {
    if (navigationStack.length > 1) {
      await navigationService.goBack()
      router.back()
    }
  }, [navigationStack.length, router])

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