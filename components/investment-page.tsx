'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, DollarSign, Percent, ArrowUpRight,
  ArrowDownRight, PieChart, BarChart, Wallet,
  Globe, Shield, AlertCircle, Info, Target,
  Clock, Filter, Brain, Loader2, RefreshCcw,
  Building2, Briefcase, ChartBar, Menu, X,
  LucideIcon, Lock, CheckCircle, AlertTriangle,
  Home, Activity, Users, Settings
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { useFinance } from '@/contexts/FinanceContext'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import {
  Card, CardContent, CardHeader,
  CardTitle, CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMarketData } from '@/hooks/useMarketData';
import { useAuth } from '@/contexts/AuthContext';
import { MarketQuote } from '@/types/market';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';
import { LayoutWrapper } from '@/components/ui/layout-wrapper';
import { DepositModal } from '@/components/deposit-modal';
import { CollectiveCapitalCircles } from '@/components/collective-capital/CollectiveCapitalCircles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { z } from "zod"
import Link from 'next/link'
import { BarChart2, CreditCard } from 'lucide-react'
import { SectionFooter } from '@/components/ui/section-footer'
import { useTheme } from '@/contexts/ThemeContext'

interface Investment {
  id: string
  name: string
  return: number
  risk: 'Low' | 'Moderate' | 'High'
  description: string
  minInvestment: number
  popularity: number
  volatility: string
  holdings: string[]
  performance: Array<{
    period: string
    value: number
  }>
}

interface MLPrediction {
  assetClass: string
  predictedReturn: number
  confidence: number
  timeframe: string
}

interface Startup {
  id: string
  companyName: string
  companyType: string
  description: string
  registrationNumber: string
  incorporationDate: string
  jurisdiction: string
  valuation: number
  annualRevenue: number
  profitMargin: number
  availablePercentage: number
  missionStatement: string
  targetMarket: string
  competitiveAdvantage: string
  growthStrategy: string
  shareType: string
  sharesAvailable: number
  pricePerShare: number
  fundraisingGoal: number
  fundUse: string
  progress: number
  videoUrl?: string
  risks: string[]
  testimonials: Array<{
    name: string
    role: string
    comment: string
  }>
}

// Mock performance data for demonstration
const mockPerformanceData: Array<{ month: string; value: number; profit: number }> = [
  { month: 'Jan', value: 10000, profit: 0 },
  { month: 'Feb', value: 10500, profit: 500 },
  { month: 'Mar', value: 10200, profit: -300 },
  { month: 'Apr', value: 11000, profit: 800 },
  { month: 'May', value: 11800, profit: 800 },
  { month: 'Jun', value: 12500, profit: 700 }
]

const investmentCategories: InvestmentCategory[] = [
  {
    id: 'private-equity',
    title: 'Private Equity',
    icon: Briefcase,
    return: 18.5,
    risk: 'High',
    minInvestment: 10000,
    description: 'High-growth opportunities in private companies',
    features: ['Direct ownership', 'High potential returns', 'Long-term growth']
  },
  {
    id: 'real-estate',
    title: 'Real Estate',
    icon: Building2,
    return: 12.3,
    risk: 'Moderate',
    minInvestment: 1000,
    description: 'Stable returns from property investments',
    features: ['Rental income', 'Property appreciation', 'Tax benefits']
  },
  {
    id: 'bonds',
    title: 'Fixed Income',
    icon: Shield,
    return: 5.8,
    risk: 'Low',
    minInvestment: 100,
    description: 'Secure fixed-income investments',
    features: ['Regular interest payments', 'Capital preservation', 'Government backed']
  },
  {
    id: 'etfs',
    title: 'ETFs',
    icon: ChartBar,
    return: 9.8,
    risk: 'Low',
    minInvestment: 50,
    description: 'Diversified market exposure',
    features: ['Low fees', 'High liquidity', 'Broad diversification']
  },
  {
    id: 'venture-capital',
    title: 'Venture Capital',
    icon: Brain,
    return: 25.5,
    risk: 'Very High',
    minInvestment: 25000,
    description: 'Innovative startup investments',
    features: ['Early-stage companies', 'High growth potential', 'Tech focus']
  },
  {
    id: 'crypto',
    title: 'Cryptocurrency',
    icon: Globe,
    return: 32.5,
    risk: 'Very High',
    minInvestment: 5,
    description: 'Digital asset investments',
    features: ['24/7 trading', 'High volatility', 'Blockchain technology']
  }
]

