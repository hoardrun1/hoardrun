'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
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
  const [isInitialized, setIsInitialized] = useState(false)
  const resizeTimeoutRef = useRef<NodeJS.Timeout>()
  const previousScreenSizeRef = useRef<boolean>(false)

  // Debounced screen size check to prevent rapid state changes
  const debouncedCheckScreenSize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      const isLg = window.innerWidth >= 1024 // lg breakpoint
      const wasLargeScreen = previousScreenSizeRef.current
      
      setIsLargeScreen(isLg)
      previousScreenSizeRef.current = isLg

      // Only auto-set sidebar state on initial load or significant screen changes
      if (!isInitialized) {
        // On large screens, sidebar should be open by default
        // On smaller screens, it should be closed by default
        setIsOpen(isLg)
        setIsInitialized(true)
      } else if (wasLargeScreen && !isLg && isOpen) {
        // Only close when transitioning from large to small screen and sidebar is open
        // But preserve user intent by not resetting userToggled immediately
        setIsOpen(false)
        // Reset userToggled after a delay to allow user to reopen if needed
        setTimeout(() => {
          setUserToggled(false)
        }, 1000)
      } else if (!wasLargeScreen && isLg && !userToggled) {
        // When transitioning from small to large screen, open if user hasn't explicitly closed it
        setIsOpen(true)
      }
    }, 150) // 150ms debounce
  }, [isOpen, userToggled, isInitialized])

  // Check screen size and set sidebar state accordingly
  useEffect(() => {
    // Initial check
    debouncedCheckScreenSize()

    // Listen for resize events
    window.addEventListener('resize', debouncedCheckScreenSize)
    
    return () => {
      window.removeEventListener('resize', debouncedCheckScreenSize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [debouncedCheckScreenSize])

  const toggle = useCallback(() => {
    // Mark that user has manually toggled the sidebar
    setUserToggled(true)
    setIsOpen(prev => !prev)
  }, [])

  const setIsOpenWithUserIntent = useCallback((open: boolean) => {
    setUserToggled(true)
    setIsOpen(open)
  }, [])

  return (
    <SidebarContext.Provider value={{ 
      isOpen, 
      setIsOpen: setIsOpenWithUserIntent, 
      toggle, 
      isLargeScreen 
    }}>
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
    <div className={`flex min-h-screen bg-background ${className}`}>
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
  const overlayClickTimeoutRef = useRef<NodeJS.Timeout>()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  const handleMobileOverlayClick = useCallback((event: React.MouseEvent) => {
    // Prevent immediate closing if click is too close to sidebar opening
    if (overlayClickTimeoutRef.current) {
      return
    }

    // Only close on mobile/tablet, not on large screens
    if (!isLargeScreen) {
      // Add small delay to prevent accidental closes
      overlayClickTimeoutRef.current = setTimeout(() => {
        setIsOpen(false)
        overlayClickTimeoutRef.current = undefined
      }, 100)
    }
  }, [isLargeScreen, setIsOpen])

  // Handle touch gestures for mobile sidebar
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    setTouchStartX(touch.clientX)
    setTouchStartY(touch.clientY)
  }, [])

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartX
    const deltaY = touch.clientY - touchStartY

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX < -50 && isOpen && !isLargeScreen) {
        // Swipe left to close sidebar on mobile
        setIsOpen(false)
      }
    }

    setTouchStartX(null)
    setTouchStartY(null)
  }, [touchStartX, touchStartY, isOpen, isLargeScreen, setIsOpen])

  // Handle escape key and body scroll prevention
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isLargeScreen) {
        setIsOpen(false)
      }
    }

    // Improved body scroll prevention for mobile
    const preventBodyScroll = () => {
      if (isOpen && !isLargeScreen) {
        // Store current scroll position
        const scrollY = window.scrollY
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollY}px`
        document.body.style.width = '100%'
        document.body.style.overflow = 'hidden'
      } else {
        // Restore scroll position
        const scrollY = document.body.style.top
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1)
        }
      }
    }

    if (isOpen && !isLargeScreen) {
      document.addEventListener('keydown', handleEscapeKey)
      preventBodyScroll()
      
      return () => {
        document.removeEventListener('keydown', handleEscapeKey)
        // Reset body styles when component unmounts
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
      }
    } else {
      preventBodyScroll()
    }
    
    return undefined
  }, [isOpen, isLargeScreen, setIsOpen])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (overlayClickTimeoutRef.current) {
        clearTimeout(overlayClickTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={`flex min-h-screen bg-background ${className}`}>
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
            className="hidden lg:block w-[360px] h-screen fixed left-0 top-0 z-[100]"
          >
            {sidebar}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay - Only for mobile/tablet */}
      <AnimatePresence>
        {isOpen && !isLargeScreen && (
          <>
            {/* Mobile Overlay with improved click handling */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] lg:hidden"
              onClick={handleMobileOverlayClick}
              style={{ touchAction: 'none' }} // Prevent default touch behaviors
            />

            {/* Mobile Sidebar with touch gesture support */}
            <motion.div
              ref={sidebarRef}
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{
                duration: 0.3,
                ease: [0.23, 1, 0.320, 1]
              }}
              className="fixed left-0 top-0 h-full w-[300px] sm:w-[320px] z-[100] lg:hidden"
              data-sidebar="true"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ 
                height: '100dvh', // Use dynamic viewport height on mobile
                overflowY: 'auto',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch', // Enable smooth scrolling on iOS
                touchAction: 'pan-y', // Allow vertical scrolling but prevent horizontal
              }}
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
