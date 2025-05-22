'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Wallet,
  Bell,
  Settings,
  Search,
  ChevronRight,
  Download,
  Filter,
  Plus,
  Brain,
  Sparkles,
  Target,
  Clock,
  Loader2,
  Info,
  PiggyBank,
  TrendingUp
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { cn } from "@/lib/utils"
import { useAuth } from '@/contexts/AuthContext'
import { useNavigationContext } from '@/providers/NavigationProvider'
import { DepositModal } from './deposit-modal'
import { useFinance } from '@/contexts/FinanceContext'
import { navigation } from '@/lib/navigation'
import { useSession } from 'next-auth/react'
import { FeatureNavigation } from './home/feature-navigation'
import { SavingsPreview } from './home/savings-preview'
import { InvestmentPreview } from './home/investment-preview'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  merchant: string
  status: {
    label: string
    color: 'green' | 'yellow' | 'red' | 'gray' | 'blue'
  }
}

interface AIInsight {
  id: string
  title: string
  description: string
  type: 'tip' | 'warning' | 'achievement'
  impact: number
  confidence: number
  actions?: {
    label: string
    onClick: () => void
  }[]
}

interface FinancialSummary {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  changePercentages: {
    balance: number
    income: number
    expenses: number
    savings: number
  }
}

