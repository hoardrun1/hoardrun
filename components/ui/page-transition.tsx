'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppNavigation } from '@/hooks/useAppNavigation'

interface PageTransitionProps {
  children: React.ReactNode
}

const slideVariants = {
  enter: {
    opacity: 0
  },
  center: {
    opacity: 1
  },
  exit: {
    opacity: 0
  }
}

const transitionConfig = {
  duration: 0.15, // Much faster transition
  ease: "easeInOut"
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const { currentPage } = useAppNavigation()

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={currentPage}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={transitionConfig}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}