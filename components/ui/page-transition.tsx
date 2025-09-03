'use client'

import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // Remove animations for instant navigation
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  )
}
