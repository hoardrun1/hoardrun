'use client'

import { useEffect, useState } from 'react'
import { useAppNavigation } from '@/hooks/useAppNavigation'

export function NavigationLoader() {
  const { isNavigating } = useAppNavigation()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isNavigating) {
      setProgress(0)
      
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 50)

      return () => clearInterval(progressInterval)
    } else {
      // Complete progress when navigation finishes
      setProgress(100)
      const resetTimer = setTimeout(() => setProgress(0), 200)
      return () => clearTimeout(resetTimer)
    }
  }, [isNavigating])

  if (!isNavigating && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Simple progress bar */}
      <div
        className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
      
      {/* Minimal loading indicator for slow connections */}
      {isNavigating && progress < 30 && (
        <div className="fixed top-4 right-4 bg-card border border-border rounded-lg p-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default NavigationLoader
