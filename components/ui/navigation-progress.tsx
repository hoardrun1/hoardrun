'use client'

import { motion } from 'framer-motion'
import { useAppNavigation } from '@/hooks/useAppNavigation'
import { useEffect, useState } from 'react'

export const NavigationProgress = () => {
  const { isTransitioning } = useAppNavigation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isTransitioning) {
      setVisible(true)
      setProgress(90) // Set to 90% immediately for faster perceived performance
    } else {
      setProgress(100)
      // Hide immediately for faster navigation
      setVisible(false)
      setProgress(0)
    }
  }, [isTransitioning])

  if (!visible) return null

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="h-full bg-gray-600"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20
        }}
      />
    </motion.div>
  )
} 