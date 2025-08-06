'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Context for sidebar state management
interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
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

  const toggle = () => setIsOpen(!isOpen)

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
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
  const { isOpen } = useSidebar()

  return (
    <div className={`flex min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
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
              onClick={() => {
                const { setIsOpen } = useSidebar()
                setIsOpen(false)
              }}
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

// Mobile responsive version
export function ResponsiveSidebarLayout({ children, sidebar, className = '' }: SidebarLayoutProps) {
  const { isOpen } = useSidebar()

  return (
    <div className={`flex min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Sidebar Container */}
      <div className="relative">
        {/* Desktop Sidebar */}
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
          className="hidden md:block fixed left-0 top-0 h-full z-50 overflow-hidden"
        >
          <div className="w-[360px] h-full">
            {sidebar}
          </div>
        </motion.div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Mobile Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                onClick={() => {
                  const { setIsOpen } = useSidebar()
                  setIsOpen(false)
                }}
              />
              
              {/* Mobile Sidebar */}
              <motion.div
                initial={{ x: -360 }}
                animate={{ x: 0 }}
                exit={{ x: -360 }}
                transition={{
                  duration: 0.3,
                  ease: [0.23, 1, 0.320, 1]
                }}
                className="fixed left-0 top-0 h-full w-[360px] z-50 md:hidden"
              >
                {sidebar}
              </motion.div>
            </>
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
        className="flex-1 min-w-0 relative hidden md:block"
      >
        {children}
      </motion.div>

      {/* Mobile Content (no margin) */}
      <div className="flex-1 min-w-0 relative md:hidden">
        {children}
      </div>
    </div>
  )
}
