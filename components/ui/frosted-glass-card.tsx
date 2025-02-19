'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface FrostedGlassCardProps {
  children: React.ReactNode
  className?: string
}

export function FrostedGlassCard({ children, className }: FrostedGlassCardProps) {
  const { theme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'backdrop-blur-lg rounded-2xl shadow-xl',
        theme === 'dark'
          ? 'bg-gray-900/40 border border-gray-800'
          : 'bg-white/70 border border-gray-200',
        className
      )}
    >
      {children}
    </motion.div>
  )
} 