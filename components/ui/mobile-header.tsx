'use client'

import { ReactNode } from 'react'
import { ArrowLeft, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  badge?: string | number
  showBack?: boolean
  onBack?: () => void
  actions?: ReactNode
  className?: string
  sticky?: boolean
}

export function MobileHeader({
  title,
  subtitle,
  badge,
  showBack = false,
  onBack,
  actions,
  className,
  sticky = true
}: MobileHeaderProps) {
  return (
    <header className={cn(
      'z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border',
      sticky && 'sticky top-14 sm:top-16',
      className
    )}>
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Left side - Back button and title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-9 w-9 sm:h-8 sm:w-8 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-4 sm:w-4" />
              </Button>
            )}
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate">
                  {title}
                </h1>
                {badge && (
                  <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-0.5 flex-shrink-0">
                    {badge}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// Preset configurations for common use cases
export const MobileHeaderPresets = {
  dashboard: (title: string, badge?: string | number) => ({
    title,
    badge,
    sticky: true,
    className: 'bg-background/95'
  }),
  
  page: (title: string, subtitle?: string, onBack?: () => void) => ({
    title,
    subtitle,
    showBack: true,
    onBack,
    sticky: true
  }),
  
  modal: (title: string, onClose?: () => void) => ({
    title,
    showBack: true,
    onBack: onClose,
    sticky: false,
    className: 'border-b-0'
  })
}
