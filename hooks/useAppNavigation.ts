import { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export const useAppNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()

  const navigate = useCallback(async (to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
  }, [router])

  const goBack = useCallback(async () => {
    router.back()
  }, [router])

  const reset = useCallback(() => {
    router.push('/')
  }, [router])

  return {
    navigate,
    goBack,
    reset,
  }
}
