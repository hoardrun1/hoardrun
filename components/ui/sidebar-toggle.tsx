'use client'

import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from './sidebar-layout'

interface SidebarToggleProps {
  className?: string
}

export function SidebarToggle({ className = '' }: SidebarToggleProps) {
  const { isOpen, toggle } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={`fixed left-5 top-6 z-[60] w-11 h-11 rounded-2xl border-2 backdrop-blur-xl transition-all duration-500 shadow-2xl ${
        isOpen
          ? 'bg-white/95 border-gray-200 hover:bg-white text-black shadow-black/20'
          : 'bg-black/90 border-gray-800 hover:bg-black text-white shadow-black/40'
      } ${className}`}
      title={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.320, 1] }}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.div>
    </Button>
  )
}
