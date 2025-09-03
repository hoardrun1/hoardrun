'use client'

import { motion } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RightSidebarToggleProps {
  isOpen: boolean
  onToggle: () => void
  notificationCount?: number
  className?: string
}

export function RightSidebarToggle({ 
  isOpen, 
  onToggle, 
  notificationCount = 0,
  className = '' 
}: RightSidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={`fixed right-4 top-4 z-[110] w-8 h-8 sm:w-8 sm:h-8 rounded-lg border-2 backdrop-blur-xl transition-all duration-500 shadow-2xl ${
        isOpen
          ? 'bg-white border-black hover:bg-white text-black shadow-black/20'
          : 'bg-black border-white hover:bg-black text-white shadow-white/20'
      } ${className}`}
      title={isOpen ? "Close activity panel" : "Open activity panel"}
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.320, 1] }}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        </motion.div>
        {!isOpen && notificationCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-gray-500 text-white border-2 border-white"
          >
            {notificationCount > 9 ? '9+' : notificationCount}
          </Badge>
        )}
      </div>
    </Button>
  )
}
