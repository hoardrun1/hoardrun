'use client'

import { motion } from 'framer-motion'
import { useAppNavigation } from '@/hooks/useAppNavigation'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export const NavigationProgress = () => {
  const { currentPage } = useAppNavigation()
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show progress when navigation starts
    if (currentPage !== pathname) {
      setVisible(true)
      setProgress(90)
      
      // Hide progress after a short delay
      const timer = setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          setVisible(false)
          setProgress(0)
        }, 200)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [currentPage, pathname])

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
