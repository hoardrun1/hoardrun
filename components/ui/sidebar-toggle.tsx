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

  // Hide toggle button on large screens since sidebar is fixed
  if (isLargeScreen) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={`fixed z-[60] w-8 h-8 rounded-lg border-2 backdrop-blur-xl transition-all duration-500 shadow-2xl lg:hidden ${
        isOpen
          ? 'right-4 top-4 bg-white border-black hover:bg-white text-black shadow-black/20'
          : 'left-4 top-4 bg-black border-white hover:bg-black text-white shadow-white/20'
      } ${className}`}
      title={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.320, 1] }}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </motion.div>
    </Button>
  )
}
