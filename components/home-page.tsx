'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import { LayoutWrapper } from "@/components/ui/layout-wrapper"

import { useAuth } from '@/contexts/AuthContext'
import { useNavigationContext } from '@/providers/NavigationProvider'
import { DepositModal } from './deposit-modal'
import { useFinance } from '@/contexts/FinanceContext'
import { navigation } from '@/lib/navigation'
import { useSession } from 'next-auth/react'
import { FeatureNavigation } from './home/feature-navigation'
import { SavingsPreview } from './home/savings-preview'
import { InvestmentPreview } from './home/investment-preview'
import { Sidebar } from './ui/sidebar'
import { Notifications } from './ui/notifications'
import { Settings as SettingsPanel } from './ui/settings'

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
  type?: 'tip' | 'warning' | 'achievement'
  category?: string
  priority?: string
  impact?: number
  confidence?: number
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
  useNavigationContext()
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
  const [, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [showSettings, setShowSettings] = useState(false)

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [transferRecipient, setTransferRecipient] = useState('')
  const [transferMethod, setTransferMethod] = useState('bank')
  const [transferNote, setTransferNote] = useState('')
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false)

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
        // toast({
        //   title: "Error",
        //   description: "Failed to load home page",
        //   variant: "destructive"
        // });
      }
    };

    checkUserAccess();
  }, [router]);



  // Fetch initial data
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleTransfer = async () => {
    console.log('handleTransfer called!', { transferAmount, transferRecipient, transferMethod, transferNote });
    if (!transferAmount || !transferRecipient) {
      console.log('Validation failed: missing required fields');
      // For now, just log the error since toast might not be working
      console.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      console.error('Please enter a valid amount');
      return;
    }

    setIsProcessingTransfer(true);
    try {
      // Mock transfer processing - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log(`Transfer Successful: Successfully sent ${formatCurrency(amount)} to ${transferRecipient}`);

      // Reset form
      setTransferAmount('');
      setTransferRecipient('');
      setTransferNote('');
      setIsTransferModalOpen(false);

      // Refresh financial data
      setRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error('Transfer Failed: There was an error processing your transfer. Please try again.');
    } finally {
      setIsProcessingTransfer(false);
    }
  };

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
        const mockTransactions: Transaction[] = [
          { id: '1', amount: 120.50, description: 'Grocery Shopping', merchant: 'Whole Foods', category: 'Food', date: new Date().toISOString(), type: 'expense' as const, status: { label: 'Completed', color: 'green' as const } },
          { id: '2', amount: 45.00, description: 'Movie Tickets', merchant: 'AMC Theaters', category: 'Entertainment', date: new Date().toISOString(), type: 'expense' as const, status: { label: 'Completed', color: 'green' as const } },
          { id: '3', amount: 1000.00, description: 'Salary Deposit', merchant: 'Employer Inc.', category: 'Income', date: new Date().toISOString(), type: 'income' as const, status: { label: 'Completed', color: 'green' as const } },
        ];

        // Mock AI insights
        const mockInsights = [
          { id: '1', title: 'Spending Trend', description: 'Your spending on food has decreased by 15% this month.', category: 'spending', priority: 'medium' },
          { id: '2', title: 'Saving Opportunity', description: 'You could save $200 by reducing entertainment expenses.', category: 'saving', priority: 'high' },
        ];

        // Mock financial summary
        const mockSummary: FinancialSummary = {
          totalBalance: 5250.75,
          monthlyIncome: 3000.00,
          monthlyExpenses: 1200.25,
          savingsRate: 26.7,
          changePercentages: {
            balance: 2.5,
            income: 8.2,
            expenses: -3.1,
            savings: 12.5,
          },
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
        const mockTransactions: Transaction[] = [
          { id: '1', amount: 120.50, description: 'Grocery Shopping', merchant: 'Whole Foods', category: 'Food', date: new Date().toISOString(), type: 'expense' as const, status: { label: 'Completed', color: 'green' as const } },
          { id: '2', amount: 45.00, description: 'Movie Tickets', merchant: 'AMC Theaters', category: 'Entertainment', date: new Date().toISOString(), type: 'expense' as const, status: { label: 'Completed', color: 'green' as const } },
          { id: '3', amount: 1000.00, description: 'Salary Deposit', merchant: 'Employer Inc.', category: 'Income', date: new Date().toISOString(), type: 'income' as const, status: { label: 'Completed', color: 'green' as const } },
        ];

        const mockInsights = [
          { id: '1', title: 'Spending Trend', description: 'Your spending on food has decreased by 15% this month.', category: 'spending', priority: 'medium' },
          { id: '2', title: 'Saving Opportunity', description: 'You could save $200 by reducing entertainment expenses.', category: 'saving', priority: 'high' },
        ];

        const mockSummary: FinancialSummary = {
          totalBalance: 5250.75,
          monthlyIncome: 3000.00,
          monthlyExpenses: 1200.25,
          savingsRate: 26.7,
          changePercentages: {
            balance: 2.5,
            income: 8.2,
            expenses: -3.1,
            savings: 12.5,
          },
        };

        setRecentTransactions(mockTransactions);
        setAIInsights(mockInsights);
        setFinancialSummary(mockSummary);
      }
    } catch (err) {
      const errorMessage = 'Failed to load data. Please try again.'
      setError(errorMessage)
      // toast({
      //   title: "Error",
      //   description: errorMessage,
      //   variant: "destructive"
      // })
    } finally {
      setIsLoading(false)
    }
  }, [])

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
      {/* Sidebar */}
      <Sidebar onAddMoney={() => setShowDepositModal(true)} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4 ml-16">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold dark:text-white">
                    Welcome back, {user?.name || 'User'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-6 max-w-7xl ml-16">
        {/* Quick Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Quick Actions
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Manage your finances with one click
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setShowDepositModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Money
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      console.log('Transfer button clicked!');
                      setIsTransferModalOpen(true);
                    }}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Transfer
                  </Button>
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                    <Target className="h-4 w-4 mr-2" />
                    Set Goal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Balance Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Balance</p>
                    <p className="text-3xl font-bold mt-2">${balance.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-300 mr-1" />
                      <span className="text-green-300 text-sm">+2.5% from last month</span>
                    </div>
                  </div>
                  <div className="bg-blue-500/30 p-3 rounded-full">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Income Card */}
            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Monthly Income</p>
                    <p className="text-3xl font-bold mt-2">$3,200</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-300 mr-1" />
                      <span className="text-green-300 text-sm">+8.2% this month</span>
                    </div>
                  </div>
                  <div className="bg-green-500/30 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Expenses Card */}
            <Card className="bg-gradient-to-br from-orange-600 to-red-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Monthly Expenses</p>
                    <p className="text-3xl font-bold mt-2">$1,850</p>
                    <div className="flex items-center mt-2">
                      <ArrowDownRight className="h-4 w-4 text-red-300 mr-1" />
                      <span className="text-red-300 text-sm">-3.1% this month</span>
                    </div>
                  </div>
                  <div className="bg-orange-500/30 p-3 rounded-full">
                    <ArrowDownRight className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Savings Goal Card */}
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Savings Progress</p>
                    <p className="text-3xl font-bold mt-2">75%</p>
                    <div className="flex items-center mt-2">
                      <Target className="h-4 w-4 text-purple-300 mr-1" />
                      <span className="text-purple-300 text-sm">$7,500 of $10,000</span>
                    </div>
                  </div>
                  <div className="bg-purple-500/30 p-3 rounded-full">
                    <PiggyBank className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Savings and Investment Previews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Savings and Investment Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <SavingsPreview />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <InvestmentPreview />
              </motion.div>
            </div>

            {/* Feature Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <FeatureNavigation />
            </motion.div>
          </div>

          {/* Right Column - AI Insights */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">AI Insights</CardTitle>
                  </div>
                  <CardDescription>Personalized financial recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiInsights.slice(0, 3).map((insight) => (
                        <div
                          key={insight.id}
                          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {insight.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {insight.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {insight.priority || 'medium'}
                            </Badge>
                            <Button size="sm" variant="outline" className="text-xs">
                              Learn More
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        <Brain className="h-4 w-4 mr-2" />
                        View All Insights
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mb-8"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activities</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" className="text-xs">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.slice(0, 5).map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income'
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className={`h-4 w-4 ${
                              transaction.type === 'income'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`} />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.merchant} • {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                    </div>
                  )}
                  {filteredTransactions.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" className="w-full">
                        View All Transactions
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <DepositModal
          open={showDepositModal}
          onOpenChange={setShowDepositModal}
        />

        {/* Transfer Modal */}
        <Dialog open={isTransferModalOpen} onOpenChange={(open) => {
          console.log('Transfer modal state changing from', isTransferModalOpen, 'to:', open);
          setIsTransferModalOpen(open);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Money</DialogTitle>
              <DialogDescription>
                Transfer money quickly and securely
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-method">Transfer Method</Label>
                <Select value={transferMethod} onValueChange={setTransferMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transfer method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card Transfer</SelectItem>
                    <SelectItem value="mobile">Mobile Money</SelectItem>
                    <SelectItem value="email">Email Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="text-lg font-semibold"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-recipient">
                  {transferMethod === 'bank' ? 'Account Number' :
                   transferMethod === 'card' ? 'Card Number' :
                   transferMethod === 'mobile' ? 'Phone Number' : 'Email or Phone'}
                </Label>
                <Input
                  id="transfer-recipient"
                  placeholder={
                    transferMethod === 'bank' ? 'Enter account number' :
                    transferMethod === 'card' ? 'Enter card number' :
                    transferMethod === 'mobile' ? 'Enter phone number' : 'Enter email or phone'
                  }
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-note">Note (Optional)</Label>
                <Textarea
                  id="transfer-note"
                  placeholder="What's this transfer for?"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  rows={2}
                />
              </div>

              {transferAmount && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Amount:</span>
                    <span>{formatCurrency(parseFloat(transferAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee:</span>
                    <span>{formatCurrency(2.50)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency((parseFloat(transferAmount) || 0) + 2.50)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTransfer}
                  disabled={isProcessingTransfer || !transferAmount || !transferRecipient}
                  className="flex-1"
                >
                  {isProcessingTransfer ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Money
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      {/* Notifications Panel */}
      <Notifications
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onMarkAllRead={() => setNotificationCount(0)}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </LayoutWrapper>
  )
}





