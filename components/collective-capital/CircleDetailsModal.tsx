'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, TrendingUp, Shield, Globe, Clock, 
  Vote, DollarSign, Target, Calendar, 
  Activity, BarChart3, PieChart, ArrowRight,
  Crown, Star, Award, Zap, Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CollectiveCircle } from '@/types/collective-capital'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { useToast } from "@/components/ui/use-toast"

interface CircleDetailsModalProps {
  circle: CollectiveCircle
  open: boolean
  onOpenChange: (open: boolean) => void
  onJoin: () => void
}

export function CircleDetailsModal({ circle, open, onOpenChange, onJoin }: CircleDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [members, setMembers] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open && circle.id) {
      loadCircleDetails()
    }
  }, [open, circle.id])

  const loadCircleDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Replace with actual API calls when collective capital endpoints are available
      // For now, we'll simulate API calls that return empty data
      const response = await new Promise(resolve => 
        setTimeout(() => resolve({ data: [], success: true }), 500)
      );
      
      setMembers([])
      setInvestments([])
      setActivities([])
    } catch (err) {
      console.error('Error loading circle details:', err)
      setError('Failed to load circle details')
      toast({
        title: "Error",
        description: "Failed to load circle details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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

  const membershipProgress = (circle.currentMembers / circle.maxMembers) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {circle.name}
                <Badge className={cn("text-xs", getCategoryColor(circle.category))}>
                  {circle.category.replace('_', ' ')}
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-2">
                {circle.description}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                +{circle.averageReturn.toFixed(1)}% Returns
              </Badge>
              <Badge variant="outline">
                {circle.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 py-4">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{formatCurrency(circle.totalPoolValue)}</div>
              <div className="text-xs text-gray-500">Pool Value</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{circle.currentMembers}/{circle.maxMembers}</div>
              <div className="text-xs text-gray-500">Members</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">+{circle.averageReturn.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Avg Return</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{circle.riskScore}/100</div>
              <div className="text-xs text-gray-500">Risk Score</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Circle Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Voting Threshold</span>
                      <span className="font-medium">{circle.votingThreshold}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Proposal Duration</span>
                      <span className="font-medium">{circle.proposalDuration}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Min Contribution</span>
                      <span className="font-medium">{formatCurrency(circle.minimumContribution)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Auto Distribution</span>
                      <Badge variant={circle.autoDistribution ? "default" : "secondary"}>
                        {circle.autoDistribution ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Blockchain</span>
                      <Badge variant="outline">{circle.blockchainNetwork}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Returns</span>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(circle.totalReturns)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Return</span>
                      <span className="font-medium text-green-600">
                        +{circle.averageReturn.toFixed(1)}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Membership</span>
                        <span>{membershipProgress.toFixed(0)}% full</span>
                      </div>
                      <Progress value={membershipProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.length === 0 ? (
                      <div className="text-center py-4">
                        <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No recent activity</p>
                      </div>
                    ) : (
                      activities.slice(0, 3).map((activity: any) => (
                        <div key={activity.id} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div className="space-y-3">
                {members.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No members to display</p>
                  </div>
                ) : (
                  members.map((member: any) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {member.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {member.name}
                                {member.role === 'CREATOR' && <Crown className="h-4 w-4 text-yellow-500" />}
                                {member.role === 'ADMIN' && <Star className="h-4 w-4 text-blue-500" />}
                              </div>
                              <div className="text-sm text-gray-500">{member.role}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(member.contribution)}</div>
                            <div className="text-sm text-green-600">
                              +{formatCurrency(member.returns)} returns
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="investments" className="space-y-4">
              <div className="space-y-3">
                {investments.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No investments to display</p>
                  </div>
                ) : (
                  investments.map((investment: any) => (
                    <Card key={investment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{investment.name}</div>
                            <div className="text-sm text-gray-500">{investment.symbol}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(investment.amount)}</div>
                            <div className="text-sm text-green-600">
                              +{formatCurrency(investment.returns)} ({investment.percentage}%)
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No activity to display</p>
                  </div>
                ) : (
                  activities.map((activity: any) => (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={onJoin}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={circle.currentMembers >= circle.maxMembers}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            {circle.isPrivate ? 'Request to Join' : 'Join Circle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
