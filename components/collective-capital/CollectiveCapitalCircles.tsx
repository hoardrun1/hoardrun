'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, Search, Filter, TrendingUp, Shield, 
  Sparkles, Target, Globe, Lock, Crown, Star,
  ArrowRight, Eye, UserPlus, Vote, Coins
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { CollectiveCircle, CircleStats, CircleFilters } from '@/types/collective-capital'
import { CircleCard } from './CircleCard'
import { CreateCircleModal } from './CreateCircleModal'
import { CircleDetailsModal } from './CircleDetailsModal'
import { JoinRequestModal } from './JoinRequestModal'
import { CircleFiltersPanel } from './CircleFiltersPanel'
import { AIRecommendationsPanel } from './AIRecommendationsPanel'
import { LoyaltyDashboard } from './LoyaltyDashboard'

interface CollectiveCapitalCirclesProps {
  className?: string
}

export function CollectiveCapitalCircles({ className }: CollectiveCapitalCirclesProps) {
  const [circles, setCircles] = useState<CollectiveCircle[]>([])
  const [filteredCircles, setFilteredCircles] = useState<CollectiveCircle[]>([])
  const [selectedCircle, setSelectedCircle] = useState<CollectiveCircle | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<CircleFilters>({})
  const [activeTab, setActiveTab] = useState('discover')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<CircleStats | null>(null)
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  const { addToast } = useToast()

  useEffect(() => {
    loadCircles()
    loadStats()
  }, [])

  useEffect(() => {
    filterCircles()
  }, [circles, searchQuery, filters])

  const loadCircles = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - replace with actual API call
      const mockCircles: CollectiveCircle[] = [
        {
          id: '1',
          name: 'Green Tech Pioneers',
          description: 'Investing in sustainable technology and renewable energy companies',
          category: 'GREEN_TECH',
          createdBy: 'user1',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          isPrivate: false,
          maxMembers: 50,
          currentMembers: 23,
          totalPoolValue: 125000,
          minimumContribution: 50,
          status: 'ACTIVE',
          blockchainNetwork: 'ETHEREUM',
          votingThreshold: 60,
          proposalDuration: 72,
          autoDistribution: true,
          totalReturns: 18500,
          averageReturn: 14.8,
          riskScore: 65,
          aiRecommendations: [],
          members: [],
          investments: [],
          proposals: [],
          activities: []
        },
        {
          id: '2',
          name: 'Crypto Innovators',
          description: 'Focused on emerging cryptocurrencies and DeFi protocols',
          category: 'CRYPTO',
          createdBy: 'user2',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-22'),
          isPrivate: true,
          inviteCode: 'CRYPTO2024',
          maxMembers: 25,
          currentMembers: 18,
          totalPoolValue: 89000,
          minimumContribution: 10,
          status: 'ACTIVE',
          blockchainNetwork: 'POLYGON',
          votingThreshold: 70,
          proposalDuration: 48,
          autoDistribution: false,
          totalReturns: 22100,
          averageReturn: 24.8,
          riskScore: 85,
          aiRecommendations: [],
          members: [],
          investments: [],
          proposals: [],
          activities: []
        },
        {
          id: '3',
          name: 'AI & Robotics Future',
          description: 'Investing in artificial intelligence and robotics companies',
          category: 'AI_TECH',
          createdBy: 'user3',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-21'),
          isPrivate: false,
          maxMembers: 40,
          currentMembers: 31,
          totalPoolValue: 156000,
          minimumContribution: 25,
          status: 'ACTIVE',
          blockchainNetwork: 'ETHEREUM',
          votingThreshold: 65,
          proposalDuration: 96,
          autoDistribution: true,
          totalReturns: 31200,
          averageReturn: 20.0,
          riskScore: 70,
          aiRecommendations: [],
          members: [],
          investments: [],
          proposals: [],
          activities: []
        }
      ]
      
      setCircles(mockCircles)
    } catch (error) {
      console.error('Error loading circles:', error)
      addToast({
        title: "Error",
        description: "Failed to load investment circles",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Mock stats - replace with actual API call
      const mockStats: CircleStats = {
        totalCircles: 127,
        totalMembers: 2840,
        totalPoolValue: 12500000,
        averageReturn: 18.5,
        topPerformingCircle: circles[0],
        userCircles: 3,
        userTotalInvested: 15000,
        userTotalReturns: 2850
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const filterCircles = () => {
    let filtered = circles

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(circle =>
        circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        circle.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        circle.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(circle =>
        filters.category!.includes(circle.category)
      )
    }

    // Pool value filter
    if (filters.minPoolValue) {
      filtered = filtered.filter(circle => circle.totalPoolValue >= filters.minPoolValue!)
    }
    if (filters.maxPoolValue) {
      filtered = filtered.filter(circle => circle.totalPoolValue <= filters.maxPoolValue!)
    }

    // Member count filter
    if (filters.memberCount?.min) {
      filtered = filtered.filter(circle => circle.currentMembers >= filters.memberCount!.min!)
    }
    if (filters.memberCount?.max) {
      filtered = filtered.filter(circle => circle.currentMembers <= filters.memberCount!.max!)
    }

    // Returns filter
    if (filters.returns?.min) {
      filtered = filtered.filter(circle => circle.averageReturn >= filters.returns!.min!)
    }
    if (filters.returns?.max) {
      filtered = filtered.filter(circle => circle.averageReturn <= filters.returns!.max!)
    }

    setFilteredCircles(filtered)
  }

  const handleJoinCircle = (circle: CollectiveCircle) => {
    setSelectedCircle(circle)
    if (circle.isPrivate) {
      setShowJoinModal(true)
    } else {
      // Direct join for public circles
      joinCircle(circle.id)
    }
  }

  const joinCircle = async (circleId: string) => {
    try {
      // API call to join circle
      addToast({
        title: "Success",
        description: "Successfully joined the investment circle!",
      })
      loadCircles() // Refresh data
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to join circle",
        variant: "destructive"
      })
    }
  }

  const handleViewDetails = (circle: CollectiveCircle) => {
    setSelectedCircle(circle)
    setShowDetailsModal(true)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Collective Capital Circles
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Join forces with like-minded investors for better returns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Circle
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Circles</p>
                  <p className="text-2xl font-bold">{stats.totalCircles}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Pool Value</p>
                  <p className="text-2xl font-bold">${(stats.totalPoolValue / 1000000).toFixed(1)}M</p>
                </div>
                <Coins className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Returns</p>
                  <p className="text-2xl font-bold">{stats.averageReturn}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your Circles</p>
                  <p className="text-2xl font-bold">{stats.userCircles}</p>
                </div>
                <Crown className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search circles by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CircleFiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowFilters(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-circles">My Circles</TabsTrigger>
          <TabsTrigger value="ai-recommendations">AI Insights</TabsTrigger>
          <TabsTrigger value="loyalty">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCircles.map((circle) => (
                <CircleCard
                  key={circle.id}
                  circle={circle}
                  onJoin={() => handleJoinCircle(circle)}
                  onViewDetails={() => handleViewDetails(circle)}
                />
              ))}
            </div>
          )}
          
          {!isLoading && filteredCircles.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No circles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search or filters, or create a new circle
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create New Circle
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-circles">
          <div className="text-center py-12">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your Investment Circles</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your active circles and track performance
            </p>
          </div>
        </TabsContent>

        <TabsContent value="ai-recommendations">
          <AIRecommendationsPanel />
        </TabsContent>

        <TabsContent value="loyalty">
          <LoyaltyDashboard />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateCircleModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false)
          loadCircles()
        }}
      />

      {selectedCircle && (
        <>
          <CircleDetailsModal
            circle={selectedCircle}
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
            onJoin={() => handleJoinCircle(selectedCircle)}
          />

          <JoinRequestModal
            circle={selectedCircle}
            open={showJoinModal}
            onOpenChange={setShowJoinModal}
            onSuccess={() => {
              setShowJoinModal(false)
              loadCircles()
            }}
          />
        </>
      )}
    </div>
  )
}
