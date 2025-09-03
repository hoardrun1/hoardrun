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
    // All categories use black and white theme
    return 'bg-white text-black border-black'
  }

  const getRiskColor = (score: number) => {
    // All risk levels use black color
    return 'text-black'
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
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 bg-white border-black hover:border-black">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg font-bold line-clamp-1 text-black">
                  {circle.name}
                </CardTitle>
                {circle.isPrivate && (
                  <Lock className="h-4 w-4 text-black" />
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
              <Sparkles className="h-4 w-4 text-black" />
              <span className="text-sm font-semibold text-black">
                {circle.averageReturn.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <p className="text-sm text-black/60 line-clamp-2 mt-2">
            {circle.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-black/60" />
                <span className="text-xs text-black/60">Pool Value</span>
              </div>
              <p className="font-semibold text-sm text-black">
                {formatCurrency(circle.totalPoolValue)}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-black/60" />
                <span className="text-xs text-black/60">Min. Investment</span>
              </div>
              <p className="font-semibold text-sm text-black">
                {formatCurrency(circle.minimumContribution)}
              </p>
            </div>
          </div>

          {/* Members Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-black/60" />
                <span className="text-xs text-black/60">Members</span>
              </div>
              <span className="text-xs font-medium text-black">
                {circle.currentMembers}/{circle.maxMembers}
              </span>
            </div>
            <Progress value={membershipProgress} className="h-2" />
          </div>

          {/* Performance & Risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-black" />
              <span className="text-sm font-medium text-black">
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
            <Globe className="h-3 w-3 text-black" />
            <span className="text-xs text-black font-medium">
              {circle.blockchainNetwork}
            </span>
            <Badge variant="outline" className="text-xs bg-white text-black border-black">
              {circle.status}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="flex-1 text-xs bg-white text-black border-black hover:bg-black hover:text-white"
            >
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
            
            <Button
              size="sm"
              onClick={onJoin}
              className="flex-1 bg-black hover:bg-black/90 text-white text-xs"
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
          <div className="flex items-center justify-between pt-2 border-t border-black">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
              <span className="text-xs text-black/60">Active</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-black/60" />
              <span className="text-xs text-black/60">
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
              <Badge className="bg-black text-white text-xs">
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