interface InvestmentCategory {
  id: string
  title: string
  icon: LucideIcon
  return: number
  risk: 'Low' | 'Moderate' | 'High' | 'Very High'
  minInvestment: number
  description: string
  features: string[]
}

// Investment validation schema
const investmentSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter a valid amount"),
  riskTolerance: z.number().min(0).max(100),
  strategy: z.string().min(1, "Please select an investment strategy"),
  autoInvest: z.boolean(),
  autoInvestFrequency: z.string().optional(),
})

// Startup investment validation schema
const startupInvestmentSchema = z.object({
  shares: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter a valid number of shares"),
})

export function InvestmentPage() {
  const { theme } = useTheme()
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentCategory | null>(null)
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [investmentAmount, setInvestmentAmount] = useState<string>('')
  const [riskTolerance, setRiskTolerance] = useState(50)
  const [autoInvest, setAutoInvest] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'return' | 'risk' | 'popularity'>('return')
  const [filterRisk, setFilterRisk] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mlPredictions, setMLPredictions] = useState<MLPrediction | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<InvestmentCategory | null>(null)
  const [marketData, setMarketData] = useState<MarketQuote | null>(null);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
  const [showStartupModal, setShowStartupModal] = useState(false)
  const [startupView, setStartupView] = useState<'list' | 'detail'>('list')
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [securityChecks, setSecurityChecks] = useState({
    isEmailVerified: false,
    isIdentityVerified: false,
    isInvestorVerified: false,
  })
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [showQuickNav, setShowQuickNav] = useState(false)
  // Move startup-related state to the top to avoid conditional hooks
  const [startups, setStartups] = useState<Startup[]>([])
  const [loadingStartups, setLoadingStartups] = useState(false)
  // Investment data state
  const [investmentSummary, setInvestmentSummary] = useState<any>(null)
  const [performanceSummary, setPerformanceSummary] = useState<any>(null)
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [loadingInvestmentData, setLoadingInvestmentData] = useState(false)
  const [performanceData, setPerformanceData] = useState<Array<{ month: string; value: number; profit: number }>>([])

  const router = useRouter()
  const { addToast } = useToast()

  // Load investment data from API
  useEffect(() => {
    const loadInvestmentData = async () => {
      try {
        setLoadingInvestmentData(true)
        
        // Fetch investment data in parallel
        const [summaryResponse, performanceResponse, portfoliosResponse] = await Promise.all([
          apiClient.getInvestmentSummary(),
          apiClient.getPerformanceSummary('6M'),
          apiClient.getPortfolios()
        ])

        if (summaryResponse.data) {
          setInvestmentSummary(summaryResponse.data)
        }

        if (performanceResponse.data) {
          setPerformanceSummary(performanceResponse.data)

          // Transform performance data for chart
          if (performanceResponse.data.historical_performance && performanceResponse.data.historical_performance.length > 0) {
            const chartData = performanceResponse.data.historical_performance.map((item: any) => ({
              month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
              value: item.portfolio_value || 0,
              profit: item.profit_loss || 0
            }))
            setPerformanceData(chartData)
          } else {
            // Use mock data as fallback
            setPerformanceData(mockPerformanceData)
          }
        } else {
          // Use mock data when no API response
          setPerformanceData(mockPerformanceData)
          setPerformanceSummary({
            total_return_amount: 2500,
            total_return_percentage: 25.0,
            period_return_percentage: 8.5
          })
        }

        if (portfoliosResponse.data) {
          setPortfolios(portfoliosResponse.data)
        }

      } catch (error) {
        console.error('Error loading investment data:', error)

        // Use mock data as fallback when API fails
        setPerformanceData(mockPerformanceData)
        setPerformanceSummary({
          total_return_amount: 2500,
          total_return_percentage: 25.0,
          period_return_percentage: 8.5
        })

        addToast({
          title: 'Error',
          description: 'Failed to load investment data, showing demo data',
          variant: 'destructive'
        })
      } finally {
        setLoadingInvestmentData(false)
      }
    }

    loadInvestmentData()
  }, [addToast])

  // Use the finance context with proper error handling
  const financeContext = useFinance();
  const balance = financeContext?.balance || 25000; // Default investment balance
  const depositFunds = financeContext?.depositFunds;
  const withdrawFunds = financeContext?.withdrawFunds;

  const { user, loading } = useAuth()
  const { fetchStockQuote, isLoading: marketDataLoading } = useMarketData()

  // Redirect if not authenticated (unless bypass is enabled)
  useEffect(() => {
    // Check if we should bypass auth in development mode
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    if (bypassAuth && process.env.NODE_ENV === 'development') {
      console.log('Auth bypass enabled in development mode for investment page');
      return;
    }

    if (!user && !loading) {
      router.push('/signin')
    }
  }, [user, loading, router])

  // Security check simulation
  useEffect(() => {
    // Check if we should bypass auth in development mode
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    if (bypassAuth && process.env.NODE_ENV === 'development') {
      // In development mode, automatically set security checks to true
      setSecurityChecks({
        isEmailVerified: true,
        isIdentityVerified: true,
        isInvestorVerified: true,
      });
      return;
    }

    if (user) {
      // Simulate security checks
      setTimeout(() => {
        setSecurityChecks({
          isEmailVerified: true,
          isIdentityVerified: true,
          isInvestorVerified: true,
        })
      }, 1000)
    }
  }, [user])

  const validateInvestment = (data: any) => {
    try {
      investmentSchema.parse(data)
      setFormErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const fieldName = err.path[0]
          if (typeof fieldName === 'string') {
            newErrors[fieldName] = err.message
          }
        })
        setFormErrors(newErrors)
      }
      return false
    }
  }

  const validateStartupInvestment = (data: any) => {
    try {
      startupInvestmentSchema.parse(data)
      setFormErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const fieldName = err.path[0]
          if (typeof fieldName === 'string') {
            newErrors[fieldName] = err.message
          }
        })
        setFormErrors(newErrors)
      }
      return false
    }
  }

  const handleStockSearch = useCallback(async (symbol: string) => {
    try {
      const quote = await fetchStockQuote(symbol)

      if (quote) {
        // Ensure the quote has all required MarketQuote properties
        const completeQuote: MarketQuote = {
          symbol: quote.symbol,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume || 1000000, // Default volume if not provided
          marketCap: quote.marketCap || 0,
          high: quote.price * 1.05, // Mock high price
          low: quote.price * 0.95,  // Mock low price
          open: quote.price * 0.98, // Mock open price
          close: quote.price,       // Use current price as close
          timestamp: new Date(),    // Current timestamp
        }
        setMarketData(completeQuote)
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
      addToast({
        title: "Error",
        description: "Failed to fetch market data. Please try again later.",
        variant: "destructive",
      })
    }
  }, [fetchStockQuote, addToast])

  // Quick navigation sections
  const quickNavSections = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'startups', label: 'Startups', icon: Building2 },
    { id: 'collective', label: 'Circles', icon: Users },
  ]

  const scrollToSection = (sectionId: string) => {
    console.log('Scrolling to section:', sectionId) // Debug log
    setActiveSection(sectionId)
    setShowQuickNav(false)
    
    // Add a small delay to ensure the nav closes first
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      console.log('Found element:', element) // Debug log
      
      if (element) {
        // Get sticky header height to offset scroll position
        const stickyHeader = document.querySelector('.sticky')
        const headerHeight = stickyHeader ? stickyHeader.getBoundingClientRect().height : 0
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerHeight - 16 // 16px additional spacing

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
        
        // Alternative method with manual calculation
        setTimeout(() => {
          const rect = element.getBoundingClientRect()
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const elementTop = rect.top + scrollTop
          const headerOffset = 80 // Fixed offset for header
          
          window.scrollTo({
            top: elementTop - headerOffset,
            behavior: 'smooth'
          })
        }, 50)
      } else {
        console.error('Element not found:', sectionId)
      }
    }, 150)
  }

  // Add scroll listener to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = quickNavSections.map(section => section.id)
      const stickyHeader = document.querySelector('.sticky')
      const headerHeight = stickyHeader ? stickyHeader.getBoundingClientRect().height : 0
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section) {
          const rect = section.getBoundingClientRect()
          if (rect.top <= headerHeight + 50) { // 50px threshold
            setActiveSection(sections[i])
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Call once to set initial active section

    return () => window.removeEventListener('scroll', handleScroll)
  }, [quickNavSections])

  // Load startup data from API - moved before conditional return to avoid hooks violation
  useEffect(() => {
    const loadStartups = async () => {
      try {
        setLoadingStartups(true)
        // TODO: Replace with actual API call when startup endpoints are available
        // const response = await apiClient.getStartups()
        // setStartups(response.data || [])
        setStartups([]) // Empty for now until API is implemented
      } catch (error) {
        console.error('Failed to load startups:', error)
        addToast({
          title: 'Error',
          description: 'Failed to load startup investments',
          variant: 'destructive'
        })
      } finally {
        setLoadingStartups(false)
      }
    }

    loadStartups()
  }, [addToast])

  // Show security verification first
  if (!securityChecks.isEmailVerified || !securityChecks.isIdentityVerified || !securityChecks.isInvestorVerified) {
    return (
      <div className="min-h-screen bg-background py-4 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="bg-card border-border">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center text-foreground text-sm">
                <Lock className="w-4 h-4 mr-2" />
                Security Verification Required
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Please complete the verification process to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <div className="flex items-center space-x-2">
                {securityChecks.isEmailVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-foreground text-xs">Email Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                {securityChecks.isIdentityVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-foreground text-xs">Identity Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                {securityChecks.isInvestorVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-foreground text-xs">Investor Verification</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <LayoutWrapper className="min-h-screen-mobile bg-background">
      {/* Sticky Quick Navigation - Mobile First */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="flex items-center justify-between p-3 sm:p-4">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground">Investments</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickNav(!showQuickNav)}
            className="p-2 h-auto btn-mobile"
          >
            {showQuickNav ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
            
            <AnimatePresence>
              {showQuickNav && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border bg-background"
                >
                  <div className="grid grid-cols-5 gap-1 p-2">
                    {quickNavSections.map((section) => (
                      <Button
                        key={section.id}
                        variant={activeSection === section.id ? "default" : "ghost"}
                        size="sm"
                        onClick={() => scrollToSection(section.id)}
                        className={`flex flex-col items-center gap-1 h-auto py-2 px-1 text-xs ${
                          activeSection === section.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-foreground hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        <section.icon className="h-3 w-3" />
                        <span className="text-xs sm:text-sm">{section.label}</span>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Spacer to prevent sticky header overlap */}
          <div className="h-4"></div>

          {/* Portfolio Overview Section - Mobile Optimized */}
          <section id="overview" className="p-3 sm:p-4 md:p-6 bg-primary text-primary-foreground">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div>
                  <h2 className="text-sm sm:text-base md:text-lg font-bold">Portfolio Overview</h2>
                  <p className="text-xs sm:text-sm text-primary-foreground/60">AI-Powered Management</p>
                </div>
                <div className="flex gap-2 sm:gap-3">

                  <Button
                    size="sm"
                    onClick={() => router.push('/startupregistration')}
                    variant="outline"
                    className="border-primary-foreground/50 text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary text-xs sm:text-sm px-3 py-2 h-auto btn-mobile flex-1 sm:flex-none"
                  >
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Register
                  </Button>
                </div>
              </div>

              {/* Key Metrics - Compact Grid */}
              <div className="grid grid-cols-3 gap-2">
                <Card className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                  <CardContent className="p-2">
                    <div className="text-xs sm:text-sm text-primary-foreground/60">Portfolio</div>
                    {loadingInvestmentData ? (
                      <div className="text-xs sm:text-base font-bold">Loading...</div>
                    ) : (
                      <div className="text-xs sm:text-base font-bold">
                        ${(investmentSummary?.total_portfolio_value || 0).toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center text-xs sm:text-sm text-green-400">
                      {loadingInvestmentData ? (
                        <span>--</span>
                      ) : (
                        <>
                          {(performanceSummary?.total_return_percentage || 0) >= 0 ? (
                            <ArrowUpRight className="h-2 w-2 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-2 w-2 mr-1" />
                          )}
                          {(performanceSummary?.total_return_percentage || 0) >= 0 ? '+' : ''}
                          {(performanceSummary?.total_return_percentage || 0).toFixed(1)}%
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                  <CardContent className="p-2">
                    <div className="text-xs sm:text-sm text-primary-foreground/60">Returns</div>
                    {loadingInvestmentData ? (
                      <div className="text-xs sm:text-base font-bold">Loading...</div>
                    ) : (
                      <div className="text-xs sm:text-base font-bold">
                        ${(performanceSummary?.total_return_amount || 0).toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center text-xs sm:text-sm text-green-400">
                      {loadingInvestmentData ? (
                        <span>--</span>
                      ) : (
                        <>
                          {(performanceSummary?.period_return_percentage || 0) >= 0 ? (
                            <ArrowUpRight className="h-2 w-2 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-2 w-2 mr-1" />
                          )}
                          {(performanceSummary?.period_return_percentage || 0) >= 0 ? '+' : ''}
                          {(performanceSummary?.period_return_percentage || 0).toFixed(1)}%
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                  <CardContent className="p-2">
                    <div className="text-xs sm:text-sm text-primary-foreground/60">AI Score</div>
                    {loadingInvestmentData ? (
                      <div className="text-xs sm:text-base font-bold">Loading...</div>
                    ) : (
                      <div className="text-xs sm:text-base font-bold">
                        {investmentSummary?.ai_optimization_score || 85}/100
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-primary-foreground/60">
                      {loadingInvestmentData ? '--' : (investmentSummary?.optimization_status || 'Optimized')}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Performance Chart Section - Mobile Optimized */}
          <section id="performance" className="p-3 sm:p-4 bg-background">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="p-3 sm:p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base md:text-lg text-foreground font-semibold">
                    Portfolio Performance
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    6M
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Track your investment growth over time
                </p>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                {loadingInvestmentData ? (
                  <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <p className="text-xs sm:text-sm text-muted-foreground">Loading performance data...</p>
                    </div>
                  </div>
                ) : performanceData.length === 0 ? (
                  <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="p-3 bg-muted/50 rounded-full">
                        <BarChart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">No Performance Data</p>
                        <p className="text-xs text-muted-foreground">
                          Start investing to see your portfolio performance
                        </p>
                      </div>

                    </div>
                  </div>
                ) : (
                  <>
                    {/* Recharts Performance Chart */}
                    <div className="h-[200px] sm:h-[250px] md:h-[300px] w-full bg-background/50 rounded-lg overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={performanceData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.3}
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--popover-foreground))',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                          formatter={(value: any, name: string) => [
                            `$${Number(value).toLocaleString()}`,
                            name === 'value' ? 'Portfolio Value' : 'Profit/Loss'
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* CSS Fallback Chart - Always Visible */}
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-end justify-between h-16 gap-1">
                        {performanceData.map((data, index) => {
                          const maxValue = Math.max(...performanceData.map(d => d.value))
                          const height = (data.value / maxValue) * 100
                          const isPositive = data.profit >= 0

                          return (
                            <div key={index} className="flex flex-col items-center flex-1">
                              <div
                                className={`w-full rounded-t transition-all duration-300 ${
                                  isPositive ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{ height: `${height}%` }}
                                title={`${data.month}: $${data.value.toLocaleString()}`}
                              />
                              <span className="text-xs text-muted-foreground mt-1">
                                {data.month}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span>Portfolio Growth</span>
                        <span className="text-primary font-medium">
                          {performanceData.length > 1 ? (
                            ((performanceData[performanceData.length - 1].value - performanceData[0].value) / performanceData[0].value * 100).toFixed(1)
                          ) : 0}% ↗
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Performance Summary Cards - Mobile Optimized */}
                {!loadingInvestmentData && performanceData.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total Return</p>
                      <p className="text-sm sm:text-base font-semibold text-foreground">
                        ${(performanceSummary?.total_return_amount || 0).toLocaleString()}
                      </p>
                      <p className={`text-xs ${
                        (performanceSummary?.total_return_percentage || 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {(performanceSummary?.total_return_percentage || 0) >= 0 ? '+' : ''}
                        {(performanceSummary?.total_return_percentage || 0).toFixed(1)}%
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Best Month</p>
                      <p className="text-sm sm:text-base font-semibold text-green-600">
                        +{Math.max(...performanceData.map(d => d.profit)).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 col-span-2 sm:col-span-1">
                      <p className="text-xs text-muted-foreground">Growth</p>
                      <p className="text-sm sm:text-base font-semibold text-foreground">
                        {performanceData.length > 1 ? (
                          ((performanceData[performanceData.length - 1].value - performanceData[0].value) / performanceData[0].value * 100).toFixed(1)
                        ) : 0}%
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Investment Categories Section */}
          <section id="investments" className="p-3 bg-background">
            <div className="mb-3">
              <h3 className="text-xs sm:text-base font-bold text-foreground mb-1">Investment Options</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Diversified portfolio opportunities</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {investmentCategories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow cursor-pointer bg-card border-border"
                  onClick={() => {
                    // Navigate to opportunities page for specific categories
                    if (['private-equity', 'real-estate', 'bonds'].includes(category.id)) {
                      const categoryParam = category.id === 'bonds' ? 'fixed-income' : category.id
                      router.push(`/investment-opportunities?category=${categoryParam}`)
                    } else {
                      // Keep existing modal behavior for other categories
                      setSelectedInvestment(category)
                      setShowInvestModal(true)
                    }
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <category.icon className="h-3 w-3 text-foreground" />
                        <span className="text-xs sm:text-sm font-medium text-foreground">{category.title}</span>
                      </div>
                      <Badge variant="outline" className="border-border text-foreground text-xs sm:text-sm px-1 py-0">
                        {category.risk}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Return</span>
                        <span className="text-xs sm:text-sm font-bold text-foreground">{category.return}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Min</span>
                        <span className="text-xs sm:text-sm text-foreground">${category.minInvestment.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Startup Investments Section */}
          <section id="startups" className="p-3 bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs sm:text-base font-bold text-foreground">Startup Investments</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Early-stage opportunities</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm px-2 py-1 h-auto"
              >
                <RefreshCcw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>

              <div className="grid grid-cols-1 gap-3">
                {loadingStartups ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : startups.length > 0 ? (
                  startups.map((startup) => (
                    <Card key={startup.id} className="bg-card border-border">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-xs sm:text-base font-medium text-foreground">{startup.companyName}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{startup.companyType}</p>
                          </div>
                          <Badge variant="outline" className="border-border text-foreground text-xs sm:text-sm">
                            {startup.progress}% funded
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <span className="text-xs sm:text-sm text-muted-foreground">Valuation</span>
                            <p className="text-xs sm:text-sm font-medium text-foreground">${(startup.valuation / 1000000).toFixed(1)}M</p>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm text-muted-foreground">Min Investment</span>
                            <p className="text-xs sm:text-sm font-medium text-foreground">${startup.pricePerShare}</p>
                          </div>
                        </div>
                        
                        <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${startup.progress}%` }}
                          />
                        </div>
                        
                        <Button
                          size="sm"
                          className="w-full text-xs sm:text-sm py-1 h-auto"
                          onClick={() => setShowStartupModal(true)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="p-6 text-center">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="text-sm font-medium text-foreground mb-2">No Startups Available</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Check back later for new startup investment opportunities.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/startupregistration')}
                        className="text-xs"
                      >
                        Register Your Startup
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
          </section>

          {/* Collective Capital Circles Section */}
          <section id="collective" className="p-3 bg-background">
            <div className="mb-3">
              <h3 className="text-xs sm:text-base font-bold text-foreground">Collective Circles</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Join investment communities</p>
            </div>
            <CollectiveCapitalCircles />
          </section>



          {/* Startup Investment Modal */}
          <Dialog open={showStartupModal} onOpenChange={setShowStartupModal}>
            <DialogContent className="sm:max-w-[90vw] max-w-[350px] bg-background border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground text-sm">Invest in {selectedStartup?.companyName}</DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Enter the number of shares you would like to purchase
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-3">
                <div className="space-y-2">
                  <Label className="text-foreground text-xs">Number of Shares</Label>
                  <Input
                    type="number"
                    placeholder="Enter number of shares"
                    min="1"
                    max={selectedStartup?.sharesAvailable}
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <Label className="text-foreground text-xs">Total Investment</Label>
                  <div className="text-sm font-bold text-foreground">
                    $0.00
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowStartupModal(false)}
                  className="text-xs px-3 py-1 h-auto"
                >
                  Cancel
                </Button>
                <Button className="text-xs px-3 py-1 h-auto">
                  Confirm Investment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <SectionFooter section="main" activePage="/investment" />

          {/* Deposit Modal */}
          <DepositModal
            open={isDepositModalOpen}
            onOpenChange={setIsDepositModalOpen}
          />
        </LayoutWrapper>
  )
}
