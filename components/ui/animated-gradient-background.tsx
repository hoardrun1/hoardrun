'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

export default function AnimatedGradientBackground({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <motion.div
        className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-black' 
            : 'bg-white'
        }`}
        animate={{
          background: theme === 'dark' 
            ? ['#000000', '#0A0A0A', '#000000']
            : ['#FFFFFF', '#F8F8F8', '#FFFFFF']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
} 
