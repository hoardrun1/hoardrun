'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  children: React.ReactNode
}

interface TooltipTriggerProps {
  children: React.ReactNode
}

interface TooltipContentProps {
  children: React.ReactNode
  className?: string
}

interface TooltipProviderProps {
  children: React.ReactNode
}

const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <>{children}</>
}

const Tooltip = ({ children }: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false)
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === TooltipContent) {
            return React.cloneElement(child, { 
              ...child.props, 
              isVisible 
            } as any)
          }
        }
        return child
      })}
    </div>
  )
}

const TooltipTrigger = ({ children }: TooltipTriggerProps) => {
  return <>{children}</>
}

const TooltipContent = ({ 
  children, 
  className,
  isVisible 
}: TooltipContentProps & { isVisible?: boolean }) => {
  if (!isVisible) return null
  
  return (
    <div
      className={cn(
        'absolute z-50 px-3 py-1.5 text-sm text-white bg-black rounded-md shadow-md',
        'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        'before:content-[""] before:absolute before:top-full before:left-1/2 before:transform before:-translate-x-1/2',
        'before:border-4 before:border-transparent before:border-t-black',
        className
      )}
    >
      {children}
    </div>
  )
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
}
