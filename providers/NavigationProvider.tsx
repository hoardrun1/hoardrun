'use client'

import { createContext, useContext, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useNavigationStore } from '@/services/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { NavigationProgress } from '@/components/ui/navigation-progress'

interface NavigationContextType {
  isReady: boolean
}

const NavigationContext = createContext<NavigationContextType>({ isReady: false })

export const useNavigationContext = () => useContext(NavigationContext)

interface NavigationProviderProps {
  children: React.ReactNode
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const pathname = usePathname()
  const setCurrentPage = useNavigationStore((state) => state.setCurrentPage)
  const pushToStack = useNavigationStore((state) => state.pushToStack)

  useEffect(() => {
    // Initialize navigation state with current path
    setCurrentPage(pathname)
    pushToStack(pathname)
  }, [pathname, setCurrentPage, pushToStack])

  return (
    <NavigationContext.Provider value={{ isReady: true }}>
      <NavigationProgress />
      <div className="min-h-screen">
        <PageTransition>{children}</PageTransition>
      </div>
    </NavigationContext.Provider>
  )
} 