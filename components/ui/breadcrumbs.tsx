'use client'

import { ChevronRight, Home } from 'lucide-react'
import { useAppNavigation } from '@/hooks/useAppNavigation'
import Link from 'next/link'

interface BreadcrumbsProps {
  className?: string
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className = '' }) => {
  const { currentPage } = useAppNavigation()
  
  const pathSegments = currentPage
    .split('/')
    .filter(Boolean)
    .map((segment) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      path: segment,
    }))

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).map(s => s.path).join('/')
        
        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            <Link
              href={path}
              className="text-gray-500 hover:text-gray-600 transition-colors"
            >
              {segment.name}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
