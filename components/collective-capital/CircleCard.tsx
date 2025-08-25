'use client'

import { motion } from 'framer-motion'
import { 
  Users, TrendingUp, Shield, Lock, Crown, 
  Eye, UserPlus, Sparkles, Target, ArrowRight,
  Calendar, DollarSign, Percent, Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CollectiveCircle } from '@/types/collective-capital'
import { cn } from '@/lib/utils'

interface CircleCardProps {
  circle: CollectiveCircle
  onJoin: () => void
  onViewDetails: () => void
  className?: string
}

export function CircleCard({ circle, onJoin, onViewDetails, className }: CircleCardProps) {
  const membershipProgress = (circle.currentMembers / circle.maxMembers) * 100
  
  const getCategoryColor = (category: string) => {
    const colors = {
      'GREEN_TECH': 'bg-green-100 text-green-800 border-green-200',
      'CRYPTO': 'bg-purple-100 text-purple-800 border-purple-200',
      'AI_TECH': 'bg-blue-100 text-blue-800 border-blue-200',
      'REAL_ESTATE': 'bg-orange-100 text-orange-800 border-orange-200',
      'HEALTHCARE': 'bg-red-100 text-red-800 border-red-200',
      'ENERGY': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'STOCKS': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'BONDS': 'bg-gray-100 text-gray-800 border-gray-200',
      'COMMODITIES': 'bg-amber-100 text-amber-800 border-amber-200',
      'STARTUPS': 'bg-pink-100 text-pink-800 border-pink-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-600'
    if (score <= 60) return 'text-yellow-600'
    if (score <= 80) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg font-bold line-clamp-1">
                  {circle.name}
                </CardTitle>
                {circle.isPrivate && (
                  <Lock className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <Badge 
                variant="outline" 
                className={cn("text-xs", getCategoryColor(circle.category))}
              >
                {circle.category.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-600">
                {circle.averageReturn.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
            {circle.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">Pool Value</span>
              </div>
              <p className="font-semibold text-sm">
                {formatCurrency(circle.totalPoolValue)}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">Min. Investment</span>
              </div>
              <p className="font-semibold text-sm">
                {formatCurrency(circle.minimumContribution)}
              </p>
            </div>
          </div>

          {/* Members Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">Members</span>
              </div>
              <span className="text-xs font-medium">
                {circle.currentMembers}/{circle.maxMembers}
              </span>
            </div>
            <Progress value={membershipProgress} className="h-2" />
          </div>

          {/* Performance & Risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                +{circle.totalReturns.toLocaleString()} returns
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Shield className={cn("h-4 w-4", getRiskColor(circle.riskScore))} />
              <span className={cn("text-sm font-medium", getRiskColor(circle.riskScore))}>
                Risk {circle.riskScore}
              </span>
            </div>
          </div>

          {/* Blockchain Network */}
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-blue-600 font-medium">
              {circle.blockchainNetwork}
            </span>
            <Badge variant="outline" className="text-xs">
              {circle.status}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="flex-1 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
            
            <Button
              size="sm"
              onClick={onJoin}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              disabled={circle.currentMembers >= circle.maxMembers}
            >
              {circle.isPrivate ? (
                <>
                  <UserPlus className="h-3 w-3 mr-1" />
                  Request
                </>
              ) : (
                <>
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Join
                </>
              )}
            </Button>
          </div>

          {/* Recent Activity Indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                Created {new Date(circle.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* AI Recommendation Badge */}
          {circle.aiRecommendations.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2"
            >
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Pick
              </Badge>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
