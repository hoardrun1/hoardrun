'use client'

import { Clock, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export const NavigationHistory = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // TODO: Replace with proper navigation history from Python backend or local storage
  const recentPages = [
    '/dashboard',
    '/transactions',
    '/analytics',
    '/profile'
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-600 transition-colors"
      >
        <Clock className="h-4 w-4" />
        <span>Recent Pages</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-2">
              {recentPages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => {
                    router.push(page)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <span>{page}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
