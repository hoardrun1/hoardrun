'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppNavigation } from '@/hooks/useAppNavigation'

interface PageTransitionProps {
  children: React.ReactNode
}

const slideVariants = {
  enter: (direction: 'forward' | 'backward' | 'none') => ({
    x: direction === 'forward' ? 1000 : direction === 'backward' ? -1000 : 0,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: 'forward' | 'backward' | 'none') => ({
    zIndex: 0,
    x: direction === 'forward' ? -1000 : direction === 'backward' ? 1000 : 0,
    opacity: 0
  })
}

const transitionConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const { currentPage, transitionDirection, isTransitioning } = useAppNavigation()

  return (
    <AnimatePresence initial={false} mode="wait" custom={transitionDirection}>
      <motion.div
        key={currentPage}
        custom={transitionDirection}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={transitionConfig}
        className="w-full min-h-screen"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: isTransitioning ? 'hidden' : 'auto'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
} 