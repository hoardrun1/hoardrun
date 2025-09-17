'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Plus,
  ChevronRight,
  Bell,
  Settings,
  Download,
  Upload,
  Brain,
  Loader2,
  RefreshCcw
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout';
import { SidebarContent } from '@/components/ui/sidebar-content';
import { SidebarToggle } from '@/components/ui/sidebar-toggle';
import { DepositModal } from '@/components/deposit-modal';
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from '@/lib/api-client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { Home, BarChart2, CreditCard, PieChart } from 'lucide-react'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  merchant: string
  status: 'completed' | 'pending' | 'failed'
}

interface Category {
  name: string
  amount: number
  percentage: number
  color: string
  trend: number
}

interface AIInsight {
  id: string
  type: 'spending' | 'saving' | 'investment'
  title: string
  description: string
  impact: number
  confidence: number
  actions?: {
    label: string
    onClick: () => void
  }[]
}

interface FinancialMetrics {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  trends: {
    balance: number
    income: number
    expenses: number
    savings: number
  }
}

export function FinancePageComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])
  const [showNewTransactionDialog, setShowNewTransactionDialog] = useState(false)
  const [showInsights, setShowInsights] = useState(true)

  // Chart data for financial overview
  const chartData = [
    { name: 'Jan', income: 4000, expenses: 2400 },
    { name: 'Feb', income: 3000, expenses: 1398 },
    { name: 'Mar', income: 2000, expenses: 9800 },
    { name: 'Apr', income: 2780, expenses: 3908 },
    { name: 'May', income: 1890, expenses: 4800 },
    { name: 'Jun', income: 2390, expenses: 3800 },
  ]

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Use API client for parallel requests
      const [transactionsResponse, dashboardResponse, analyticsResponse] = await Promise.all([
        apiClient.getTransactions({ limit: 50 }),
        apiClient.getDashboard(),
        apiClient.getCashFlowAnalysis({ period: 'monthly' })
      ])

      // Set transactions data
      if (transactionsResponse.data) {
        setTransactions(transactionsResponse.data.map(t => ({
          id: t.id,
          type: t.type === 'DEPOSIT' || t.type === 'TRANSFER' ? 'income' : 'expense',
          amount: t.amount,
          description: t.description,
          category: t.category || 'General',
          date: t.date,
          merchant: t.beneficiary || 'System',
          status: t.status.toLowerCase() as 'completed' | 'pending' | 'failed'
        })))
      }

      // Set categories (mock data for now)
      setCategories([
        { name: 'Food & Dining', amount: 1200, percentage: 35, color: '#374151', trend: 5 },
        { name: 'Transportation', amount: 800, percentage: 23, color: '#6b7280', trend: -2 },
        { name: 'Shopping', amount: 600, percentage: 18, color: '#9ca3af', trend: 8 },
        { name: 'Entertainment', amount: 400, percentage: 12, color: '#d1d5db', trend: -5 },
        { name: 'Utilities', amount: 300, percentage: 12, color: '#e5e7eb', trend: 1 }
      ])

      // Set metrics from dashboard data
      if (dashboardResponse.data) {
        setMetrics({
          totalBalance: dashboardResponse.data.balance,
          monthlyIncome: dashboardResponse.data.total_income || 3200,
          monthlyExpenses: dashboardResponse.data.total_expenses || 1850,
          savingsRate: 42.2,
          trends: {
            balance: 2.5,
            income: 8.2,
            expenses: -3.1,
            savings: 5.0
          }
        })
      }

      // Set AI insights (mock data for now)
      setAIInsights([
        {
          id: '1',
          type: 'spending',
          title: 'High Dining Expenses',
          description: 'Your dining expenses are 25% higher than similar users',
          impact: -15,
          confidence: 85
        },
        {
          id: '2',
          type: 'saving',
          title: 'Savings Goal Achievement',
          description: 'You\'re on track to reach your savings goal 2 months early',
          impact: 12,
          confidence: 92
        }
      ])
    } catch (err) {
      const errorMessage = 'Failed to load financial data. Please try again.'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, selectedPeriod])

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (!isMounted) return
      
      try {
        setIsLoading(true)
        setError(null)

        // Use API client for parallel requests
        const [transactionsResponse, dashboardResponse, analyticsResponse] = await Promise.all([
          apiClient.getTransactions({ limit: 50 }),
          apiClient.getDashboard(),
          apiClient.getCashFlowAnalysis({ period: 'monthly' })
        ])

        if (isMounted) {
          // Set transactions data
          if (transactionsResponse.data) {
            setTransactions(transactionsResponse.data.map(t => ({
              id: t.id,
              type: t.type === 'DEPOSIT' || t.type === 'TRANSFER' ? 'income' : 'expense',
              amount: t.amount,
              description: t.description,
              category: t.category || 'General',
              date: t.date,
              merchant: t.beneficiary || 'System',
              status: t.status.toLowerCase() as 'completed' | 'pending' | 'failed'
            })))
          }

          // Set categories (mock data for now)
          setCategories([
            { name: 'Food & Dining', amount: 1200, percentage: 35, color: '#374151', trend: 5 },
            { name: 'Transportation', amount: 800, percentage: 23, color: '#6b7280', trend: -2 },
            { name: 'Shopping', amount: 600, percentage: 18, color: '#9ca3af', trend: 8 },
            { name: 'Entertainment', amount: 400, percentage: 12, color: '#d1d5db', trend: -5 },
            { name: 'Utilities', amount: 300, percentage: 12, color: '#e5e7eb', trend: 1 }
          ])

          // Set metrics from dashboard data
          if (dashboardResponse.data) {
            setMetrics({
              totalBalance: dashboardResponse.data.balance,
              monthlyIncome: dashboardResponse.data.total_income || 3200,
              monthlyExpenses: dashboardResponse.data.total_expenses || 1850,
              savingsRate: 42.2,
              trends: {
                balance: 2.5,
                income: 8.2,
                expenses: -3.1,
                savings: 5.0
              }
            })
          }

          // Set AI insights (mock data for now)
          setAIInsights([
            {
              id: '1',
              type: 'spending',
              title: 'High Dining Expenses',
              description: 'Your dining expenses are 25% higher than similar users',
              impact: -15,
              confidence: 85
            },
            {
              id: '2',
              type: 'saving',
              title: 'Savings Goal Achievement',
              description: 'You\'re on track to reach your savings goal 2 months early',
              impact: 12,
              confidence: 92
            }
          ])
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = 'Failed to load financial data. Please try again.'
          setError(errorMessage)
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [toast])

  // Filter transactions based on search and category
  const filteredTransactions = useCallback(() => {
    let filtered = transactions

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(query) ||
        transaction.merchant.toLowerCase().includes(query)
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    return filtered
  }, [transactions, searchQuery, selectedCategory])

  const handleNewTransaction = async (formData: any) => {
    try {
      setIsLoading(true)
      // Add API call here
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "Transaction added successfully",
        duration: 3000
      })
      
      setShowNewTransactionDialog(false)
      fetchData() // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

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
      
      fetchData() // Refresh data
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
            onClick={fetchData}
            variant="outline"
            className="mt-4"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </Alert>
      </div>
    )
  }

  // Deposit modal state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-white pt-16 pb-4 px-3 sm:pt-20 sm:pb-6 sm:px-4">
          <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xs sm:text-base font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                  Finance Overview
                </h1>
                <p className="text-black/60 mt-1 text-xs sm:text-sm">
                  Track your income, expenses, and financial insights
                </p>
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
                  <span className="absolute top-1 right-1 h-2 w-2 bg-gray-500 rounded-full" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
        {/* AI Insights */}
        {showInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-gray-300 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-gray-500" />
                    <CardTitle>Financial Insights</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInsights(false)}
                  >
                    Hide
                  </Button>
                </div>
                <CardDescription>AI-powered financial recommendations</CardDescription>
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
                        <Card className="border-l-4 border-gray-800 dark:border-gray-200">
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
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-lg" />
            ))
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-black text-white border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-100">
                      Total Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${metrics?.totalBalance?.toLocaleString() || '0'}
                    </div>
                    <div className="flex items-center mt-1 text-gray-300">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        +{metrics?.trends?.balance || 0}% from last month
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="bg-gray-900 text-white border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-100">Monthly Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${metrics?.monthlyIncome?.toLocaleString() || '0'}
                    </div>
                    <div className="flex items-center mt-1 text-gray-300">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        +{metrics?.trends?.income || 0}% from last month
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="bg-gray-800 text-white border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-100">Monthly Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${metrics?.monthlyExpenses?.toLocaleString() || '0'}
                    </div>
                    <div className="flex items-center mt-1 text-gray-300">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        +{metrics?.trends?.expenses || 0}% from last month
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="bg-gray-700 text-white border-gray-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-100">Savings Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.savingsRate?.toFixed(1) || '0'}%
                    </div>
                    <div className="flex items-center mt-1 text-gray-300">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        +{metrics?.trends?.savings || 0}% from last month
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        {/* Financial Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>Track your income and expenses</CardDescription>
                </div>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData || []}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#374151" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#374151" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#6b7280" 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    name="Income"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#374151" 
                    fillOpacity={1} 
                    fill="url(#colorExpenses)" 
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Spending Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Spending Categories</CardTitle>
                  <CardDescription>Your spending breakdown by category</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(categories || []).map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-800 dark:bg-gray-200" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium dark:text-white">
                            {category.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ${category.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gray-800 dark:bg-gray-200"
                            initial={{ width: 0 }}
                            animate={{ width: `${category.percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{category.percentage}%</span>
                        <span className={cn(
                          "text-xs",
                          category.trend > 0 ? "text-gray-500" : "text-gray-500"
                        )}>
                          {category.trend > 0 ? '+' : ''}{category.trend}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
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
                  <Dialog open={showNewTransactionDialog} onOpenChange={setShowNewTransactionDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Transaction</DialogTitle>
                      </DialogHeader>
                      {/* Add transaction form */}
                    </DialogContent>
                  </Dialog>
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
                      {filteredTransactions().map((transaction, index) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.1 }}
                        >
                          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                transaction.type === 'income' 
                                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
                              )}>
                                {transaction.type === 'income' ? (
                                  <ArrowUpRight className="h-5 w-5" />
                                ) : (
                                  <ArrowDownRight className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium dark:text-white">
                                  {transaction.description}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {transaction.merchant} • {transaction.category}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={cn(
                                "font-medium",
                                transaction.type === 'income' 
                                  ? 'text-gray-600 dark:text-gray-400'
                                  : 'text-gray-600 dark:text-gray-400'
                              )}>
                                {transaction.type === 'income' ? '+' : '-'}
                                ${transaction.amount.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(transaction.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
          </div>
        </div>

        {/* Navigation Footer - Only show on mobile */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-2 lg:hidden">
          <div className="container mx-auto px-4">
            <nav className="grid grid-cols-5 gap-1 sm:gap-2">
              {[
                { icon: Home, label: 'Home', href: '/home' },
                { icon: BarChart2, label: 'Finance', active: true, href: '/finance' },
                { icon: CreditCard, label: 'Cards', href: '/cards' },
                { icon: PieChart, label: 'Investment', href: '/investment' },
                { icon: Settings, label: 'Settings', href: '/settings' }
              ].map((item, index) => (
                item.href ? (
                  <Link key={index} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full flex flex-col items-center py-1 sm:py-2 h-auto transition-colors ${
                        item.active
                          ? 'text-black dark:text-white font-bold bg-gray-100 dark:bg-gray-900'
                          : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                      }`}
                    >
                      <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-[10px] sm:text-xs mt-1">{item.label}</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`w-full flex flex-col items-center py-1 sm:py-2 h-auto transition-colors ${
                      item.active
                        ? 'text-black dark:text-white font-bold bg-gray-100 dark:bg-gray-900'
                        : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-[10px] sm:text-xs mt-1">{item.label}</span>
                  </Button>
                )
              ))}
            </nav>
          </div>
        </footer>

        {/* Deposit Modal */}
        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
