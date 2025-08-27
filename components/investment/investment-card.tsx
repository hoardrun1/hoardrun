'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, AlertCircle, ChevronRight, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Investment } from '@/services/investment-service'
import { ResponsiveContainer, Area, AreaChart } from 'recharts'

interface InvestmentCardProps {
  investment: Investment
  onSelect?: (investment: Investment) => void
  onViewDetails?: (investment: Investment) => void
  className?: string
  isSelected?: boolean
}

export function InvestmentCard({
  investment,
  onSelect,
  onViewDetails,
  className,
  isSelected = false,
}: InvestmentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'MEDIUM': // Fixed from MODERATE to match Prisma RiskLevel enum
        return 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
      case 'HIGH':
        return 'bg-gray-300 text-black dark:bg-gray-600 dark:text-white'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getReturnColor = (returnValue: number) => {
    if (returnValue > 0) return 'text-gray-800 dark:text-gray-200'
    if (returnValue < 0) return 'text-gray-600 dark:text-gray-400'
    return 'text-gray-600'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect?.(investment)}
      className={cn(
        'cursor-pointer transition-all duration-200',
        isSelected && 'ring-2 ring-gray-400 dark:ring-gray-600',
        className
      )}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{investment.name}</CardTitle>
              <CardDescription>{investment.type}</CardDescription>
            </div>
            <Badge className={getRiskColor(investment.risk)}>
              {investment.risk}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Amount and Return */}
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">Invested Amount</div>
                <div className="text-lg font-semibold">
                  ${investment.amount.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Return</div>
                <div className={cn(
                  "text-lg font-semibold flex items-center gap-1",
                  getReturnColor(investment.return)
                )}>
                  {investment.return > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(investment.return)}%
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="h-20">
              {investment.performance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={investment.performance}>
                    <defs>
                      <linearGradient id={`gradient-${investment.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={investment.return > 0 ? '#6b7280' : '#374151'} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={investment.return > 0 ? '#6b7280' : '#374151'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={investment.return > 0 ? '#6b7280' : '#374151'}
                      fill={`url(#gradient-${investment.id})`}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    No performance data available
                  </div>
                </div>
              )}
            </div>

            {/* Holdings */}
            <div>
              <div className="text-sm text-gray-500 mb-2">Holdings</div>
              <div className="flex flex-wrap gap-2">
                {investment.holdings.map((holding, index) => (
                  <Badge key={index} variant="secondary">
                    {holding}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails?.(investment)
                }}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'opacity-0 transition-opacity duration-200',
                  isHovered && 'opacity-100'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails?.(investment)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function InvestmentCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
