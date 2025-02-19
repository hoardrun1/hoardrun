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
    <div className={cn('min-h-screen flex flex-col', className)}>
      {showBreadcrumbs && (
        <div className="container mx-auto px-4 py-2">
          <Breadcrumbs />
        </div>
      )}
      {children}
    </div>
  )

  if (withTransition) {
    return <PageTransition>{content}</PageTransition>
  }

  return content
} 