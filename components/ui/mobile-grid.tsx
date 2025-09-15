'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MobileGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'small' | 'medium' | 'large'
  className?: string
  responsive?: boolean
}

export function MobileGrid({
  children,
  columns = 2,
  gap = 'medium',
  className,
  responsive = true
}: MobileGridProps) {
  const gapClasses = {
    small: 'gap-2 sm:gap-3',
    medium: 'gap-3 sm:gap-4 md:gap-6',
    large: 'gap-4 sm:gap-6 md:gap-8'
  }

  const getColumnClasses = () => {
    if (!responsive) {
      return `grid-cols-${columns}`
    }

    switch (columns) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 sm:grid-cols-2'
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      case 4:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      default:
        return 'grid-cols-1 sm:grid-cols-2'
    }
  }

  return (
    <div className={cn(
      'grid',
      getColumnClasses(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

// Preset grid configurations
export const MobileGridPresets = {
  stats: {
    columns: 2 as const,
    gap: 'medium' as const,
    className: 'mb-4 sm:mb-6'
  },
  
  actions: {
    columns: 2 as const,
    gap: 'small' as const,
    className: 'mb-4 sm:mb-6'
  },
  
  cards: {
    columns: 1 as const,
    gap: 'medium' as const,
    responsive: true
  },
  
  features: {
    columns: 3 as const,
    gap: 'medium' as const,
    responsive: true
  }
}

// Mobile-first list component
interface MobileListProps {
  children: ReactNode
  className?: string
  spacing?: 'tight' | 'normal' | 'loose'
}

export function MobileList({
  children,
  className,
  spacing = 'normal'
}: MobileListProps) {
  const spacingClasses = {
    tight: 'space-y-1 sm:space-y-2',
    normal: 'space-y-2 sm:space-y-3',
    loose: 'space-y-3 sm:space-y-4 md:space-y-6'
  }

  return (
    <div className={cn(
      'w-full',
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  )
}

// Mobile-first section component
interface MobileSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  padding?: 'none' | 'small' | 'medium' | 'large'
}

export function MobileSection({
  title,
  subtitle,
  children,
  className,
  headerClassName,
  contentClassName,
  padding = 'medium'
}: MobileSectionProps) {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-3 sm:p-4',
    medium: 'p-4 sm:p-6 md:p-8',
    large: 'p-6 sm:p-8 md:p-12'
  }

  return (
    <section className={cn(
      'w-full',
      paddingClasses[padding],
      className
    )}>
      {(title || subtitle) && (
        <div className={cn(
          'mb-4 sm:mb-6',
          headerClassName
        )}>
          {title && (
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm sm:text-base text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={contentClassName}>
        {children}
      </div>
    </section>
  )
}
