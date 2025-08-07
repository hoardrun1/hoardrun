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
      className={`fixed left-4 top-4 z-[60] w-9 h-9 rounded-xl border-2 backdrop-blur-xl transition-all duration-500 shadow-2xl ${
        isOpen
          ? 'bg-white border-black hover:bg-white text-black shadow-black/20'
          : 'bg-black border-white hover:bg-black text-white shadow-white/20'
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
