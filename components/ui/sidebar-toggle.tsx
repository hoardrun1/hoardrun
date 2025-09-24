'use client'

import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from './sidebar-layout'

interface SidebarToggleProps {
  className?: string
}

export function SidebarToggle({ className = '' }: SidebarToggleProps) {
  const { isOpen, toggle, isLargeScreen } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={`fixed z-[60] transition-all duration-500 shadow-2xl ${
        isLargeScreen
          ? // Desktop styling
            `w-8 h-8 rounded-lg border-2 backdrop-blur-xl ${
              isOpen
                ? 'right-4 top-4 bg-white border-black hover:bg-white text-black shadow-black/20'
                : 'left-4 top-4 bg-black border-white hover:bg-black text-white shadow-white/20'
            }`
          : // Mobile styling
            `w-10 h-10 rounded-xl border-2 backdrop-blur-xl ${
              isOpen
                ? 'right-4 top-4 bg-white/95 border-gray-200 hover:bg-white text-black shadow-black/20'
                : 'left-4 top-4 bg-black/90 border-gray-800 hover:bg-black text-white shadow-black/40'
            }`
      } ${className}`}
      title={isOpen ? "Close sidebar" : "Open sidebar"}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
    >
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.320, 1] }}
      >
        {isOpen ? (
          <X className={`${isLargeScreen ? 'h-4 w-4' : 'h-5 w-5'}`} />
        ) : (
          <Menu className={`${isLargeScreen ? 'h-4 w-4' : 'h-5 w-5'}`} />
        )}
      </motion.div>
    </Button>
  )
}
