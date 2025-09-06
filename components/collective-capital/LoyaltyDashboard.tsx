'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Award, Crown, Zap, Gift, Trophy,
  Target, TrendingUp, Coins,
  Sparkles, Flame
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
    // All badge rarities use black and white theme
    return 'border-black bg-white'
  }

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'DISCOUNT':
        return <Gift className="h-5 w-5 text-black" />
      case 'BONUS':
        return <Zap className="h-5 w-5 text-black" />
      case 'EXCLUSIVE_ACCESS':
        return <Crown className="h-5 w-5 text-black" />
      case 'CASHBACK':
        return <Coins className="h-5 w-5 text-black" />
      default:
        return <Gift className="h-5 w-5 text-black" />
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
          <Card key={i} className="animate-pulse bg-white border-black">
            <CardContent className="p-6">
              <div className="h-4 bg-black/20 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-black/20 rounded w-full mb-2"></div>
              <div className="h-3 bg-black/20 rounded w-2/3"></div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h3 className="text-base sm:text-2xl font-bold flex items-center gap-1 sm:gap-2 text-black">
            <Trophy className="h-4 w-4 sm:h-6 sm:w-6 text-black" />
            Loyalty Rewards
          </h3>
          <p className="text-xs sm:text-base text-black/60">
            Earn points and unlock exclusive benefits
          </p>
        </div>
        <Badge className="bg-black text-white text-xs sm:text-lg px-2 sm:px-4 py-1 sm:py-2 w-fit">
          <Coins className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          {stats.totalPoints.toLocaleString()} Points
        </Badge>
      </div>

      {/* Level Progress */}
      <Card className="bg-white border-black">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <div>
              <h4 className="text-base sm:text-xl font-bold text-black">
                {stats.currentLevel}
              </h4>
              <p className="text-xs sm:text-base text-black/70">
                {stats.pointsToNextLevel} points to {stats.nextLevel}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-lg sm:text-2xl font-bold text-black">
                Level 4
              </div>
              <div className="text-xs sm:text-sm text-black/70">
                Gold Tier
              </div>
            </div>
          </div>
          <Progress value={getLevelProgress()} className="h-2 sm:h-3 bg-gray-200" />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border-black">
          <CardContent className="p-3 sm:p-4 text-center">
            <Award className="h-4 w-4 sm:h-6 sm:w-6 text-black mx-auto mb-1 sm:mb-2" />
            <div className="text-sm sm:text-2xl font-bold text-black">{stats.totalBadges}</div>
            <div className="text-xs text-black/60">Badges Earned</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-black">
          <CardContent className="p-3 sm:p-4 text-center">
            <Target className="h-4 w-4 sm:h-6 sm:w-6 text-black mx-auto mb-1 sm:mb-2" />
            <div className="text-sm sm:text-2xl font-bold text-black">{stats.circlesJoined}</div>
            <div className="text-xs text-black/60">Circles Joined</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-black">
          <CardContent className="p-3 sm:p-4 text-center">
            <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-black mx-auto mb-1 sm:mb-2" />
            <div className="text-sm sm:text-2xl font-bold text-black">{stats.successfulInvestments}</div>
            <div className="text-xs text-black/60">Successful Investments</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-black">
          <CardContent className="p-3 sm:p-4 text-center">
            <Coins className="h-4 w-4 sm:h-6 sm:w-6 text-black mx-auto mb-1 sm:mb-2" />
            <div className="text-sm sm:text-2xl font-bold text-black">${(stats.totalReturns / 1000).toFixed(1)}K</div>
            <div className="text-xs text-black/60">Total Returns</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border-black">
          <TabsTrigger value="overview" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">Overview</TabsTrigger>
          <TabsTrigger value="badges" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">Badges ({badges.length})</TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 sm:space-y-4 mt-3 sm:mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
            <Card className="bg-white border-black">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-black">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-2 sm:space-y-3">
                {badges.slice(0, 3).map((badge) => (
                  <div key={badge.id} className="flex items-center gap-2 sm:gap-3">
                    <div className="text-lg sm:text-2xl">{badge.icon}</div>
                    <div>
                      <div className="text-xs sm:text-base font-medium text-black">{badge.name}</div>
                      <div className="text-xs sm:text-sm text-black/60">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border-black">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-black">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                  Available Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-2 sm:space-y-3">
                {rewards.filter(r => r.available && !r.claimed).slice(0, 3).map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="text-base sm:text-xl">{reward.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-base font-medium text-black truncate">{reward.name}</div>
                        <div className="text-xs sm:text-sm text-black/60">
                          {reward.pointsCost} points
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={stats.totalPoints < reward.pointsCost}
                      onClick={() => claimReward(reward.id)}
                      className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-xs sm:text-sm px-2 sm:px-3 shrink-0"
                    >
                      Claim
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-3 sm:space-y-4 mt-3 sm:mt-6">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={cn("text-center", getBadgeRarityColor(badge.rarity))}>
                  <CardContent className="p-3 sm:p-6">
                    <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">{badge.icon}</div>
                    <h4 className="text-xs sm:text-base font-bold mb-1 sm:mb-2 text-black">{badge.name}</h4>
                    <p className="text-xs sm:text-sm text-black/70 mb-2 sm:mb-3">{badge.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs bg-white text-black border-black">
                        {badge.rarity}
                      </Badge>
                      <span className="text-xs text-black/60">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-3 sm:space-y-4 mt-3 sm:mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={cn(
                  "transition-all duration-300 bg-white border-black",
                  reward.available ? "hover:shadow-lg" : "opacity-60"
                )}>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        <div className="mt-0.5">
                          {getRewardTypeIcon(reward.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-bold text-black">{reward.name}</h4>
                          <p className="text-xs sm:text-sm text-black/70">{reward.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs bg-white text-black border-black w-fit">
                        {reward.pointsCost} pts
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        className={cn(
                          "text-xs",
                          reward.available ? "bg-black text-white" : "bg-gray-300 text-gray-600"
                        )}
                      >
                        {reward.claimed ? "Claimed" : reward.available ? "Available" : "Locked"}
                      </Badge>
                      
                      <Button
                        size="sm"
                        disabled={!reward.available || reward.claimed || stats.totalPoints < reward.pointsCost}
                        onClick={() => claimReward(reward.id)}
                        className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-xs sm:text-sm px-2 sm:px-3"
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