export function HomePageComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { isLoading: isNavigating } = useNavigationContext()
  // Try to use the finance context, but provide a fallback if it's not available
  let balance = 0;
  try {
    const financeContext = useFinance();
    balance = financeContext.balance;
  } catch (error) {
    console.warn('Finance context not available, using default balance');
    // Use a default balance if the context is not available
    balance = 5000;
  }

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [showInsights, setShowInsights] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showDepositModal, setShowDepositModal] = useState(false)

  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        // Check if we should bypass auth in development mode
        const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
        if (bypassAuth && process.env.NODE_ENV === 'development') {
          console.log('Auth bypass enabled in development mode for home page');
          setIsLoading(false);
          fetchData(); // Your existing data fetching function
          return;
        }

        const response = await fetch('/api/user/status', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (!data.emailVerified) {
          navigation.connect('home', 'verify-email');
          router.push('/verify-email');
          return;
        }

        if (!data.profileComplete) {
          navigation.connect('home', 'create-profile');
          router.push('/create-profile');
          return;
        }

        // Check if we have a valid navigation flow
        // In development, we'll allow direct access to the home page
        const allowDirectAccess = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development';

        if (!allowDirectAccess &&
            !navigation.isValidTransition('create-profile', 'home') &&
            !navigation.isValidTransition('dashboard', 'home') &&
            !navigation.isValidTransition('signin', 'home')) {
          router.push('/signin');
          return;
        }

        // If we're allowing direct access, make sure to connect the navigation flow
        if (allowDirectAccess) {
          navigation.connect('signin', 'home');
        }

        setIsLoading(false);
        fetchData(); // Your existing data fetching function
      } catch (error) {
        setError('Failed to verify user access');
        toast({
          title: "Error",
          description: "Failed to load home page",
          variant: "destructive"
        });
      }
    };

    checkUserAccess();
  }, [router, toast]);

  // Add navigation methods for internal routing
  const handleNavigateToSection = (section: string) => {
    navigation.connect('home', section);
    router.push(`/${section}`);
  };

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if we're in development mode with bypass enabled
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      if (bypassAuth && process.env.NODE_ENV === 'development') {
        // Use mock data in development mode
        console.log('Using mock data in development mode');

        // Mock transactions data
        const mockTransactions = [
          { id: '1', amount: 120.50, description: 'Grocery Shopping', merchant: 'Whole Foods', category: 'Food', date: new Date().toISOString(), type: 'expense' },
          { id: '2', amount: 45.00, description: 'Movie Tickets', merchant: 'AMC Theaters', category: 'Entertainment', date: new Date().toISOString(), type: 'expense' },
          { id: '3', amount: 1000.00, description: 'Salary Deposit', merchant: 'Employer Inc.', category: 'Income', date: new Date().toISOString(), type: 'income' },
        ];

        // Mock AI insights
        const mockInsights = [
          { id: '1', title: 'Spending Trend', description: 'Your spending on food has decreased by 15% this month.', category: 'spending', priority: 'medium' },
          { id: '2', title: 'Saving Opportunity', description: 'You could save $200 by reducing entertainment expenses.', category: 'saving', priority: 'high' },
        ];

        // Mock financial summary
        const mockSummary = {
          totalBalance: 5250.75,
          income: 3000.00,
          expenses: 1200.25,
          savings: 800.50,
          investmentValue: 2000.00,
          investmentGrowth: 5.2,
        };

        setRecentTransactions(mockTransactions);
        setAIInsights(mockInsights);
        setFinancialSummary(mockSummary);
        setIsLoading(false);
        return;
      }

      // Real API calls with Promise.all for parallel requests
      try {
        const [transactionsData, insightsData, summaryData] = await Promise.all([
          fetch('/api/transactions/recent').then(res => res.json()),
          fetch('/api/ai-insights').then(res => res.json()),
          fetch('/api/financial-summary').then(res => res.json())
        ])

        setRecentTransactions(transactionsData)
        setAIInsights(insightsData)
        setFinancialSummary(summaryData)
      } catch (apiError) {
        console.error('API error:', apiError);
        // Fallback to mock data if API calls fail
        const mockTransactions = [
          { id: '1', amount: 120.50, description: 'Grocery Shopping', merchant: 'Whole Foods', category: 'Food', date: new Date().toISOString(), type: 'expense' },
          { id: '2', amount: 45.00, description: 'Movie Tickets', merchant: 'AMC Theaters', category: 'Entertainment', date: new Date().toISOString(), type: 'expense' },
          { id: '3', amount: 1000.00, description: 'Salary Deposit', merchant: 'Employer Inc.', category: 'Income', date: new Date().toISOString(), type: 'income' },
        ];

        const mockInsights = [
          { id: '1', title: 'Spending Trend', description: 'Your spending on food has decreased by 15% this month.', category: 'spending', priority: 'medium' },
          { id: '2', title: 'Saving Opportunity', description: 'You could save $200 by reducing entertainment expenses.', category: 'saving', priority: 'high' },
        ];

        const mockSummary = {
          totalBalance: 5250.75,
          income: 3000.00,
          expenses: 1200.25,
          savings: 800.50,
          investmentValue: 2000.00,
          investmentGrowth: 5.2,
        };

        setRecentTransactions(mockTransactions);
        setAIInsights(mockInsights);
        setFinancialSummary(mockSummary);
      }
    } catch (err) {
      const errorMessage = 'Failed to load data. Please try again.'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Refresh data periodically
  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1)
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [fetchData, refreshKey])

  // Filter transactions based on search
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return recentTransactions
    const query = searchQuery.toLowerCase()
    return recentTransactions.filter(transaction =>
      transaction.description.toLowerCase().includes(query) ||
      transaction.merchant.toLowerCase().includes(query) ||
      transaction.category.toLowerCase().includes(query)
    )
  }, [recentTransactions, searchQuery])

  const handleInsightAction = async (insightId: string, actionIndex: number) => {
    try {
      setIsLoading(true)
      // Implement insight action logic
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: "Action Completed",
        description: "Successfully applied the recommended action.",
        duration: 3000
      })

      // Refresh data after action
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply action. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
          <Button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            variant="outline"
            className="mt-4"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <LayoutWrapper className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold dark:text-white">
                Welcome back, {user?.name || 'User'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* AI Insights */}
        {showInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-blue-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <CardTitle>AI Insights</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInsights(false)}
                  >
                    Hide
                  </Button>
                </div>
                <CardDescription>Personalized financial recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  <AnimatePresence>
                    {aiInsights.map((insight, index) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={cn(
                          "border-l-4",
                          insight.type === 'warning' ? "border-yellow-500" :
                          insight.type === 'achievement' ? "border-green-500" :
                          "border-blue-500"
                        )}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{insight.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {insight.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge variant="secondary">
                                    {insight.impact > 0 ? '+' : ''}{insight.impact}% Impact
                                  </Badge>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">AI Confidence:</span>
                                    <Progress value={insight.confidence} className="w-24" />
                                  </div>
                                </div>
                              </div>
                              {insight.actions && (
                                <div className="flex gap-2">
                                  {insight.actions.map((action, actionIndex) => (
                                    <Button
                                      key={actionIndex}
                                      size="sm"
                                      onClick={() => handleInsightAction(insight.id, actionIndex)}
                                      disabled={isLoading}
                                    >
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Financial Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${balance.toLocaleString()}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDepositModal(true)}
                  className="mt-2"
                >
                  Deposit
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Add other financial cards... */}
        </div>

        {/* Feature Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <FeatureNavigation />
        </motion.div>

        {/* Savings and Investment Previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <SavingsPreview />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <InvestmentPreview />
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activities</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {filteredTransactions.map((transaction, index) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.1 }}
                        >
                          {/* Transaction card content */}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        <DepositModal
          open={showDepositModal}
          onOpenChange={setShowDepositModal}
        />
      </main>
    </LayoutWrapper>
  )
}





