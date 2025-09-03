'use client'

import { createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'

interface NavigationContextType {
  isReady: boolean
  isLoading: boolean
  previousPage: string | null
  currentPage: string
}

const NavigationContext = createContext<NavigationContextType>({
  isReady: true,
  isLoading: false,
  previousPage: null,
  currentPage: '/'
})

export const useNavigationContext = () => useContext(NavigationContext)

interface NavigationProviderProps {
  children: React.ReactNode
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const pathname = usePathname()

  // Simplified context value for better performance
  const contextValue = {
    isReady: true,
    isLoading: false,
    previousPage: null,
    currentPage: pathname
  }

  return (
    <NavigationContext.Provider value={contextValue}>
      <div className="min-h-screen">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </NavigationContext.Provider>
  )
}
