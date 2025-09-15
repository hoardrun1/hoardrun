"use client"

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Breadcrumbs } from './breadcrumbs'
import { PageTransition } from './page-transition'

interface LayoutWrapperProps {
  children: ReactNode
  className?: string
  showBreadcrumbs?: boolean
  withTransition?: boolean
}

export function LayoutWrapper({
  children,
  className,
  showBreadcrumbs = true,
  withTransition = true,
}: LayoutWrapperProps) {
  const content = (
    <div className={cn(
      'min-h-screen-mobile flex flex-col overflow-x-hidden',
      'safe-area-inset-top safe-area-inset-bottom',
      className
    )}>
      {showBreadcrumbs && (
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-2">
          <Breadcrumbs />
        </div>
      )}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  )

  if (withTransition) {
    return <PageTransition>{content}</PageTransition>
  }

  return content
} 