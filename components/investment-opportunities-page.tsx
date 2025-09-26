'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  MapPin,
  Star,
  Filter,
  Search,
  ChevronDown,
  Eye,
  Heart,
  Share2,
  Info
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { useToast } from '@/components/ui/use-toast'

// Define the valid category types
type InvestmentCategory = 'private-equity' | 'real-estate' | 'fixed-income'

// Define the opportunity type
interface InvestmentOpportunity {
  id: number
  name: string
  category: string
  description: string
  minInvestment: number
  targetReturn: string
  duration: string
  riskLevel: string
  location: string
  fundingGoal: number
  currentFunding: number
  investors: number
  rating: number
  founded: number
  employees: number
  revenue: string
  growth: string
  highlights: string[]
  image: string
}

// Mock data for investment opportunities
const investmentOpportunities: Record<InvestmentCategory, InvestmentOpportunity[]> = {
  'private-equity': [
    {
      id: 1,
      name: 'TechFlow Innovations',
      category: 'Technology',
      description: 'AI-powered logistics optimization platform serving Fortune 500 companies',
      minInvestment: 50000,
      targetReturn: '25-35%',
      duration: '3-5 years',
      riskLevel: 'Medium-High',
      location: 'San Francisco, CA',
      fundingGoal: 2500000,
      currentFunding: 1800000,
      investors: 47,
      rating: 4.8,
      founded: 2019,
      employees: 85,
      revenue: '$12M ARR',
      growth: '+180% YoY',
      highlights: ['Series B Ready', 'Profitable', 'Enterprise Clients'],
      image: '/api/placeholder/400/200'
    },
    {
      id: 2,
      name: 'GreenEnergy Solutions',
      category: 'Clean Energy',
      description: 'Solar panel manufacturing with proprietary efficiency technology',
      minInvestment: 25000,
      targetReturn: '18-28%',
      duration: '4-6 years',
      riskLevel: 'Medium',
      location: 'Austin, TX',
      fundingGoal: 5000000,
      currentFunding: 3200000,
      investors: 73,
      rating: 4.6,
      founded: 2018,
      employees: 120,
      revenue: '$8M ARR',
      growth: '+95% YoY',
      highlights: ['Government Contracts', 'Patent Portfolio', 'Scalable'],
      image: '/api/placeholder/400/200'
    }
  ],
  'real-estate': [
    {
      id: 3,
      name: 'Metropolitan Office Complex',
      category: 'Commercial Real Estate',
      description: 'Prime downtown office building with long-term corporate tenants',
      minInvestment: 100000,
      targetReturn: '12-16%',
      duration: '5-7 years',
      riskLevel: 'Low-Medium',
      location: 'Chicago, IL',
      fundingGoal: 15000000,
      currentFunding: 12500000,
      investors: 125,
      rating: 4.9,
      founded: 2023,
      employees: 15,
      revenue: '$2.8M Annual Rent',
      growth: '95% Occupancy',
      highlights: ['Prime Location', 'Stable Tenants', 'Appreciation Potential'],
      image: '/api/placeholder/400/200'
    },
    {
      id: 4,
      name: 'Luxury Residential Development',
      category: 'Residential Real Estate',
      description: 'High-end condominiums in emerging neighborhood with strong growth',
      minInvestment: 75000,
      targetReturn: '15-22%',
      duration: '3-4 years',
      riskLevel: 'Medium',
      location: 'Miami, FL',
      fundingGoal: 8500000,
      currentFunding: 6100000,
      investors: 89,
      rating: 4.7,
      founded: 2023,
      employees: 25,
      revenue: 'Pre-construction',
      growth: '40% Pre-sold',
      highlights: ['Waterfront Views', 'Luxury Amenities', 'Growing Area'],
      image: '/api/placeholder/400/200'
    }
  ],
  'fixed-income': [
    {
      id: 5,
      name: 'Corporate Bond Portfolio',
      category: 'Investment Grade Bonds',
      description: 'Diversified portfolio of A-rated corporate bonds from stable companies',
      minInvestment: 10000,
      targetReturn: '6-8%',
      duration: '2-3 years',
      riskLevel: 'Low',
      location: 'Diversified',
      fundingGoal: 25000000,
      currentFunding: 18750000,
      investors: 340,
      rating: 4.5,
      founded: 2023,
      employees: 8,
      revenue: 'Fixed Income',
      growth: 'Stable Returns',
      highlights: ['Investment Grade', 'Diversified', 'Stable Returns'],
      image: '/api/placeholder/400/200'
    },
    {
      id: 6,
      name: 'Municipal Infrastructure Bonds',
      category: 'Government Bonds',
      description: 'Tax-free municipal bonds funding critical infrastructure projects',
      minInvestment: 5000,
      targetReturn: '4-6%',
      duration: '5-10 years',
      riskLevel: 'Very Low',
      location: 'Various States',
      fundingGoal: 50000000,
      currentFunding: 35000000,
      investors: 520,
      rating: 4.8,
      founded: 2023,
      employees: 12,
      revenue: 'Tax-Free Income',
      growth: 'Government Backed',
      highlights: ['Tax-Free', 'Government Backed', 'Infrastructure Focus'],
      image: '/api/placeholder/400/200'
    }
  ]
}

