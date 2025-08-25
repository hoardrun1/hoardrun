'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, DollarSign, Percent, ArrowUpRight,
  ArrowDownRight, PieChart, BarChart, Wallet,
  Globe, Shield, AlertCircle, Info, Target,
  Clock, Filter, Brain, Loader2, RefreshCcw,
  Building2, Briefcase, ChartBar,
  LucideIcon, Lock, CheckCircle, AlertTriangle
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
import { useSession } from 'next-auth/react';
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
  },
  {
    id: 'growth-stocks',
    title: 'Growth Stocks',
    icon: TrendingUp,
    return: 15.5,
    risk: 'High',
    minInvestment: 100,
    description: 'High-growth public company stocks',
    features: ['Rapid growth potential', 'Market leadership', 'Innovation focus']
  },
  {
    id: 'dividend-stocks',
    title: 'Dividend Stocks',
    icon: Wallet,
    return: 8.2,
    risk: 'Moderate',
    minInvestment: 100,
    description: 'Stable dividend-paying stocks',
    features: ['Regular dividends', 'Stable companies', 'Income generation']
  },
  {
    id: 'municipal-bonds',
    title: 'Municipal Bonds',
    icon: Building2,
    return: 4.5,
    risk: 'Low',
    minInvestment: 500,
    description: 'Tax-advantaged government bonds',
    features: ['Tax benefits', 'Government backed', 'Stable returns']
  },
  {
    id: 'commodity-etfs',
    title: 'Commodity ETFs',
    icon: BarChart,
    return: 11.2,
    risk: 'Moderate',
    minInvestment: 200,
    description: 'Diversified commodity exposure',
    features: ['Inflation hedge', 'Portfolio diversification', 'Global exposure']
  },
  {
    id: 'tech-startups',
    title: 'Tech Startups',
    icon: Brain,
    return: 28.5,
    risk: 'Very High',
    minInvestment: 5000,
    description: 'Early-stage technology companies',
    features: ['Innovation focus', 'High growth potential', 'Direct ownership']
  },
  {
    id: 'real-estate-trusts',
    title: 'REITs',
    icon: Building2,
    return: 10.5,
    risk: 'Moderate',
    minInvestment: 250,
    description: 'Real Estate Investment Trusts',
    features: ['Property portfolio', 'Regular income', 'Liquidity']
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

  const { data: session, status } = useSession()
  const { fetchStockQuote, isLoading: marketDataLoading } = useMarketData()

  // Redirect if not authenticated (unless bypass is enabled)
  useEffect(() => {
    // Check if we should bypass auth in development mode
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    if (bypassAuth && process.env.NODE_ENV === 'development') {
      console.log('Auth bypass enabled in development mode for investment page');
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

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

    if (session?.user) {
      // Simulate security checks
      setTimeout(() => {
        setSecurityChecks({
          isEmailVerified: true,
          isIdentityVerified: true,
          isInvestorVerified: true,
        })
      }, 1000)
    }
  }, [session])

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

  // Show security verification first
  if (!securityChecks.isEmailVerified || !securityChecks.isIdentityVerified || !securityChecks.isInvestorVerified) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Security Verification Required
              </CardTitle>
              <CardDescription>
                Please complete the verification process to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                {securityChecks.isEmailVerified ? (
                  <CheckCircle className="w-5 h-5 text-black" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-black/60" />
                )}
                <span>Email Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                {securityChecks.isIdentityVerified ? (
                  <CheckCircle className="w-5 h-5 text-black" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-black/60" />
                )}
                <span>Identity Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                {securityChecks.isInvestorVerified ? (
                  <CheckCircle className="w-5 h-5 text-black" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-black/60" />
                )}
                <span>Investor Verification</span>
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

  // Enhance investment modal with validation
  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <LayoutWrapper className="min-h-screen bg-white pt-16 pb-4 px-4 sm:pt-20 sm:pb-6 sm:px-6">
      {/* Investment Overview */}
      <div className="bg-black text-white py-8">
        <div className="container mx-auto px-4 ml-16">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Smart Investments</h1>
              <p className="text-white/60">AI-Powered Portfolio Management</p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => router.push('/startupregistration')}
                className="bg-black text-white hover:bg-black/90"
                disabled={marketDataLoading}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Register Startup
              </Button>
              <Button
                onClick={() => setShowInvestModal(true)}
                className="bg-white text-black hover:bg-white/90"
                disabled={marketDataLoading}
              >
                {marketDataLoading ? 'Loading...' : 'New Investment'}
              </Button>
            </div>
          </div>

          {marketData && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h2 className="text-gray-800 text-xl font-semibold mb-4">
                Market Data for {marketData.symbol}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-500">Current Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${marketData.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Change</p>
                  <p className={`text-2xl font-bold ${
                    marketData.change >= 0 ? 'text-black' : 'text-black'
                  }`}>
                    {marketData.change.toFixed(2)}
                  </p>
                </div>
                {/* Add more market data display as needed */}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur border-none text-white">
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Value</CardTitle>
                <div className="text-3xl font-bold">$45,678.90</div>
                <div className="flex items-center text-white/60">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +12.5% YTD
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-none text-white">
              <CardHeader>
                <CardTitle className="text-lg">Total Returns</CardTitle>
                <div className="text-3xl font-bold">$5,432.10</div>
                <div className="flex items-center text-white/60">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +8.3% MTD
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-none text-white">
              <CardHeader>
                <CardTitle className="text-lg">AI Risk Score</CardTitle>
                <div className="text-3xl font-bold">85/100</div>
                <div className="text-white/60">Optimized Portfolio</div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Investment Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investmentCategories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => {
                setSelectedInvestment(category)
                setShowInvestModal(true)
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <category.icon className="h-5 w-5 text-black" />
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                  <div className={`px-2 py-1 rounded text-sm ${
                    category.risk === 'High' || category.risk === 'Very High'
                      ? 'bg-black/20 text-black'
                      : category.risk === 'Moderate'
                      ? 'bg-black/10 text-black'
                      : 'bg-black/5 text-black'
                  }`}>
                    {category.risk}
                  </div>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Expected Return</div>
                    <div className="text-2xl font-bold text-black">
                      {category.return}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Min Investment</div>
                    <div className="font-medium">
                      ${category.minInvestment.toLocaleString()}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-sm text-gray-500 mb-2">Key Features</div>
                    <ul className="space-y-1">
                      {category.features.map((feature, index) => (
                        <li key={index} className="text-sm flex items-center text-black/60">
                          <ArrowUpRight className="h-4 w-4 mr-2 text-black" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Startup Investments Section */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Startup Investments</h2>
          <Button
            onClick={() => setStartupView('list')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {startupView === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((startup) => (
              <Card key={startup.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{startup.companyName}</CardTitle>
                  <CardDescription>{startup.companyType}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Valuation</p>
                      <p className="text-lg font-semibold">${startup.valuation.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fundraising Progress</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className="bg-black h-2.5 rounded-full"
                          style={{ width: `${startup.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {startup.progress}% of ${startup.fundraisingGoal.toLocaleString()}
                      </p>
                    </div>
                    <div className="pt-4">
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedStartup(startup)
                          setStartupView('detail')
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          selectedStartup && (
            <div className="space-y-8">
              <Button
                variant="ghost"
                onClick={() => setStartupView('list')}
                className="mb-4"
              >
                ← Back to List
              </Button>

              {/* Company Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{selectedStartup.companyName}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{selectedStartup.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      <p className="font-medium">{selectedStartup.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Incorporation Date</p>
                      <p className="font-medium">{selectedStartup.incorporationDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Valuation</p>
                      <p className="text-lg font-semibold">
                        ${selectedStartup.valuation.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Annual Revenue</p>
                      <p className="text-lg font-semibold">
                        ${selectedStartup.annualRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Profit Margin</p>
                      <p className="text-lg font-semibold">{selectedStartup.profitMargin}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available Equity</p>
                      <p className="text-lg font-semibold">{selectedStartup.availablePercentage}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Opportunity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Share Type</p>
                      <p className="font-medium">{selectedStartup.shareType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price per Share</p>
                      <p className="font-medium">${selectedStartup.pricePerShare}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available Shares</p>
                      <p className="font-medium">{selectedStartup.sharesAvailable.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Fundraising Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-black h-2.5 rounded-full"
                        style={{ width: `${selectedStartup.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedStartup.progress}% of ${selectedStartup.fundraisingGoal.toLocaleString()} goal
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Use of Funds</p>
                    <p className="text-gray-600">{selectedStartup.fundUse}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Risks and Testimonials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-4 space-y-2">
                      {selectedStartup.risks.map((risk, index) => (
                        <li key={index} className="text-gray-600">{risk}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Investor Testimonials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedStartup.testimonials.map((testimonial, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <p className="italic text-gray-600">"{testimonial.comment}"</p>
                          <p className="text-sm font-medium mt-2">{testimonial.name}</p>
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg"
                  onClick={() => setShowStartupModal(true)}
                >
                  Invest Now
                </Button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Collective Capital Circles Section */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="traditional" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="traditional">Traditional Investments</TabsTrigger>
            <TabsTrigger value="collective">Collective Capital Circles</TabsTrigger>
          </TabsList>

          <TabsContent value="traditional">
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold mb-4">Traditional Investment Options</h3>
              <p className="text-gray-600 mb-6">
                Explore our curated selection of traditional investment opportunities
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {investmentCategories.slice(0, 3).map((category) => (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <category.icon className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">
                          {category.return}%
                        </span>
                        <Badge variant="outline">{category.risk}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collective">
            <CollectiveCapitalCircles />
          </TabsContent>
        </Tabs>
      </div>

      {/* Investment Modal */}
      <Dialog open={showInvestModal} onOpenChange={setShowInvestModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Investment</DialogTitle>
            <DialogDescription>
              Available Balance: ${balance?.toLocaleString() ?? '0'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Investment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-10"
                  min={0}
                  max={balance}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Risk Tolerance</Label>
              <Slider
                value={[riskTolerance]}
                onValueChange={(value) => setRiskTolerance(value[0])}
                max={100}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Investment Strategy</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="dividend">Dividend</SelectItem>
                  <SelectItem value="blend">Blend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={autoInvest}
                onCheckedChange={setAutoInvest}
              />
              <Label>Enable Auto-Invest</Label>
            </div>

            {autoInvest && (
              <div className="space-y-2">
                <Label>Auto-Invest Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {mlPredictions && (
              <Card className="bg-black/5 border border-black/10">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Predicted Return:</span>
                      <span className="font-medium text-black">
                        {mlPredictions.predictedReturn}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="font-medium">
                        {mlPredictions.confidence}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowInvestModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle investment submission
                addToast({
                  title: "Investment Successful",
                  description: `Successfully invested $${investmentAmount}`,
                })
                setShowInvestModal(false)
              }}
              disabled={isLoading || !investmentAmount ||
                Number(investmentAmount) <= 0 ||
                Number(investmentAmount) > (balance ?? 0)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Invest Now'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Investment Modal */}
      <Dialog open={showStartupModal} onOpenChange={setShowStartupModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invest in {selectedStartup?.companyName}</DialogTitle>
            <DialogDescription>
              Enter the number of shares you would like to purchase
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Number of Shares</Label>
              <Input
                type="number"
                placeholder="Enter number of shares"
                min="1"
                max={selectedStartup?.sharesAvailable}
              />
            </div>
            <div>
              <Label>Total Investment</Label>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                $0.00
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartupModal(false)}>
              Cancel
            </Button>
            <Button>Confirm Investment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
