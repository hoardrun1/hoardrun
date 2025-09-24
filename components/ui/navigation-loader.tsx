'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface NavigationLoaderProps {
  showProgress?: boolean
  className?: string
}

export function NavigationLoader({ showProgress = true, className = '' }: NavigationLoaderProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    let progressInterval: NodeJS.Timeout
    let timeoutId: NodeJS.Timeout

    const handleStart = () => {
      setIsNavigating(true)
      setProgress(0)

      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 100)

      // Auto-complete after 3 seconds if still loading
      timeoutId = setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          setIsNavigating(false)
          setProgress(0)
        }, 200)
      }, 3000)
    }

    const handleComplete = () => {
      setProgress(100)
      setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 200)

      if (progressInterval) clearInterval(progressInterval)
      if (timeoutId) clearTimeout(timeoutId)
    }

    // Listen for route changes
    const originalPush = window.history.pushState
    const originalReplace = window.history.replaceState

    window.history.pushState = function(...args) {
      handleStart()
      return originalPush.apply(this, args)
    }

    window.history.replaceState = function(...args) {
      handleStart()
      return originalReplace.apply(this, args)
    }

    // Listen for popstate (back/forward)
    const handlePopState = () => {
      handleStart()
    }

    window.addEventListener('popstate', handlePopState)

    // Complete loading when pathname changes
    handleComplete()

    return () => {
      if (progressInterval) clearInterval(progressInterval)
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener('popstate', handlePopState)
      window.history.pushState = originalPush
      window.history.replaceState = originalReplace
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {isNavigating && (
        <>
          {/* Progress Bar */}
          {showProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed top-0 left-0 right-0 z-[9999] ${className}`}
            >
              <div className="h-1 bg-gradient-to-r from-primary/20 to-primary/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 shadow-lg"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}

          {/* Loading Overlay for slower connections */}
          {progress < 30 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-card border border-border rounded-lg p-6 shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-medium text-foreground">Loading...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}

// Hook for programmatic navigation loading control
export function useNavigationLoader() {
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)

  return {
    isLoading,
    startLoading,
    stopLoading
  }
}

// Higher-order component to wrap pages with navigation loading
export function withNavigationLoader<P extends object>(
  Component: React.ComponentType<P>,
  options?: { showProgress?: boolean }
) {
  return function NavigationLoaderWrapper(props: P) {
    return (
      <>
        <NavigationLoader showProgress={options?.showProgress} />
        <Component {...props} />
      </>
    )
  }
}

export default NavigationLoader
