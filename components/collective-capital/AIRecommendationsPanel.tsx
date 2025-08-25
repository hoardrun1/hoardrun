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
        return <Target className="h-5 w-5 text-green-600" />
      case 'RISK_WARNING':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'PORTFOLIO_OPTIMIZATION':
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      case 'MARKET_INSIGHT':
        return <Brain className="h-5 w-5 text-purple-600" />
      default:
        return <Sparkles className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Investment Insights
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized recommendations powered by advanced market analysis
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Zap className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {recommendations.filter(r => r.type === 'INVESTMENT_OPPORTUNITY').length}
            </div>
            <div className="text-xs text-gray-500">Opportunities</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {recommendations.filter(r => r.type === 'RISK_WARNING').length}
            </div>
            <div className="text-xs text-gray-500">Risk Alerts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {recommendations.filter(r => r.type === 'MARKET_INSIGHT').length}
            </div>
            <div className="text-xs text-gray-500">Market Insights</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {Math.round(recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length)}%
            </div>
            <div className="text-xs text-gray-500">Avg Confidence</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
          <TabsTrigger value="opportunities">
            Opportunities ({recommendations.filter(r => r.type === 'INVESTMENT_OPPORTUNITY').length})
          </TabsTrigger>
          <TabsTrigger value="warnings">
            Warnings ({recommendations.filter(r => r.type === 'RISK_WARNING').length})
          </TabsTrigger>
          <TabsTrigger value="insights">
            Insights ({recommendations.filter(r => r.type === 'MARKET_INSIGHT' || r.type === 'PORTFOLIO_OPTIMIZATION').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={cn(
                "hover:shadow-lg transition-all duration-300",
                recommendation.priority === 'URGENT' && "border-red-200 dark:border-red-800",
                recommendation.priority === 'HIGH' && "border-orange-200 dark:border-orange-800"
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getTypeIcon(recommendation.type)}
                      <div>
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getPriorityColor(recommendation.priority))}
                          >
                            {recommendation.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {recommendation.category.replace('_', ' ')}
                          </Badge>
                          {recommendation.actionRequired && (
                            <Badge className="text-xs bg-blue-100 text-blue-800">
                              Action Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={cn("text-sm font-medium", getConfidenceColor(recommendation.confidence))}>
                        {recommendation.confidence}% confidence
                      </div>
                      <Progress 
                        value={recommendation.confidence} 
                        className="w-20 h-2 mt-1"
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {recommendation.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {new Date(recommendation.createdAt).toLocaleDateString()}
                      {recommendation.expiresAt && (
                        <span className="text-red-500">
                          • Expires {new Date(recommendation.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecommendationAction(recommendation.id, 'dismiss')}
                      >
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                      
                      {recommendation.actionRequired && (
                        <Button
                          size="sm"
                          onClick={() => handleRecommendationAction(recommendation.id, 'accept')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Take Action
                        </Button>
                      )}
                      
                      {!recommendation.actionRequired && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecommendationAction(recommendation.id, 'accept')}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Helpful
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredRecommendations.length === 0 && (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No recommendations available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI is analyzing market data to provide personalized insights
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
