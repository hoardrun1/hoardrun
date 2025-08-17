'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useNavigationStore } from '@/services/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { NavigationProgress } from '@/components/ui/navigation-progress'
import { useToast } from "@/components/ui/use-toast"

interface NavigationContextType {
  isReady: boolean
  isLoading: boolean
  previousPage: string | null
  currentPage: string
}

const NavigationContext = createContext<NavigationContextType>({
  isReady: false,
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
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [previousPage, setPreviousPage] = useState<string | null>(null)
  const setCurrentPage = useNavigationStore((state) => state.setCurrentPage)
  const pushToStack = useNavigationStore((state) => state.pushToStack)

  useEffect(() => {
    // Initialize navigation state with current path
    setCurrentPage(pathname)
    pushToStack(pathname)
  }, [pathname, setCurrentPage, pushToStack])

  // Handle navigation errors
  useEffect(() => {
    const handleNavigationError = (event: ErrorEvent) => {
      console.error('Navigation error:', event.error)
      addToast({
        title: "Navigation Error",
        description: "Failed to load the page. Please try again.",
        variant: "destructive"
      })
      setIsLoading(false)
    }

    window.addEventListener('error', handleNavigationError)
    return () => window.removeEventListener('error', handleNavigationError)
  }, [addToast])

  // Track page transitions
  useEffect(() => {
    setPreviousPage(pathname)
    setIsLoading(true)

    // Remove artificial delay for faster navigation
    setIsLoading(false)
  }, [pathname])

  const contextValue = {
    isReady: true,
    isLoading,
    previousPage,
    currentPage: pathname
  }

  return (
    <NavigationContext.Provider value={contextValue}>
      <NavigationProgress />
      <div className="min-h-screen">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </NavigationContext.Provider>
  )
} 