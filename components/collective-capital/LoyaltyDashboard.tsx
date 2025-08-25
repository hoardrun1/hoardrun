'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Award, Crown, Star, Zap, Gift, Trophy,
  Target, TrendingUp, Calendar, Coins,
  Medal, Sparkles, Flame, Diamond
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoyaltyBadge } from '@/types/collective-capital'
import { cn } from '@/lib/utils'

interface LoyaltyStats {
  totalPoints: number
  currentLevel: string
  nextLevel: string
  pointsToNextLevel: number
  totalBadges: number
  circlesJoined: number
  successfulInvestments: number
  totalReturns: number
}

interface LoyaltyReward {
  id: string
  name: string
  description: string
  pointsCost: number
  type: 'DISCOUNT' | 'BONUS' | 'EXCLUSIVE_ACCESS' | 'CASHBACK'
  icon: string
  available: boolean
  claimed: boolean
}

export function LoyaltyDashboard() {
  const [stats, setStats] = useState<LoyaltyStats | null>(null)
  const [badges, setBadges] = useState<LoyaltyBadge[]>([])
  const [rewards, setRewards] = useState<LoyaltyReward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadLoyaltyData()
  }, [])

  const loadLoyaltyData = async () => {
    try {
      setIsLoading(true)
      
      // Mock loyalty stats
      const mockStats: LoyaltyStats = {
        totalPoints: 2850,
        currentLevel: 'Gold Investor',
        nextLevel: 'Platinum Elite',
        pointsToNextLevel: 1150,
        totalBadges: 8,
        circlesJoined: 5,
        successfulInvestments: 12,
        totalReturns: 18500
      }

      // Mock badges
      const mockBadges: LoyaltyBadge[] = [
        {
          id: '1',
          name: 'First Circle',
          description: 'Joined your first investment circle',
          icon: '🎯',
          color: 'blue',
          earnedAt: new Date('2024-01-15'),
          rarity: 'COMMON'
        },
        {
          id: '2',
          name: 'Green Investor',
          description: 'Invested in 3 green technology circles',
          icon: '🌱',
          color: 'green',
          earnedAt: new Date('2024-01-18'),
          rarity: 'RARE'
        },
        {
          id: '3',
          name: 'Profit Master',
          description: 'Achieved 20%+ returns on an investment',
          icon: '💰',
          color: 'yellow',
          earnedAt: new Date('2024-01-20'),
          rarity: 'EPIC'
        },
        {
          id: '4',
          name: 'Community Leader',
          description: 'Created a successful investment circle',
          icon: '👑',
          color: 'purple',
          earnedAt: new Date('2024-01-22'),
          rarity: 'LEGENDARY'
        }
      ]

      // Mock rewards
      const mockRewards: LoyaltyReward[] = [
        {
          id: '1',
          name: '5% Fee Discount',
          description: 'Reduce transaction fees by 5% for 30 days',
          pointsCost: 500,
          type: 'DISCOUNT',
          icon: '💸',
          available: true,
          claimed: false
        },
        {
          id: '2',
          name: 'Exclusive Circle Access',
          description: 'Get early access to premium investment circles',
          pointsCost: 1000,
          type: 'EXCLUSIVE_ACCESS',
          icon: '🔑',
          available: true,
          claimed: false
        },
        {
          id: '3',
          name: 'Investment Bonus',
          description: 'Get 2% bonus on your next investment',
          pointsCost: 750,
          type: 'BONUS',
          icon: '🎁',
          available: true,
          claimed: false
        },
        {
          id: '4',
          name: 'Cashback Reward',
          description: '$50 cashback on investments over $5,000',
          pointsCost: 2000,
          type: 'CASHBACK',
          icon: '💵',
          available: false,
          claimed: false
        }
      ]

      setStats(mockStats)
      setBadges(mockBadges)
      setRewards(mockRewards)
    } catch (error) {
      console.error('Error loading loyalty data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelProgress = () => {
    if (!stats) return 0
    const totalPointsForNextLevel = stats.totalPoints + stats.pointsToNextLevel
    return (stats.totalPoints / totalPointsForNextLevel) * 100
  }

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON':
        return 'border-gray-300 bg-gray-50'
      case 'RARE':
        return 'border-blue-300 bg-blue-50'
      case 'EPIC':
        return 'border-purple-300 bg-purple-50'
      case 'LEGENDARY':
        return 'border-yellow-300 bg-yellow-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'DISCOUNT':
        return <Gift className="h-5 w-5 text-green-600" />
      case 'BONUS':
        return <Zap className="h-5 w-5 text-blue-600" />
      case 'EXCLUSIVE_ACCESS':
        return <Crown className="h-5 w-5 text-purple-600" />
      case 'CASHBACK':
        return <Coins className="h-5 w-5 text-yellow-600" />
      default:
        return <Gift className="h-5 w-5 text-gray-600" />
    }
  }

  const claimReward = async (rewardId: string) => {
    // Handle reward claiming
    console.log(`Claiming reward ${rewardId}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Loyalty Rewards
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Earn points and unlock exclusive benefits
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg px-4 py-2">
          <Coins className="h-4 w-4 mr-2" />
          {stats.totalPoints.toLocaleString()} Points
        </Badge>
      </div>

      {/* Level Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {stats.currentLevel}
              </h4>
              <p className="text-blue-700 dark:text-blue-300">
                {stats.pointsToNextLevel} points to {stats.nextLevel}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                Level 4
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Gold Tier
              </div>
            </div>
          </div>
          <Progress value={getLevelProgress()} className="h-3" />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalBadges}</div>
            <div className="text-xs text-gray-500">Badges Earned</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.circlesJoined}</div>
            <div className="text-xs text-gray-500">Circles Joined</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.successfulInvestments}</div>
            <div className="text-xs text-gray-500">Successful Investments</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">${(stats.totalReturns / 1000).toFixed(1)}K</div>
            <div className="text-xs text-gray-500">Total Returns</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges ({badges.length})</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-red-500" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {badges.slice(0, 3).map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Available Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rewards.filter(r => r.available && !r.claimed).slice(0, 3).map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{reward.icon}</div>
                      <div>
                        <div className="font-medium">{reward.name}</div>
                        <div className="text-sm text-gray-500">
                          {reward.pointsCost} points
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={stats.totalPoints < reward.pointsCost}
                      onClick={() => claimReward(reward.id)}
                    >
                      Claim
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={cn("text-center", getBadgeRarityColor(badge.rarity))}>
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h4 className="font-bold mb-2">{badge.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {badge.rarity}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={cn(
                  "transition-all duration-300",
                  reward.available ? "hover:shadow-lg" : "opacity-60"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getRewardTypeIcon(reward.type)}
                        <div>
                          <h4 className="font-bold">{reward.name}</h4>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {reward.pointsCost} pts
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={reward.available ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {reward.claimed ? "Claimed" : reward.available ? "Available" : "Locked"}
                      </Badge>
                      
                      <Button
                        size="sm"
                        disabled={!reward.available || reward.claimed || stats.totalPoints < reward.pointsCost}
                        onClick={() => claimReward(reward.id)}
                      >
                        {reward.claimed ? "Claimed" : "Claim"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
