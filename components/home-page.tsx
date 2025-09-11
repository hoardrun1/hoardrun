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
  Download,
  Filter,
  Plus,
  Brain,
  Sparkles,
  Target,
  Loader2,
  PiggyBank,
  TrendingUp,
  Send
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from '@/lib/api-client'

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import { LayoutWrapper } from "@/components/ui/layout-wrapper"

import { useAuth } from '@/contexts/AuthContext'
import { useNavigationContext } from '@/providers/NavigationProvider'
import { DepositModal } from './deposit-modal'
import { useFinance } from '@/contexts/FinanceContext'
import { navigation } from '@/lib/navigation'
// useSession removed - using Firebase Auth instead
import { FeatureNavigation } from './home/feature-navigation'
import { SavingsPreview } from './home/savings-preview'
import { InvestmentPreview } from './home/investment-preview'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { Notifications } from './ui/notifications'
import { Settings as SettingsPanel } from './ui/settings'
import { MobileNavigation } from '@/components/ui/mobile-navigation'

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
        // Check if we should bypass auth
        const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
        if (bypassAuth) {
          console.log('Auth bypass enabled for home page');
          setIsLoading(false);
          fetchData();
          return;
        }

        const response = await apiClient.getProfile();

        if (response.error) {
          router.push('/signin');
          return;
        }

        // For now, assume user is verified and profile is complete
        // In a real app, you'd check these properties from the API response
        setIsLoading(false);
        fetchData();
      } catch (error) {
        setError('Failed to verify user access');
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

      // Check if we have bypass enabled
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      if (bypassAuth) {
        console.log('Auth bypass enabled - loading empty data');
        setRecentTransactions([]);
        setAIInsights([]);
        setFinancialSummary(null);
        setIsLoading(false);
        return;
      }

      // Real API calls with Promise.all for parallel requests
      try {
        const [transactionsResponse, dashboardResponse] = await Promise.all([
          apiClient.getTransactions({ limit: 10 }),
          apiClient.getDashboard()
        ])

        // Set transactions data
        if (transactionsResponse.data) {
          setRecentTransactions(transactionsResponse.data.map(t => ({
            id: t.id,
            type: t.type === 'DEPOSIT' || t.type === 'TRANSFER' ? 'income' : 'expense',
            amount: t.amount,
            description: t.description,
            category: t.category || 'General',
            date: t.date,
            merchant: t.beneficiary || 'System',
            status: {
              label: t.status,
              color: t.status === 'COMPLETED' ? 'green' : t.status === 'PENDING' ? 'yellow' : 'red'
            }
          })))
        }

        // Set AI insights (mock data for now)
        setAIInsights([
          {
            id: '1',
            title: 'Spending Pattern Alert',
            description: 'Your dining expenses increased by 15% this month',
            type: 'warning',
            priority: 'medium'
          },
          {
            id: '2',
            title: 'Savings Opportunity',
            description: 'You could save $200 by switching to a different plan',
            type: 'tip',
            priority: 'high'
          }
        ])

        // Set financial summary from dashboard data
        if (dashboardResponse.data) {
          setFinancialSummary({
            totalBalance: dashboardResponse.data.balance,
            monthlyIncome: dashboardResponse.data.total_income || 3200,
            monthlyExpenses: dashboardResponse.data.total_expenses || 1850,
            savingsRate: 75,
            changePercentages: {
              balance: 2.5,
              income: 8.2,
              expenses: -3.1,
              savings: 5.0
            }
          })
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        // Set empty data if API calls fail
        setRecentTransactions([]);
        setAIInsights([]);
        setFinancialSummary(null);
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
      <div className="flex items-center justify-center min-h-screen bg-background">
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
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setShowDepositModal(true)} />}
      >
        <SidebarToggle />
        <LayoutWrapper className="bg-background min-h-screen" showBreadcrumbs={false}>

      {/* Header */}
      <header className="sticky top-14 sm:top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 lg:ml-16 min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-foreground truncate">
                    Welcome back, {user?.name || 'User'}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground sm:hidden">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 bg-secondary border-border"
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
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
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
        {/* Balance Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-muted-foreground mb-2">Total Balance</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-1">
            ${balance.toLocaleString()}
          </h1>
          <div className="flex items-center justify-center gap-1 text-muted-foreground">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-sm font-medium">+2.5% this month</span>
          </div>
        </motion.div>

        {/* Quick Actions Section - Now in place of Financial Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          {/* Primary Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDepositModal(true)}
              className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 group border-2 border-transparent hover:border-border"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-primary-foreground/10 p-4 rounded-2xl group-hover:bg-primary-foreground/20 transition-all duration-300 group-hover:scale-110">
                  <Plus className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Add Money</p>
                  <p className="text-sm opacity-70 mt-1">Top up instantly</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsTransferModalOpen(true)}
              className="bg-card text-card-foreground p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 group border-2 border-border hover:border-muted-foreground"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-foreground/10 p-4 rounded-2xl group-hover:bg-foreground/20 transition-all duration-300 group-hover:scale-110">
                  <Send className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Send Money</p>
                  <p className="text-sm opacity-70 mt-1">Transfer funds</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/savings')}
              className="bg-secondary text-secondary-foreground p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 group border-2 border-border hover:border-muted-foreground"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-secondary-foreground/10 p-4 rounded-2xl group-hover:bg-secondary-foreground/20 transition-all duration-300 group-hover:scale-110">
                  <PiggyBank className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Save</p>
                  <p className="text-sm opacity-70 mt-1">Set goals</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/investment')}
              className="bg-muted text-muted-foreground p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 group border-2 border-border hover:border-accent"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-muted-foreground/10 p-4 rounded-2xl group-hover:bg-muted-foreground/20 transition-all duration-300 group-hover:scale-110">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Invest</p>
                  <p className="text-sm opacity-70 mt-1">Grow wealth</p>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Secondary Quick Actions */}
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { icon: Wallet, label: 'Cards', onClick: () => router.push('/cards') },
              { icon: ArrowUpRight, label: 'History', onClick: () => router.push('/transactions') },
              { icon: Target, label: 'Budget', onClick: () => router.push('/budget') },
              { icon: Brain, label: 'Insights', onClick: () => router.push('/analytics') },
              { icon: Settings, label: 'Settings', onClick: () => setShowSettings(true) },
              { icon: RefreshCcw, label: 'Help', onClick: () => router.push('/help') },
              { icon: Download, label: 'Export', onClick: () => router.push('/profile') },
              { icon: Bell, label: 'Alerts', onClick: () => setShowNotifications(true), hasNotification: true },
            ].map((item, index) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={item.onClick}
                className="bg-card border-2 border-border p-4 rounded-2xl hover:shadow-lg transition-all duration-300 group hover:border-muted-foreground relative"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`${item.label === 'Cards' ? 'bg-black text-white' : 'bg-secondary text-foreground'} p-3 rounded-xl group-hover:bg-opacity-80 transition-all duration-300 group-hover:scale-110`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{item.label}</span>
                  {item.hasNotification && notificationCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                      {notificationCount}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Financial Overview Cards - Moved to a different location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Financial Overview</h2>
            <p className="text-muted-foreground">Your financial performance this month</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Balance Card */}
            <Card className="bg-primary text-primary-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/70 text-sm font-medium">Total Balance</p>
                    <p className="text-3xl font-bold mt-2">${balance.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-primary-foreground/60 mr-1" />
                      <span className="text-primary-foreground/60 text-sm">+2.5% from last month</span>
                    </div>
                  </div>
                  <div className="bg-primary-foreground/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Wallet className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Income Card */}
            <Card className="bg-secondary text-secondary-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary-foreground/70 text-sm font-medium">Monthly Income</p>
                    <p className="text-3xl font-bold mt-2">$3,200</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-secondary-foreground/60 mr-1" />
                      <span className="text-secondary-foreground/60 text-sm">+8.2% this month</span>
                    </div>
                  </div>
                  <div className="bg-secondary-foreground/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Expenses Card */}
            <Card className="bg-muted text-muted-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground/70 text-sm font-medium">Monthly Expenses</p>
                    <p className="text-3xl font-bold mt-2">$1,850</p>
                    <div className="flex items-center mt-2">
                      <ArrowDownRight className="h-4 w-4 text-muted-foreground/60 mr-1" />
                      <span className="text-muted-foreground/60 text-sm">-3.1% this month</span>
                    </div>
                  </div>
                  <div className="bg-muted-foreground/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <ArrowDownRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Savings Goal Card */}
            <Card className="bg-accent text-accent-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-foreground/70 text-sm font-medium">Savings Progress</p>
                    <p className="text-3xl font-bold mt-2">75%</p>
                    <div className="flex items-center mt-2">
                      <Target className="h-4 w-4 text-accent-foreground/60 mr-1" />
                      <span className="text-accent-foreground/60 text-sm">$7,500 of $10,000</span>
                    </div>
                  </div>
                  <div className="bg-accent-foreground/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <PiggyBank className="h-6 w-6 text-accent-foreground" />
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
              <Card className="border-2 border-border bg-gradient-to-br from-secondary/50 to-secondary">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-foreground" />
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
                          className="bg-card p-4 rounded-lg border border-border shadow-sm"
                        >
                          <h3 className="font-medium text-card-foreground mb-1">
                            {insight.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
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
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-muted">
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="h-4 w-4 text-foreground" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.merchant} • {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No transactions found</p>
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
                  className=""
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
                  className=""
                />
              </div>

              {transferAmount && (
                <div className="bg-secondary p-3 rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="text-foreground">{formatCurrency(parseFloat(transferAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fee:</span>
                    <span className="text-foreground">{formatCurrency(2.50)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total:</span>
                    <span className="text-foreground">{formatCurrency((parseFloat(transferAmount) || 0) + 2.50)}</span>
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

      {/* Mobile Navigation - Only show on mobile */}
      <div className="lg:hidden">
        <MobileNavigation onAddMoney={() => setShowDepositModal(true)} />
      </div>
        </LayoutWrapper>
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
