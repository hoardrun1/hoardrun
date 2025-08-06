'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface FrostedGlassCardProps {
  children: React.ReactNode
  className?: string
}

const FrostedGlassCard = ({ children, className }: FrostedGlassCardProps) => {
  const { theme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'backdrop-blur-sm rounded-2xl shadow-lg',
        theme === 'dark'
          ? 'bg-black/90 border border-white/10'
          : 'bg-white/90 border border-black/5',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export { FrostedGlassCard }
