'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, TrendingUp, AlertTriangle, Target, 
  Sparkles, ArrowRight, Eye, ThumbsUp, 
  ThumbsDown, Clock, Zap, Shield, Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIRecommendation } from '@/types/collective-capital'
import { cn } from '@/lib/utils'

export function AIRecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      setIsLoading(true)
      // Mock AI recommendations
      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          type: 'INVESTMENT_OPPORTUNITY',
          title: 'High-Growth Green Tech Circle Opportunity',
          description: 'Based on your investment history and market trends, joining "Solar Innovators" circle could yield 22-28% returns. The circle focuses on emerging solar technology companies with strong fundamentals.',
          confidence: 87,
          category: 'GREEN_TECH',
          priority: 'HIGH',
          actionRequired: true,
          createdAt: new Date('2024-01-22T10:00:00Z'),
          expiresAt: new Date('2024-01-29T10:00:00Z')
        },
        {
          id: '2',
          type: 'RISK_WARNING',
          title: 'Crypto Market Volatility Alert',
          description: 'Current crypto circles show increased volatility. Consider reducing exposure or diversifying into more stable asset classes. Market indicators suggest a potential 15-20% correction.',
          confidence: 92,
          category: 'CRYPTO',
          priority: 'URGENT',
          actionRequired: true,
          createdAt: new Date('2024-01-22T08:30:00Z'),
          expiresAt: new Date('2024-01-24T08:30:00Z')
        },
        {
          id: '3',
          type: 'PORTFOLIO_OPTIMIZATION',
          title: 'Diversification Opportunity',
          description: 'Your current portfolio is 70% tech-focused. Adding healthcare or real estate circles could reduce risk by 12% while maintaining similar returns.',
          confidence: 78,
          category: 'HEALTHCARE',
          priority: 'MEDIUM',
          actionRequired: false,
          createdAt: new Date('2024-01-21T15:20:00Z')
        },
        {
          id: '4',
          type: 'MARKET_INSIGHT',
          title: 'AI Sector Momentum Building',
          description: 'AI and robotics sectors showing strong momentum. Consider increasing allocation to AI-focused circles. Expected 18-25% growth over next 6 months.',
          confidence: 84,
          category: 'AI_TECH',
          priority: 'HIGH',
          actionRequired: false,
          createdAt: new Date('2024-01-21T12:00:00Z')
        },
        {
          id: '5',
          type: 'INVESTMENT_OPPORTUNITY',
          title: 'Undervalued Real Estate Circle',
          description: 'Property Pioneers circle is currently undervalued with strong fundamentals. Market analysis suggests 15-20% upside potential in Q2 2024.',
          confidence: 73,
          category: 'REAL_ESTATE',
          priority: 'MEDIUM',
          actionRequired: false,
          createdAt: new Date('2024-01-20T14:45:00Z')
        }
      ]
      
      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Error loading AI recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INVESTMENT_OPPORTUNITY':
        return <Target className="h-5 w-5 text-black" />
      case 'RISK_WARNING':
        return <AlertTriangle className="h-5 w-5 text-black" />
      case 'PORTFOLIO_OPTIMIZATION':
        return <TrendingUp className="h-5 w-5 text-black" />
      case 'MARKET_INSIGHT':
        return <Brain className="h-5 w-5 text-black" />
      default:
        return <Sparkles className="h-5 w-5 text-black" />
    }
  }

  const getPriorityColor = (priority: string) => {
    // All priorities use black and white theme
    return 'bg-white text-black border-black'
  }

  const getConfidenceColor = (confidence: number) => {
    // All confidence levels use black color
    return 'text-black'
  }

  const filteredRecommendations = recommendations.filter(rec => {
    if (activeTab === 'all') return true
    if (activeTab === 'opportunities') return rec.type === 'INVESTMENT_OPPORTUNITY'
    if (activeTab === 'warnings') return rec.type === 'RISK_WARNING'
    if (activeTab === 'insights') return rec.type === 'MARKET_INSIGHT' || rec.type === 'PORTFOLIO_OPTIMIZATION'
    return true
  })

  const handleRecommendationAction = (recommendationId: string, action: 'accept' | 'dismiss') => {
    // Handle recommendation action
    console.log(`${action} recommendation ${recommendationId}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-white border-black">
            <CardContent className="p-3 sm:p-6">
              <div className="h-3 sm:h-4 bg-black/20 rounded w-3/4 mb-2 sm:mb-4"></div>
              <div className="h-2 sm:h-3 bg-black/20 rounded w-full mb-1 sm:mb-2"></div>
              <div className="h-2 sm:h-3 bg-black/20 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-base font-bold flex items-center gap-1 sm:gap-2 text-black">
            <Brain className="h-3 w-3 sm:h-6 sm:w-6 text-black" />
            AI Investment Insights
          </h3>
          <p className="text-xs sm:text-sm text-black/60">
            Personalized recommendations powered by advanced market analysis
          </p>
        </div>
        <Badge className="bg-black text-white text-xs px-2 py-1 shrink-0">
          <Zap className="h-2 w-2 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Card className="bg-white border-black">
          <CardContent className="p-2 sm:p-4 text-center">
            <Target className="h-3 w-3 sm:h-6 sm:w-6 text-black mx-auto mb-1" />
            <div className="text-xs sm:text-base font-bold text-black">
              {recommendations.filter(r => r.type === 'INVESTMENT_OPPORTUNITY').length}
            </div>
            <div className="text-xs sm:text-sm text-black/60">Opportunities</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-black">
          <CardContent className="p-2 sm:p-4 text-center">
            <AlertTriangle className="h-3 w-3 sm:h-6 sm:w-6 text-black mx-auto mb-1" />
            <div className="text-xs sm:text-base font-bold text-black">
              {recommendations.filter(r => r.type === 'RISK_WARNING').length}
            </div>
            <div className="text-xs sm:text-sm text-black/60">Risk Alerts</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-black">
          <CardContent className="p-2 sm:p-4 text-center">
            <Brain className="h-3 w-3 sm:h-6 sm:w-6 text-black mx-auto mb-1" />
            <div className="text-xs sm:text-base font-bold text-black">
              {recommendations.filter(r => r.type === 'MARKET_INSIGHT').length}
            </div>
            <div className="text-xs sm:text-sm text-black/60">Market Insights</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-black">
          <CardContent className="p-2 sm:p-4 text-center">
            <Star className="h-3 w-3 sm:h-6 sm:w-6 text-black mx-auto mb-1" />
            <div className="text-xs sm:text-base font-bold text-black">
              {Math.round(recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length)}%
            </div>
            <div className="text-xs sm:text-sm text-black/60">Avg Confidence</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border-black h-8 sm:h-10">
          <TabsTrigger value="all" className="data-[state=active]:bg-black data-[state=active]:text-white text-black text-xs sm:text-sm px-1 sm:px-3">
            <span className="hidden sm:inline">All ({recommendations.length})</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-black data-[state=active]:text-white text-black text-xs sm:text-sm px-1 sm:px-3">
            <span className="hidden sm:inline">Opportunities ({recommendations.filter(r => r.type === 'INVESTMENT_OPPORTUNITY').length})</span>
            <span className="sm:hidden">Opps</span>
          </TabsTrigger>
          <TabsTrigger value="warnings" className="data-[state=active]:bg-black data-[state=active]:text-white text-black text-xs sm:text-sm px-1 sm:px-3">
            <span className="hidden sm:inline">Warnings ({recommendations.filter(r => r.type === 'RISK_WARNING').length})</span>
            <span className="sm:hidden">Warn</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-black data-[state=active]:text-white text-black text-xs sm:text-sm px-1 sm:px-3">
            <span className="hidden sm:inline">Insights ({recommendations.filter(r => r.type === 'MARKET_INSIGHT' || r.type === 'PORTFOLIO_OPTIMIZATION').length})</span>
            <span className="sm:hidden">Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 mt-3 sm:mt-6">
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 bg-white border-black">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Title and Icon Row */}
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-1">
                        {getTypeIcon(recommendation.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-base font-semibold text-black leading-tight mb-2">
                          {recommendation.title}
                        </h4>
                        
                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs sm:text-sm px-2 py-1 bg-white text-black border-black font-medium"
                          >
                            {recommendation.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs sm:text-sm px-2 py-1 bg-white text-black border-black">
                            {recommendation.category.replace('_', ' ')}
                          </Badge>
                          {recommendation.actionRequired && (
                            <Badge className="text-xs sm:text-sm px-2 py-1 bg-black text-white">
                              Action Required
                            </Badge>
                          )}
                        </div>

                        {/* Confidence Row */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-medium text-black">
                            {recommendation.confidence}% confidence
                          </span>
                          <Progress 
                            value={recommendation.confidence} 
                            className="flex-1 h-1.5 bg-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-black/70 leading-relaxed pl-8">
                      {recommendation.description}
                    </p>

                    {/* Footer */}
                    <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                      {/* Date Row */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-black/60 pl-8">
                        <Clock className="h-3 w-3 text-black shrink-0" />
                        <span>
                          {new Date(recommendation.createdAt).toLocaleDateString()}
                          {recommendation.expiresAt && (
                            <span className="text-black font-medium ml-2">
                              • Expires {new Date(recommendation.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center gap-2 pl-8">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecommendationAction(recommendation.id, 'dismiss')}
                          className="bg-white text-black border-black hover:bg-black hover:text-white text-xs sm:text-sm px-4 py-2 h-auto flex-1"
                        >
                          <ThumbsDown className="h-3 w-3 mr-2" />
                          Dismiss
                        </Button>
                        
                        {recommendation.actionRequired ? (
                          <Button
                            size="sm"
                            onClick={() => handleRecommendationAction(recommendation.id, 'accept')}
                            className="bg-black text-white hover:bg-gray-800 text-xs sm:text-sm px-4 py-2 h-auto flex-1"
                          >
                            <ArrowRight className="h-3 w-3 mr-2" />
                            Take Action
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRecommendationAction(recommendation.id, 'accept')}
                            className="bg-white text-black border-black hover:bg-black hover:text-white text-xs sm:text-sm px-4 py-2 h-auto flex-1"
                          >
                            <ThumbsUp className="h-3 w-3 mr-2" />
                            Helpful
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredRecommendations.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-black/40 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-xs sm:text-base font-semibold text-black mb-1 sm:mb-2">
                No recommendations available
              </h3>
              <p className="text-xs sm:text-sm text-black/60">
                AI is analyzing market data to provide personalized insights
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
