'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Context for sidebar state management
interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
  isLargeScreen: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const [userToggled, setUserToggled] = useState(false)

  // Check screen size and set sidebar state accordingly
  useEffect(() => {
    const checkScreenSize = () => {
      const isLg = window.innerWidth >= 1024 // lg breakpoint
      setIsLargeScreen(isLg)

      // Only auto-set sidebar state if user hasn't manually toggled it
      if (!userToggled) {
        // On large screens, sidebar should be open by default
        // On smaller screens, it should be closed by default
        if (isLg) {
          setIsOpen(true)
        } else {
          setIsOpen(false)
        }
      }
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [userToggled])

  const toggle = () => {
    // Allow toggling on all screen sizes
    setUserToggled(true)
    setIsOpen(!isOpen)
  }

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle, isLargeScreen }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  className?: string
}

export function SidebarLayout({ children, sidebar, className = '' }: SidebarLayoutProps) {
  const { isOpen, setIsOpen } = useSidebar()

  const handleOverlayClick = () => {
    setIsOpen(false)
  }

  return (
    <div className={`flex min-h-screen bg-white ${className}`}>
      {/* Sidebar Container */}
      <div className="relative">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            width: isOpen ? 360 : 0,
            opacity: isOpen ? 1 : 0
          }}
          transition={{
            duration: 0.3,
            ease: [0.23, 1, 0.320, 1]
          }}
          className="fixed left-0 top-0 h-full z-50 overflow-hidden"
        >
          <div className="w-[360px] h-full">
            {sidebar}
          </div>
        </motion.div>

        {/* Overlay for mobile */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={handleOverlayClick}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{
          marginLeft: isOpen ? 360 : 0
        }}
        transition={{
          duration: 0.3,
          ease: [0.23, 1, 0.320, 1]
        }}
        className="flex-1 min-w-0 relative"
      >
        {/* Content wrapper */}
        <div className="w-full">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// Mobile responsive version with fixed sidebar on large screens
export function ResponsiveSidebarLayout({ children, sidebar, className = '' }: SidebarLayoutProps) {
  const { isOpen, setIsOpen, isLargeScreen } = useSidebar()

  const handleMobileOverlayClick = () => {
    // Only close on mobile/tablet, not on large screens
    if (!isLargeScreen) {
      setIsOpen(false)
    }
  }

  return (
    <div className={`flex min-h-screen bg-white ${className}`}>
      {/* Sidebar - Only show on large screens (lg+) */}
      <AnimatePresence>
        {isLargeScreen && (
          <motion.div
            initial={{ x: isOpen ? 0 : -360 }}
            animate={{ x: isOpen ? 0 : -360 }}
            transition={{
              duration: 0.3,
              ease: [0.23, 1, 0.320, 1]
            }}
            className="hidden lg:block w-[360px] h-screen fixed left-0 top-0 z-50"
          >
            {sidebar}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay - Only for mobile/tablet */}
      <AnimatePresence>
        {isOpen && !isLargeScreen && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={handleMobileOverlayClick}
            />

            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{
                duration: 0.3,
                ease: [0.23, 1, 0.320, 1]
              }}
              className="fixed left-0 top-0 h-full w-[280px] sm:w-[320px] z-50 lg:hidden overflow-y-auto"
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        className="flex-1 min-w-0 relative"
        animate={{
          marginLeft: isLargeScreen && isOpen ? 360 : 0
        }}
        transition={{
          duration: 0.3,
          ease: [0.23, 1, 0.320, 1]
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
