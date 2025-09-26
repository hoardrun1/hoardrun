'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme immediately to prevent flash
  useEffect(() => {
    // Get initial theme from localStorage or system preference
    const getInitialTheme = (): Theme => {
      if (typeof window === 'undefined') return 'light'
      
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme
      }
      
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return systemPrefersDark ? 'dark' : 'light'
    }

    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
    
    // Apply theme immediately to prevent flash
    const root = document.documentElement
    if (initialTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    setMounted(true)
  }, [])

  // Apply theme to document and save to localStorage
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const body = document.body
    
    if (theme === 'dark') {
      root.classList.add('dark')
      body.classList.add('dark')
    } else {
      root.classList.remove('dark')
      body.classList.remove('dark')
    }

    // Save to localStorage
    localStorage.setItem('theme', theme)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff')
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="bg-background text-foreground">{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // During SSR/static generation or before hydration, return default values instead of throwing
    if (typeof window === 'undefined') {
      return {
        theme: 'light' as Theme,
        setTheme: () => {},
        toggleTheme: () => {}
      }
    }
    
    // Check if we're in a hydration phase by looking for the mounted state
    // If ThemeProvider hasn't mounted yet, return default values
    const isHydrating = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    return {
      theme: isHydrating as Theme,
      setTheme: () => {},
      toggleTheme: () => {}
    }
  }
  return context
}
