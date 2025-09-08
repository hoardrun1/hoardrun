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
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout';
import { SidebarContent } from '@/components/ui/sidebar-content';
import { SidebarToggle } from '@/components/ui/sidebar-toggle';
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

const performanceData = [
  { month: 'Jan', value: 4000, profit: 2400 },
  { month: 'Feb', value: 3000, profit: 1398 },
  { month: 'Mar', value: 5000, profit: 3800 },
  { month: 'Apr', value: 2780, profit: 3908 },
  { month: 'May', value: 1890, profit: 4800 },
  { month: 'Jun', value: 2390, profit: 3800 },
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

  const router = useRouter()
  const { addToast } = useToast()

  // Use the finance context with proper error handling
  const financeContext = useFinance();
  const balance = financeContext?.balance || 25000; // Default investment balance
  const depositFunds = financeContext?.depositFunds || (async (amount: number) => {
    console.warn('Finance context not available, using mock deposit function');
    addToast({ title: "Deposit", description: `Mock deposit of $${amount}` });
  });
  const withdrawFunds = financeContext?.withdrawFunds || (async (amount: number) => {
    console.warn('Finance context not available, using mock withdraw function');
    addToast({ title: "Withdraw", description: `Mock withdraw of $${amount}` });
  });

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
          ...quote,
          high: quote.price * 1.05, // Mock high price
          low: quote.price * 0.95,  // Mock low price
          open: quote.price * 0.98, // Mock open price
          close: quote.price,       // Use current price as close
          timestamp: new Date(),    // Current timestamp
          marketCap: quote.marketCap || 0
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

  // Example startup data
  const startups: Startup[] = [
    {
      id: '1',
      companyName: 'TechVision AI',
      companyType: 'Technology',
      description: 'AI-powered analytics platform for enterprise decision making',
      registrationNumber: 'REG123456789',
      incorporationDate: '2023-01-15',
      jurisdiction: 'United States',
      valuation: 10000000,
      annualRevenue: 2500000,
      profitMargin: 25,
      availablePercentage: 15,
      missionStatement: 'Revolutionizing enterprise decision making through AI',
      targetMarket: 'Enterprise businesses',
      competitiveAdvantage: 'Proprietary AI algorithms and extensive data partnerships',
      growthStrategy: 'Expand into new markets and develop additional AI solutions',
      shareType: 'Preferred Shares',
      sharesAvailable: 20000,
      pricePerShare: 100,
      fundraisingGoal: 2000000,
      fundUse: 'Product development and market expansion',
      progress: 65,
      videoUrl: 'https://example.com/video',
      risks: [
        'Market competition',
        'Technology evolution',
        'Regulatory changes'
      ],
      testimonials: [
        {
          name: 'John Smith',
          role: 'Early Investor',
          comment: 'Outstanding team with a clear vision for the future'
        }
      ]
    }
  ]

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <LayoutWrapper className="min-h-screen bg-background">
          {/* Sticky Quick Navigation - Mobile First */}
          <div className="sticky top-14 sm:top-16 z-40 bg-background border-b border-border">
            <div className="flex items-center justify-between p-2">
              <h1 className="text-xs sm:text-base font-bold text-foreground">Investments</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickNav(!showQuickNav)}
                className="p-1 h-auto"
              >
                {showQuickNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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

          {/* Portfolio Overview Section */}
          <section id="overview" className="p-3 bg-primary text-primary-foreground">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs sm:text-base font-bold">Portfolio Overview</h2>
                  <p className="text-xs sm:text-sm text-primary-foreground/60">AI-Powered Management</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setShowInvestModal(true)}
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs sm:text-sm px-2 py-1 h-auto"
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    Invest
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push('/startupregistration')}
                    variant="outline"
                    className="border-primary-foreground/50 text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary text-xs sm:text-sm px-2 py-1 h-auto"
                  >
                    <Building2 className="w-3 h-3 mr-1" />
                    Register
                  </Button>
                </div>
              </div>

              {/* Key Metrics - Compact Grid */}
              <div className="grid grid-cols-3 gap-2">
                <Card className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                  <CardContent className="p-2">
                    <div className="text-xs sm:text-sm text-primary-foreground/60">Portfolio</div>
                    <div className="text-xs sm:text-base font-bold">$45,678</div>
                    <div className="flex items-center text-xs sm:text-sm text-green-400">
                      <ArrowUpRight className="h-2 w-2 mr-1" />
                      +12.5%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                  <CardContent className="p-2">
                    <div className="text-xs sm:text-sm text-primary-foreground/60">Returns</div>
                    <div className="text-xs sm:text-base font-bold">$5,432</div>
                    <div className="flex items-center text-xs sm:text-sm text-green-400">
                      <ArrowUpRight className="h-2 w-2 mr-1" />
                      +8.3%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                  <CardContent className="p-2">
                    <div className="text-xs sm:text-sm text-primary-foreground/60">AI Score</div>
                    <div className="text-xs sm:text-base font-bold">85/100</div>
                    <div className="text-xs sm:text-sm text-primary-foreground/60">Optimized</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Performance Chart Section */}
          <section id="performance" className="p-3 bg-background">
            <Card className="bg-card border-border">
              <CardHeader className="p-3">
                <CardTitle className="text-xs sm:text-base text-foreground">Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          color: 'hsl(var(--foreground))',
                          fontSize: '12px'
                        }} 
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--foreground))"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Investment Categories Section */}
          <section id="investments" className="p-3 bg-background">
            <div className="mb-3">
              <h3 className="text-xs sm:text-base font-bold text-foreground mb-1">Investment Options</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Diversified portfolio opportunities</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {investmentCategories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow cursor-pointer bg-card border-border"
                  onClick={() => {
                    setSelectedInvestment(category)
                    setShowInvestModal(true)
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
              {startups.map((startup) => (
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
              ))}
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

          {/* Investment Modal */}
          <Dialog open={showInvestModal} onOpenChange={setShowInvestModal}>
            <DialogContent className="sm:max-w-[90vw] max-w-[350px] bg-background border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground text-sm">New Investment</DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Available Balance: ${balance?.toLocaleString() ?? '0'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 py-3">
                <div className="space-y-2">
                  <Label className="text-foreground text-xs">Investment Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
                    <Input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="pl-8 text-xs h-8"
                      min={0}
                      max={balance}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground text-xs">Risk Tolerance</Label>
                  <Slider
                    value={[riskTolerance]}
                    onValueChange={(value) => setRiskTolerance(value[0])}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground text-xs">Investment Strategy</Label>
                  <Select>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="growth" className="text-xs">Growth</SelectItem>
                      <SelectItem value="value" className="text-xs">Value</SelectItem>
                      <SelectItem value="dividend" className="text-xs">Dividend</SelectItem>
                      <SelectItem value="blend" className="text-xs">Blend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={autoInvest}
                    onCheckedChange={setAutoInvest}
                  />
                  <Label className="text-foreground text-xs">Enable Auto-Invest</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    addToast({
                      title: "Investment Successful",
                      description: `Successfully invested $${investmentAmount}`,
                    })
                    setShowInvestModal(false)
                  }}
                  disabled={isLoading || !investmentAmount ||
                    Number(investmentAmount) <= 0 ||
                    Number(investmentAmount) > (balance ?? 0)}
                  className="text-xs px-3 py-1 h-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Invest Now'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