const categoryTitles: Record<InvestmentCategory, string> = {
  'private-equity': 'Private Equity Opportunities',
  'real-estate': 'Real Estate Investments',
  'fixed-income': 'Fixed Income Securities'
}

const categoryDescriptions: Record<InvestmentCategory, string> = {
  'private-equity': 'Invest in high-growth private companies with significant return potential',
  'real-estate': 'Diversify your portfolio with commercial and residential real estate',
  'fixed-income': 'Generate steady income with bonds and fixed-return securities'
}

export function InvestmentOpportunitiesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams?.get('category') || 'private-equity'
  const category = (categoryParam in investmentOpportunities ? categoryParam : 'private-equity') as InvestmentCategory
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [filterRisk, setFilterRisk] = useState('all')
  const [selectedOpportunity, setSelectedOpportunity] = useState<InvestmentOpportunity | null>(null)
  const [favorites, setFavorites] = useState(new Set<number>())
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [investmentAmount, setInvestmentAmount] = useState<string>('')
  const [investmentOpportunity, setInvestmentOpportunity] = useState<InvestmentOpportunity | null>(null)
  const [dialogMode, setDialogMode] = useState<'details' | 'invest' | null>(null)

  const opportunities = investmentOpportunities[category] || []

  // Filter and sort opportunities
  const filteredOpportunities = opportunities
    .filter(opp => {
      const matchesSearch = opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           opp.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRisk = filterRisk === 'all' || opp.riskLevel.toLowerCase().includes(filterRisk.toLowerCase())
      return matchesSearch && matchesRisk
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'return':
          return parseFloat(b.targetReturn.split('-')[1]) - parseFloat(a.targetReturn.split('-')[1])
        case 'minInvestment':
          return a.minInvestment - b.minInvestment
        case 'funding':
          return (b.currentFunding / b.fundingGoal) - (a.currentFunding / a.fundingGoal)
        default:
          return 0
      }
    })

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'very low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'low-medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium-high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high':
        return 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <React.Fragment>
      <LayoutWrapper className="min-h-screen bg-background">
          {/* Header */}
          <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">
                    {categoryTitles[category]}
                  </h1>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {categoryDescriptions[category]}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {filteredOpportunities.length} Opportunities
              </Badge>
            </div>
          </div>

          {/* Spacer to prevent header overlap */}
          <div className="h-4"></div>

          {/* Category Switcher */}
          <div className="p-4 pb-0">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Object.entries(categoryTitles).map(([key, title]) => (
                <Button
                  key={key}
                  variant={category === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => router.push(`/investment-opportunities?category=${key}`)}
                  className="whitespace-nowrap"
                >
                  {title}
                </Button>
              ))}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="return">Target Return</SelectItem>
                    <SelectItem value="minInvestment">Min Investment</SelectItem>
                    <SelectItem value="funding">Funding Progress</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="very low">Very Low</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredOpportunities.map((opportunity, index) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                      <div className="relative">
                        <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <Building2 className="h-16 w-16 text-primary/30" />
                        </div>
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                            onClick={() => toggleFavorite(opportunity.id)}
                          >
                            <Heart 
                              className={`h-4 w-4 ${
                                favorites.has(opportunity.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-muted-foreground'
                              }`} 
                            />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                          >
                            <Share2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge className={getRiskColor(opportunity.riskLevel)}>
                            {opportunity.riskLevel} Risk
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-bold text-foreground line-clamp-1">
                                {opportunity.name}
                              </h3>
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{opportunity.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {opportunity.category}
                            </p>
                            <p className="text-sm text-foreground line-clamp-2">
                              {opportunity.description}
                            </p>
                          </div>

                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                            <div>
                              <p className="text-xs text-muted-foreground">Target Return</p>
                              <p className="text-sm font-bold text-green-600">{opportunity.targetReturn}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Min Investment</p>
                              <p className="text-sm font-bold">{formatCurrency(opportunity.minInvestment)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="text-sm font-medium">{opportunity.duration}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Investors</p>
                              <p className="text-sm font-medium">{opportunity.investors}</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                              <span>Funding Progress</span>
                              <span>{Math.round((opportunity.currentFunding / opportunity.fundingGoal) * 100)}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(opportunity.currentFunding / opportunity.fundingGoal) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>{formatCurrency(opportunity.currentFunding)} raised</span>
                              <span>{formatCurrency(opportunity.fundingGoal)} goal</span>
                            </div>
                          </div>

                          {/* Highlights */}
                          <div className="flex flex-wrap gap-2">
                            {opportunity.highlights.map((highlight, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              className="flex-1"
                              onClick={() => {
                                setSelectedOpportunity(opportunity)
                                setDialogMode('details')
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="icon">
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredOpportunities.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No opportunities found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Detailed Opportunity Modal */}
          <Dialog
          open={dialogMode === 'details'}
          onOpenChange={(open) => {
            if (!open) {
              setDialogMode(null)
              setSelectedOpportunity(null)
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedOpportunity && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {selectedOpportunity.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Header Image and Key Info */}
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                      <Building2 className="h-20 w-20 text-primary/30" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className={getRiskColor(selectedOpportunity.riskLevel)}>
                        {selectedOpportunity.riskLevel} Risk
                      </Badge>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Target Return</p>
                      <p className="text-lg font-bold text-green-600">{selectedOpportunity.targetReturn}</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Min Investment</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedOpportunity.minInvestment)}</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-lg font-bold">{selectedOpportunity.duration}</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <p className="text-lg font-bold">{selectedOpportunity.rating}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tabs for detailed information */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="financials">Financials</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">About</h3>
                        <p className="text-muted-foreground">{selectedOpportunity.description}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Key Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {selectedOpportunity.highlights.map((highlight, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Company Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Founded</p>
                            <p className="font-medium">{selectedOpportunity.founded}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Employees</p>
                            <p className="font-medium">{selectedOpportunity.employees}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">{selectedOpportunity.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Category</p>
                            <p className="font-medium">{selectedOpportunity.category}</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="financials" className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="p-4 bg-secondary/30 rounded-lg">
                              <p className="text-sm text-muted-foreground">Annual Revenue</p>
                              <p className="text-xl font-bold">{selectedOpportunity.revenue}</p>
                            </div>
                            <div className="p-4 bg-secondary/30 rounded-lg">
                              <p className="text-sm text-muted-foreground">Growth Rate</p>
                              <p className="text-xl font-bold text-green-600">{selectedOpportunity.growth}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="p-4 bg-secondary/30 rounded-lg">
                              <p className="text-sm text-muted-foreground">Funding Goal</p>
                              <p className="text-xl font-bold">{formatCurrency(selectedOpportunity.fundingGoal)}</p>
                            </div>
                            <div className="p-4 bg-secondary/30 rounded-lg">
                              <p className="text-sm text-muted-foreground">Current Funding</p>
                              <p className="text-xl font-bold">{formatCurrency(selectedOpportunity.currentFunding)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Funding Progress */}
                        <div className="mt-6">
                          <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>Funding Progress</span>
                            <span>{Math.round((selectedOpportunity.currentFunding / selectedOpportunity.fundingGoal) * 100)}% Complete</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-3">
                            <div
                              className="bg-primary h-3 rounded-full transition-all duration-300"
                              style={{ width: `${(selectedOpportunity.currentFunding / selectedOpportunity.fundingGoal) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Leadership Team</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-secondary/30 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">John Smith</p>
                                <p className="text-sm text-muted-foreground">CEO & Founder</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">15+ years in technology leadership</p>
                          </div>
                          <div className="p-4 bg-secondary/30 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Sarah Johnson</p>
                                <p className="text-sm text-muted-foreground">CTO</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">Former Google engineer, AI specialist</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Investment Documents</h3>
                        <div className="space-y-3">
                          {[
                            'Business Plan & Strategy',
                            'Financial Statements (3 years)',
                            'Market Analysis Report',
                            'Legal Documentation',
                            'Due Diligence Package'
                          ].map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                              <span className="text-sm">{doc}</span>
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Investment Actions */}
                  <div className="flex gap-4 pt-4 border-t">
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={() => {
                        console.log('Invest Now clicked!', selectedOpportunity?.name)
                        // Store the investment opportunity data
                        setInvestmentOpportunity(selectedOpportunity)
                        // Switch to invest mode
                        setDialogMode('invest')
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Invest Now
                    </Button>
                    <Button variant="outline" size="lg">
                      <Heart className="h-4 w-4 mr-2" />
                      Save for Later
                    </Button>
                    <Button variant="outline" size="lg">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Investment Modal - Separate from opportunity details */}
        <Dialog
          open={dialogMode === 'invest'}
          onOpenChange={(open) => {
            console.log('Investment Modal state changing to:', open)
            if (!open) {
              setDialogMode(null)
              setInvestmentOpportunity(null)
              setInvestmentAmount('')
            }
          }}
        >
          <DialogContent className="sm:max-w-[90vw] max-w-[350px] bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground text-sm">
                Invest in {investmentOpportunity?.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Enter the amount you would like to invest
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-2">
                <Label className="text-foreground text-xs">Investment Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              {investmentOpportunity && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum Investment:</span>
                    <span className="font-medium">${investmentOpportunity.minInvestment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Return:</span>
                    <span className="font-medium text-green-600">{investmentOpportunity.targetReturn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Period:</span>
                    <span className="font-medium">{investmentOpportunity.duration}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('Cancel clicked')
                  setDialogMode(null)
                  setInvestmentOpportunity(null)
                  setInvestmentAmount('')
                }}
                className="flex-1 text-xs px-3 py-1 h-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  console.log('Investment confirmed')
                  toast({
                    title: "Investment Successful",
                    description: `Successfully invested $${investmentAmount} in ${investmentOpportunity?.name}`,
                  })
                  setDialogMode(null)
                  setInvestmentAmount('')
                  setInvestmentOpportunity(null)
                }}
                disabled={!investmentAmount || Number(investmentAmount) < (investmentOpportunity?.minInvestment || 0)}
                className="flex-1 text-xs px-3 py-1 h-auto"
              >
                Invest Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </LayoutWrapper>
    </React.Fragment>
  )
}
