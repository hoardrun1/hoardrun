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
import { apiClient } from '@/lib/api-client'
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
      // TODO: Replace with actual API call when collective capital endpoints are available
      // const response = await apiClient.getCollectiveCircles()
      // setCircles(response.data || [])
      
      // For now, use empty array until API is implemented
      setCircles([])
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
      // TODO: Replace with actual API call when collective capital endpoints are available
      // const response = await apiClient.getCollectiveCircleStats()
      // setStats(response.data)
      
      // For now, use empty stats until API is implemented
      const emptyStats: CircleStats = {
        totalCircles: 0,
        totalMembers: 0,
        totalPoolValue: 0,
        averageReturn: 0,
        topPerformingCircle: undefined,
        userCircles: 0,
        userTotalInvested: 0,
        userTotalReturns: 0
      }
      setStats(emptyStats)
    } catch (error) {
      console.error('Error loading stats:', error)
      addToast({
        title: "Error",
        description: "Failed to load circle statistics",
        variant: "destructive"
      })
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
      // TODO: Replace with actual API call when collective capital endpoints are available
      // await apiClient.joinCollectiveCircle(circleId)
      
      addToast({
        title: "Success",
        description: "Successfully joined the investment circle!",
      })
      loadCircles() // Refresh data
    } catch (error) {
      console.error('Error joining circle:', error)
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1 sm:gap-4">
        <div>
          <h2 className="text-xs sm:text-base font-bold text-black flex items-center gap-1 sm:gap-3">
            <Users className="h-3 w-3 sm:h-8 sm:w-8 text-black" />
            Collective Capital Circles
          </h2>
          <p className="text-xs sm:text-sm text-black/60 mt-0.5 sm:mt-1">
            Join forces with like-minded investors for better returns
          </p>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 sm:gap-2 bg-white text-black border-black hover:bg-black hover:text-white text-xs sm:text-sm px-2 py-1.5 h-auto"
            >
              <Filter className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
              Filters
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="bg-black hover:bg-black/90 text-white flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1.5 h-auto"
            >
              <Plus className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
              Create Circle
            </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="bg-white border-black">
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-black/60">Total Circles</p>
                  <p className="text-xs sm:text-base font-bold text-black">{stats.totalCircles}</p>
                </div>
                <Globe className="h-3 w-3 sm:h-8 sm:w-8 text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-black">
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-black/60">Total Pool Value</p>
                  <p className="text-xs sm:text-base font-bold text-black">${(stats.totalPoolValue / 1000000).toFixed(1)}M</p>
                </div>
                <Coins className="h-3 w-3 sm:h-8 sm:w-8 text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-black">
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-black/60">Avg. Returns</p>
                  <p className="text-xs sm:text-base font-bold text-black">{stats.averageReturn}%</p>
                </div>
                <TrendingUp className="h-3 w-3 sm:h-8 sm:w-8 text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-black">
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-black/60">Your Circles</p>
                  <p className="text-xs sm:text-base font-bold text-black">{stats.userCircles}</p>
                </div>
                <Crown className="h-3 w-3 sm:h-8 sm:w-8 text-black" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-black/60" />
            <Input
              placeholder="Search circles by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 sm:pl-10 bg-white border-black text-black text-xs sm:text-sm py-2 sm:py-3 h-auto"
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
        <TabsList className="grid w-full grid-cols-4 bg-white border-black">
          <TabsTrigger value="discover" className="text-black data-[state=active]:bg-black data-[state=active]:text-white text-xs sm:text-sm">Discover</TabsTrigger>
          <TabsTrigger value="my-circles" className="text-black data-[state=active]:bg-black data-[state=active]:text-white text-xs sm:text-sm">My Circles</TabsTrigger>
          <TabsTrigger value="ai-recommendations" className="text-black data-[state=active]:bg-black data-[state=active]:text-white text-xs sm:text-sm">AI Insights</TabsTrigger>
          <TabsTrigger value="loyalty" className="text-black data-[state=active]:bg-black data-[state=active]:text-white text-xs sm:text-sm">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-3 sm:space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-white border-black">
                  <CardContent className="p-3 sm:p-6">
                    <div className="h-3 sm:h-4 bg-black/20 rounded w-3/4 mb-2 sm:mb-4"></div>
                    <div className="h-2 sm:h-3 bg-black/20 rounded w-full mb-1 sm:mb-2"></div>
                    <div className="h-2 sm:h-3 bg-black/20 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
            <div className="text-center py-6 sm:py-12">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2 sm:mb-4" />
              <h3 className="text-xs sm:text-base font-semibold text-foreground mb-1 sm:mb-2">
                No circles found
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
                Try adjusting your search or filters, or create a new circle
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                size="sm"
                className="bg-black text-white hover:bg-black/90 text-xs sm:text-sm"
              >
                Create New Circle
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-circles">
          <div className="text-center py-6 sm:py-12">
            <Crown className="h-8 w-8 sm:h-12 sm:w-12 text-black mx-auto mb-2 sm:mb-4" />
            <h3 className="text-xs sm:text-base font-semibold mb-1 sm:mb-2 text-black">Your Investment Circles</h3>
            <p className="text-xs sm:text-sm text-black/60">
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
