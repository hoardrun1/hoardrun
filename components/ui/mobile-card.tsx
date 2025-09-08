'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MobileCardProps {
  children?: React.ReactNode
  className?: string
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  interactive?: boolean
  loading?: boolean
  badge?: string | number
  variant?: 'default' | 'compact' | 'feature' | 'stat'
}

export function MobileCard({
  children,
  className,
  title,
  description,
  icon: Icon,
  onClick,
  interactive = false,
  loading = false,
  badge,
  variant = 'default'
}: MobileCardProps) {
  const baseClasses = cn(
    'relative overflow-hidden transition-all duration-200',
    {
      'cursor-pointer hover:shadow-md active:scale-[0.98]': interactive || onClick,
      'animate-pulse': loading,
    }
  )

  const variantClasses = {
    default: 'p-4 sm:p-6',
    compact: 'p-3 sm:p-4',
    feature: 'p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20',
    stat: 'p-3 sm:p-4 text-center'
  }

  const CardComponent = motion.div

  return (
    <CardComponent
      className={cn(baseClasses, className)}
      onClick={onClick}
      whileTap={interactive || onClick ? { scale: 0.98 } : undefined}
      whileHover={interactive || onClick ? { y: -2 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('border-0 shadow-sm', variantClasses[variant])}>
        {(title || description || Icon) && (
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {Icon && (
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {title && (
                    <CardTitle className="text-sm sm:text-base md:text-lg font-semibold truncate">
                      {title}
                    </CardTitle>
                  )}
                  {description && (
                    <CardDescription className="text-xs sm:text-sm mt-1 line-clamp-2">
                      {description}
                    </CardDescription>
                  )}
                </div>
              </div>
              
              {badge && (
                <div className="flex-shrink-0 ml-2">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {badge}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
        )}
        
        {children && (
          <CardContent className="pt-0">
            {children}
          </CardContent>
        )}
        
        {loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        )}
      </Card>
    </CardComponent>
  )
}

// Specialized mobile card variants
export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
  ...props
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ComponentType<{ className?: string }>
  className?: string
} & Omit<MobileCardProps, 'title' | 'variant'>) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground'
  }

  return (
    <MobileCard
      variant="stat"
      className={className}
      {...props}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {title}
          </p>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        
        <div className="space-y-1">
          <p className="text-lg sm:text-xl md:text-2xl font-bold">
            {value}
          </p>
          {change && (
            <p className={cn('text-xs sm:text-sm font-medium', changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
      </div>
    </MobileCard>
  )
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  action,
  className,
  ...props
}: {
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  className?: string
} & Omit<MobileCardProps, 'title' | 'description' | 'variant'>) {
  return (
    <MobileCard
      variant="feature"
      title={title}
      description={description}
      icon={Icon}
      className={className}
      interactive
      {...props}
    >
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </MobileCard>
  )
}

export function CompactCard({
  children,
  className,
  ...props
}: {
  children: React.ReactNode
  className?: string
} & Omit<MobileCardProps, 'variant'>) {
  return (
    <MobileCard
      variant="compact"
      className={className}
      {...props}
    >
      {children}
    </MobileCard>
  )
}

export default MobileCard
