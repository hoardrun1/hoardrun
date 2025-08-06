'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleProps {
  children: React.ReactNode
  className?: string
}

interface CollapsibleTriggerProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

interface CollapsibleContentProps {
  children: React.ReactNode
  className?: string
}

const CollapsibleContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {}
})

const Collapsible = ({ children, className }: CollapsibleProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <CollapsibleContext.Provider value={{ isOpen, setIsOpen }}>
      <div className={cn('', className)}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

const CollapsibleTrigger = ({ 
  children, 
  onClick, 
  className 
}: CollapsibleTriggerProps) => {
  const { isOpen, setIsOpen } = React.useContext(CollapsibleContext)
  
  const handleClick = () => {
    setIsOpen(!isOpen)
    onClick?.()
  }
  
  return (
    <button
      onClick={handleClick}
      className={cn('', className)}
    >
      {children}
    </button>
  )
}

const CollapsibleContent = ({ 
  children, 
  className 
}: CollapsibleContentProps) => {
  const { isOpen } = React.useContext(CollapsibleContext)
  
  if (!isOpen) return null
  
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
}
