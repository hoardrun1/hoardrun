'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

export function AnimatedGradientBackground({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <motion.div
        className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' 
            : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
        }`}
        animate={{
          background: theme === 'dark' 
            ? [
                'linear-gradient(to bottom right, rgb(17,24,39), rgb(30,58,138), rgb(17,24,39))',
                'linear-gradient(to bottom right, rgb(30,58,138), rgb(17,24,39), rgb(30,58,138))'
              ]
            : [
                'linear-gradient(to bottom right, rgb(239,246,255), rgb(255,255,255), rgb(239,246,255))',
                'linear-gradient(to bottom right, rgb(255,255,255), rgb(239,246,255), rgb(255,255,255))'
              ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
} 