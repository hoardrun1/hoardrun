
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  ChevronRight,
  Bell,
  Settings,
  Download,
  Sparkles,
  Trophy,
  Clock,
  Rocket,
  Shield,
  Loader2,
  Info,
  Brain,
  RefreshCcw,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Wallet,
  Gem,
  Zap,
  BarChart3,
  Coins,
  TrendingDown,
  Gift,
  Lock,
  Calculator,
  DollarSign,
  Percent,
  CheckCircle,
  ArrowRight,
  Building,
  CreditCard
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { responsiveStyles as rs } from '@/styles/responsive-utilities'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type LucideIcon } from 'lucide-react'
import { type DialogProps } from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from '@/lib/api-client'
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFinance } from '@/contexts/FinanceContext'
import { useAuth } from '@/contexts/AuthContext'
import { useSavings } from '@/hooks/useSavings'
import { formatCurrency } from '@/lib/banking'
import { format } from 'date-fns'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { Confetti } from '@/components/ui/confetti'
import { HeatMap } from '@/components/ui/heat-map'

const savingsData = [
  { date: '2024-01', amount: 2000, target: 2500 },
  { date: '2024-02', amount: 4500, target: 5000 },
  { date: '2024-03', amount: 7200, target: 7500 },
  { date: '2024-04', amount: 9800, target: 10000 },
  { date: '2024-05', amount: 12500, target: 12500 },
  { date: '2024-06', amount: 15000, target: 15000 },
]

const savingsGoals = [
  {
    id: '1',
    name: 'Emergency Fund',
    currentAmount: 12500,
    targetAmount: 15000,
    deadline: '2024-12-31',
    category: 'Emergency',
    progress: 83,
    monthlyContribution: 500,
    isAutoSave: true
  },
  {
    id: '2',
    name: 'Dream Vacation',
    currentAmount: 3500,
    targetAmount: 5000,
    deadline: '2024-09-30',
    category: 'Travel',
    progress: 70,
    monthlyContribution: 300,
    isAutoSave: true
  },
  {
    id: '3',
    name: 'New Car',
    currentAmount: 8000,
    targetAmount: 20000,
    deadline: '2025-06-30',
    category: 'Vehicle',
    progress: 40,
    monthlyContribution: 800,
    isAutoSave: false
  }
]

const savingsTips = [
  {
    title: '50/30/20 Rule',
    description: 'Allocate 50% for needs, 30% for wants, and 20% for savings.',
    icon: PiggyBank
  },
  {
    title: 'Automate Savings',
    description: 'Set up automatic transfers to your savings account.',
    icon: Clock
  },
  {
    title: 'Set Clear Goals',
    description: 'Define specific savings goals with deadlines.',
    icon: Target
  },
  {
    title: 'Track Progress',
    description: 'Regularly monitor your savings progress.',
    icon: TrendingUp
  }
]

interface SavingsGoal {
  id: string
  name: string
  currentAmount: number
  targetAmount: number
  deadline: string
  category: string
  progress: number
  monthlyContribution: number
  isAutoSave: boolean
}

interface SavingsData {
  date: string
  amount: number
  target: number
}

interface SavingsTip {
  title: string
  description: string
  icon: LucideIcon
}

interface AIRecommendation {
  id: string
  type: 'savings' | 'investment'
  title: string
  description: string
  confidence: number
  impact?: number
  potentialReturn?: number
}

interface SavingsAnalytics {
  monthlyGrowth: number
  projectedSavings: number
  nextMilestone: number
  recommendedAllocation: {
    emergency: number
    investment: number
    goals: number
  }
}

interface NewGoalFormData {
  name: string
  targetAmount: string
  monthlyContribution: string
  category: string
  deadline: Date | null
  isAutoSave: boolean
  autoInvest: boolean
  investmentThreshold: string
}

interface AIGoalRecommendation {
  id: string
  name: string
  targetAmount: number
  suggestedMonthlyContribution: number
  reason: string
  confidence: number
  category: string
  timeframe: number
  riskLevel: 'low' | 'medium' | 'high'
  expectedReturn: number
}

interface AIBehaviorInsight {
  id: string
  type: 'spending' | 'saving' | 'investment'
  title: string
  description: string
  impact: number
  suggestedActions: {
    action: string
    potentialImpact: number
  }[]
  confidence: number
}

interface FixedDepositTerm {
  id: string
  duration: string
  months: number
  interestRate: number
  minAmount: number
  features: string[]
  popular?: boolean
}

interface FixedDeposit {
  id: string
  amount: number
  term: FixedDepositTerm
  startDate: Date
  maturityDate: Date
  interestEarned: number
  status: 'active' | 'matured' | 'pending'
  autoRenew: boolean
  saveToInvest: boolean
  investmentThreshold?: number
}

interface SaveToInvestOption {
  id: string
  name: string
  description: string
  riskLevel: 'Low' | 'Medium' | 'High'
  expectedReturn: number
  minAmount: number
  icon: any
}

export function SavingsPageComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const {
    savingsGoals,
    isLoading,
    error,
    fetchSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    calculateTotalSavings,
    calculateProgress,
  } = useSavings()

  const [analytics, setAnalytics] = useState<SavingsAnalytics | null>(null)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [insights, setInsights] = useState<AIBehaviorInsight[]>([])
  const [goalRecommendations, setGoalRecommendations] = useState<AIGoalRecommendation[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false)

  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([])
  const [isFixedDepositDialogOpen, setIsFixedDepositDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('goals')
  const [fdForm, setFdForm] = useState({
    amount: '',
    termId: '',
    autoRenew: false,
    saveToInvest: false,
    investmentOption: '',
    investmentThreshold: ''
  })

  const fixedDepositTerms: FixedDepositTerm[] = [
    {
      id: '3m',
      duration: '3 Months',
      months: 3,
      interestRate: 4.5,
      minAmount: 1000,
      features: ['Flexible withdrawal', 'Monthly interest payout option']
    },
    {
      id: '6m',
      duration: '6 Months',
      months: 6,
      interestRate: 5.2,
      minAmount: 1000,
      features: ['Higher returns', 'Quarterly interest payout'],
      popular: true
    },
    {
      id: '1y',
      duration: '1 Year',
      months: 12,
      interestRate: 6.1,
      minAmount: 2000,
      features: ['Best returns', 'Tax benefits', 'Auto-renewal option']
    },
    {
      id: '2y',
      duration: '2 Years',
      months: 24,
      interestRate: 6.8,
      minAmount: 5000,
      features: ['Premium returns', 'Compound interest', 'Investment ladder option']
    },
    {
      id: '3y',
      duration: '3 Years',
      months: 36,
      interestRate: 7.2,
      minAmount: 10000,
      features: ['Maximum returns', 'Tax optimization', 'Wealth building']
    }
  ]

  const saveToInvestOptions: SaveToInvestOption[] = [
    {
      id: 'conservative',
      name: 'Conservative Growth',
      description: 'Low-risk bonds and stable funds',
      riskLevel: 'Low',
      expectedReturn: 8.5,
      minAmount: 500,
      icon: Shield
    },
    {
      id: 'balanced',
      name: 'Balanced Portfolio',
      description: 'Mix of stocks and bonds for steady growth',
      riskLevel: 'Medium',
      expectedReturn: 12.3,
      minAmount: 1000,
      icon: BarChart3
    },
    {
      id: 'growth',
      name: 'Growth Focused',
      description: 'Equity-heavy portfolio for maximum returns',
      riskLevel: 'High',
      expectedReturn: 16.8,
      minAmount: 2000,
      icon: TrendingUp
    },
    {
      id: 'tech',
      name: 'Tech Innovation',
      description: 'Technology and innovation focused investments',
      riskLevel: 'High',
      expectedReturn: 18.2,
      minAmount: 2500,
      icon: Zap
    }
  ]

  const [newGoalForm, setNewGoalForm] = useState<NewGoalFormData>({
    name: '',
    targetAmount: '',
    monthlyContribution: '',
    category: '',
    deadline: null,
    isAutoSave: true,
    autoInvest: false,
    investmentThreshold: '',
  })

  useEffect(() => {
    if (user) {
      fetchSavingsGoals()
      fetchAnalytics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    try {
      const analyticsResponse = await apiClient.getCashFlowAnalysis({ period: 'monthly' })
      
      if (analyticsResponse.data) {
        setAnalytics({
          monthlyGrowth: 850,
          projectedSavings: 28000,
          nextMilestone: 30000,
          recommendedAllocation: {
            emergency: 40,
            investment: 35,
            goals: 25
          }
        })

        setRecommendations([
          {
            id: '1',
            type: 'savings',
            title: 'Increase Emergency Fund',
            description: 'Consider boosting your emergency fund to 6 months of expenses',
            confidence: 85,
            impact: 15
          },
          {
            id: '2',
            type: 'investment',
            title: 'Diversify Portfolio',
            description: 'Add some low-risk bonds to balance your investment portfolio',
            confidence: 78,
            potentialReturn: 8
          }
        ])

        setInsights([
          {
            id: '1',
            type: 'saving',
            title: 'Consistent Saver',
            description: 'You\'ve maintained consistent savings for 6 months',
            impact: 12,
            suggestedActions: [
              { action: 'Increase monthly contribution by 10%', potentialImpact: 8 },
              { action: 'Set up automatic investment', potentialImpact: 15 }
            ],
            confidence: 92
          }
        ])

        setGoalRecommendations([
          {
            id: '1',
            name: 'Retirement Boost',
            targetAmount: 50000,
            suggestedMonthlyContribution: 800,
            reason: 'Based on your age and income, this will help secure your retirement',
            confidence: 88,
            category: 'Retirement',
            timeframe: 5,
            riskLevel: 'medium',
            expectedReturn: 7.5
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch savings analytics',
        variant: 'destructive',
      })
    }
  }

  const calculateTimeLeft = (deadline: string) => {
    const timeLeft = new Date(deadline).getTime() - new Date().getTime()
    const days = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} days left` : 'Deadline passed'
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-gray-500'
    if (progress >= 50) return 'bg-gray-500'
    return 'bg-gray-500'
  }

  const renderGoalCard = (goal: SavingsGoal) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg truncate">{goal.name}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{goal.category}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleInvestNow(goal.id)} className="text-xs sm:text-sm h-8 px-2 sm:px-3">
              Invest
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Progress</span>
              <span className="font-medium">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
            </div>
            <Progress value={goal.progress} className={getProgressColor(goal.progress)} />
            <div className="flex justify-between text-xs sm:text-sm text-gray-500">
              <span>Monthly: {formatCurrency(goal.monthlyContribution)}</span>
              <span>{calculateTimeLeft(goal.deadline)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const handleInvestNow = async (goalId: string) => {
    try {
      toast({
        title: 'Success',
        description: 'Investment initiated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate investment',
        variant: 'destructive',
      })
    }
  }

  const handleCreateGoal = async () => {
    try {
      if (!newGoalForm.name || !newGoalForm.targetAmount || !newGoalForm.monthlyContribution) {
        throw new Error('Please fill in all required fields')
      }

      const goalData = {
        name: newGoalForm.name,
        targetAmount: parseFloat(newGoalForm.targetAmount),
        monthlyContribution: parseFloat(newGoalForm.monthlyContribution),
        category: newGoalForm.category || 'General',
        deadline: newGoalForm.deadline?.toISOString() || new Date(Date.now() + 31536000000).toISOString(),
        isAutoSave: newGoalForm.isAutoSave,
      }

      await createSavingsGoal(goalData)
      setIsNewGoalDialogOpen(false)
      setNewGoalForm({
        name: '',
        targetAmount: '',
        monthlyContribution: '',
        category: '',
        deadline: null,
        isAutoSave: true,
        autoInvest: false,
        investmentThreshold: '',
      })

      toast({
        title: 'Success',
        description: 'Savings goal created successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create savings goal',
        variant: 'destructive',
      })
    }
  }

  const handleCreateFixedDeposit = async () => {
    try {
      if (!fdForm.amount || !fdForm.termId) {
        throw new Error('Please fill in all required fields')
      }

      const selectedTerm = fixedDepositTerms.find(term => term.id === fdForm.termId)
      if (!selectedTerm) {
        throw new Error('Invalid term selected')
      }

      const amount = parseFloat(fdForm.amount)
      if (amount < selectedTerm.minAmount) {
        throw new Error(`Minimum amount for this term is $${selectedTerm.minAmount}`)
      }

      const startDate = new Date()
      const maturityDate = new Date()
      maturityDate.setMonth(maturityDate.getMonth() + selectedTerm.months)

      const interestEarned = (amount * selectedTerm.interestRate * selectedTerm.months) / (12 * 100)

      const newFixedDeposit: FixedDeposit = {
        id: `fd_${Date.now()}`,
        amount,
        term: selectedTerm,
        startDate,
        maturityDate,
        interestEarned,
        status: 'active',
        autoRenew: fdForm.autoRenew,
        saveToInvest: fdForm.saveToInvest,
        investmentThreshold: fdForm.investmentThreshold ? parseFloat(fdForm.investmentThreshold) : undefined
      }

      setFixedDeposits(prev => [...prev, newFixedDeposit])
      setIsFixedDepositDialogOpen(false)
      setFdForm({
        amount: '',
        termId: '',
        autoRenew: false,
        saveToInvest: false,
        investmentOption: '',
        investmentThreshold: ''
      })

      toast({
        title: 'Success',
        description: 'Fixed deposit created successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create fixed deposit',
        variant: 'destructive',
      })
    }
  }

  const calculateMaturityAmount = (amount: number, term: FixedDepositTerm) => {
    const interest = (amount * term.interestRate * term.months) / (12 * 100)
    return amount + interest
  }

  const handleFeedback = async (insightId: string, isHelpful: boolean) => {
    try {
      toast({
        title: 'Thank you',
        description: 'Your feedback helps improve our recommendations',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      })
    }
  }

  const handleCreateRecommendedGoal = async (recommendation: AIGoalRecommendation) => {
    try {
      const goalData = {
        name: recommendation.name,
        targetAmount: recommendation.targetAmount,
        monthlyContribution: recommendation.suggestedMonthlyContribution,
        category: recommendation.category,
        deadline: new Date(Date.now() + (recommendation.timeframe * 31536000000)).toISOString(),
        isAutoSave: true,
      }

      await createSavingsGoal(goalData)
      toast({
        title: 'Success',
        description: 'Recommended goal created successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create recommended goal',
        variant: 'destructive',
      })
    }
  }

  const renderInsights = () => (
    <div className="space-y-3 sm:space-y-4">
      {insights.map((insight) => (
        <Card key={insight.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">{insight.title}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{insight.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Impact</span>
                <span className="font-medium">{insight.impact}%</span>
              </div>
              <div className="space-y-2">
                {insight.suggestedActions.map((action, index) => (
                  <div key={index} className="flex justify-between text-xs sm:text-sm gap-2">
                    <span className="flex-1">{action.action}</span>
                    <span className="font-medium whitespace-nowrap">+{action.potentialImpact}%</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(insight.id, true)}
                  className="h-8 w-8 p-0"
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(insight.id, false)}
                  className="h-8 w-8 p-0"
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <LayoutWrapper className="bg-background min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-lg sm:text-xl font-semibold dark:text-white">Savings</h1>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400 text-xs sm:text-sm">
                {savingsGoals.length} Goals
              </Badge>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-gray-500 rounded-full" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-blue-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <CardTitle className="text-base sm:text-lg">AI Insights</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">Personalized recommendations for your savings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              {isLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 sm:h-24 w-full" />
                  ))}
                </div>
              ) : (
                <AnimatePresence>
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-gray-50 dark:bg-gray-800">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                                {rec.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {rec.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                                {rec.impact !== undefined && (
                                  <Badge variant="secondary" className="text-xs">
                                    {rec.impact > 0 ? '+' : ''}{rec.impact}% Impact
                                  </Badge>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 whitespace-nowrap">AI Confidence:</span>
                                  <Progress value={rec.confidence} className="w-16 sm:w-24" />
                                </div>
                              </div>
                            </div>
                            {rec.type === 'investment' && (
                              <Button
                                size="sm"
                                onClick={() => handleInvestNow(rec.id)}
                                className="bg-gray-500 hover:bg-gray-600 text-xs h-8 px-2 sm:px-3 whitespace-nowrap"
                              >
                                Invest
                              </Button>
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

        {/* AI Goal Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-gray-500" />
                  <CardTitle>AI-Recommended Goals</CardTitle>
                </div>
              </div>
              <CardDescription>Personalized savings goals based on your profile and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {goalRecommendations.map((recommendation) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative"
                >
                  <Card className="border-l-4 border-purple-500">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{recommendation.name}</h3>
                            <p className="text-sm text-gray-500">{recommendation.reason}</p>
                          </div>
                          <Badge variant="outline" className="text-gray-500">
                            {recommendation.confidence}% Match
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Target Amount</div>
                            <div className="font-medium">${recommendation.targetAmount.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Monthly Contribution</div>
                            <div className="font-medium">${recommendation.suggestedMonthlyContribution.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Timeframe</div>
                            <div className="font-medium">{recommendation.timeframe} years</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Expected Return</div>
                            <div className="font-medium">{recommendation.expectedReturn}%</div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFeedback(recommendation.id, false)}
                            className="text-gray-500"
                          >
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCreateRecommendedGoal(recommendation)}
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                          >
                            Create Goal
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Behavior Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-2 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gray-500" />
                <CardTitle>Behavior Insights</CardTitle>
              </div>
              <CardDescription>AI-powered analysis of your saving and spending patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderInsights()}
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings Overview with AI Analytics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-100">Total Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(24000).toLocaleString()}</div>
                <div className="flex items-center mt-1 text-gray-100">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+{analytics?.monthlyGrowth}% from last month</span>
                </div>
                <div className="mt-2 text-xs text-gray-100">
                  Next milestone: ${analytics?.nextMilestone.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-100">Monthly Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,600.00</div>
                <div className="flex items-center mt-1 text-gray-100">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+8% from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-100">Active Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savingsGoals.length}</div>
                <div className="flex items-center mt-1 text-gray-100">
                  <Target className="h-4 w-4 mr-1" />
                  <span className="text-sm">On track</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-100">Auto-Save</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,600.00</div>
                <div className="flex items-center mt-1 text-gray-100">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">Monthly</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Savings Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Savings Progress</CardTitle>
                  <CardDescription>Track your savings journey</CardDescription>
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
                <AreaChart data={savingsData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                    name="Current Amount"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#6b7280" 
                    fillOpacity={1} 
                    fill="url(#colorTarget)" 
                    name="Target Amount"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings & Fixed Deposits Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Savings Goals
              </TabsTrigger>
              <TabsTrigger value="fixed-deposits" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Fixed Deposits
              </TabsTrigger>
            </TabsList>

            {/* Savings Goals Tab */}
            <TabsContent value="goals">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold dark:text-white">Savings Goals</h2>
                <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Savings Goal</DialogTitle>
                  <DialogDescription>
                    Set up a new savings goal with regular contributions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Goal Name</Label>
                    <Input
                      id="name"
                      value={newGoalForm.name}
                      onChange={(e) => setNewGoalForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={newGoalForm.targetAmount}
                      onChange={(e) => setNewGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                    <Input
                      id="monthlyContribution"
                      type="number"
                      value={newGoalForm.monthlyContribution}
                      onChange={(e) => setNewGoalForm(prev => ({ ...prev, monthlyContribution: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newGoalForm.category}
                      onValueChange={(value) => setNewGoalForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Emergency">Emergency Fund</SelectItem>
                        <SelectItem value="Retirement">Retirement</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoSave"
                      checked={newGoalForm.isAutoSave}
                      onCheckedChange={(checked) => setNewGoalForm(prev => ({ ...prev, isAutoSave: checked }))}
                    />
                    <Label htmlFor="autoSave">Enable Auto-Save</Label>
                  </div>
                  <Button onClick={handleCreateGoal} className="w-full">
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {savingsGoals.map((goal) => renderGoalCard(goal))}
              </div>
            </TabsContent>

            {/* Fixed Deposits Tab */}
            <TabsContent value="fixed-deposits">
              <div className="space-y-6">
                {/* Fixed Deposit Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold dark:text-white">Fixed Deposits</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Secure your savings with guaranteed returns
                    </p>
                  </div>
                  <Dialog open={isFixedDepositDialogOpen} onOpenChange={setIsFixedDepositDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Fixed Deposit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Create Fixed Deposit</DialogTitle>
                        <DialogDescription>
                          Choose your deposit amount and term for guaranteed returns
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 py-4">
                        {/* Amount Input */}
                        <div className="space-y-2">
                          <Label htmlFor="fd-amount">Deposit Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="fd-amount"
                              type="number"
                              placeholder="Enter amount"
                              value={fdForm.amount}
                              onChange={(e) => setFdForm(prev => ({ ...prev, amount: e.target.value }))}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        {/* Term Selection */}
                        <div className="space-y-3">
                          <Label>Select Term</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {fixedDepositTerms.map((term) => (
                              <Card
                                key={term.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                  fdForm.termId === term.id
                                    ? 'ring-2 ring-primary border-primary'
                                    : 'hover:border-primary/50'
                                } ${term.popular ? 'border-orange-200 bg-orange-50/50' : ''}`}
                                onClick={() => setFdForm(prev => ({ ...prev, termId: term.id }))}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold">{term.duration}</h3>
                                    {term.popular && (
                                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Percent className="h-4 w-4 text-green-600" />
                                      <span className="text-lg font-bold text-green-600">
                                        {term.interestRate}% p.a.
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Min: ${term.minAmount.toLocaleString()}
                                    </p>
                                    {fdForm.amount && fdForm.termId === term.id && (
                                      <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                        <p className="text-sm font-medium text-green-800">
                                          Maturity Amount: ${calculateMaturityAmount(parseFloat(fdForm.amount), term).toLocaleString()}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="auto-renew"
                              checked={fdForm.autoRenew}
                              onCheckedChange={(checked) => setFdForm(prev => ({ ...prev, autoRenew: checked }))}
                            />
                            <Label htmlFor="auto-renew" className="text-sm">
                              Auto-renew at maturity
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="save-to-invest"
                              checked={fdForm.saveToInvest}
                              onCheckedChange={(checked) => setFdForm(prev => ({ ...prev, saveToInvest: checked }))}
                            />
                            <Label htmlFor="save-to-invest" className="text-sm">
                              Enable "Save to Invest" at maturity
                            </Label>
                          </div>

                          {fdForm.saveToInvest && (
                            <div className="ml-6 space-y-3 p-4 bg-blue-50 rounded-lg">
                              <Label className="text-sm font-medium">Investment Options</Label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {saveToInvestOptions.map((option) => {
                                  const Icon = option.icon
                                  return (
                                    <Card
                                      key={option.id}
                                      className={`cursor-pointer transition-all hover:shadow-sm ${
                                        fdForm.investmentOption === option.id
                                          ? 'ring-2 ring-blue-500 border-blue-500'
                                          : 'hover:border-blue-300'
                                      }`}
                                      onClick={() => setFdForm(prev => ({ ...prev, investmentOption: option.id }))}
                                    >
                                      <CardContent className="p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Icon className="h-4 w-4 text-blue-600" />
                                          <span className="font-medium text-sm">{option.name}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                          {option.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                          <Badge
                                            variant={option.riskLevel === 'Low' ? 'secondary' : option.riskLevel === 'Medium' ? 'default' : 'destructive'}
                                            className="text-xs"
                                          >
                                            {option.riskLevel} Risk
                                          </Badge>
                                          <span className="text-xs font-medium text-green-600">
                                            {option.expectedReturn}% return
                                          </span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )
                                })}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="investment-threshold" className="text-sm">
                                  Investment Threshold (Optional)
                                </Label>
                                <Input
                                  id="investment-threshold"
                                  type="number"
                                  placeholder="Minimum amount to invest"
                                  value={fdForm.investmentThreshold}
                                  onChange={(e) => setFdForm(prev => ({ ...prev, investmentThreshold: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Only invest if maturity amount exceeds this threshold
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFixedDepositDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateFixedDeposit}>
                          Create Fixed Deposit
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Fixed Deposits Summary */}
                {fixedDeposits.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calculator className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Total Deposits</span>
                        </div>
                        <p className="text-2xl font-bold">
                          ${fixedDeposits.reduce((sum, fd) => sum + fd.amount, 0).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Expected Returns</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          ${fixedDeposits.reduce((sum, fd) => sum + fd.interestEarned, 0).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Maturity Value</span>
                        </div>
                        <p className="text-2xl font-bold">
                          ${fixedDeposits.reduce((sum, fd) => sum + fd.amount + fd.interestEarned, 0).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Fixed Deposits Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {fixedDeposits.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Fixed Deposits Yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                          Start securing your savings with guaranteed returns
                        </p>
                        <Button onClick={() => setIsFixedDepositDialogOpen(true)}>
                          Create Your First Fixed Deposit
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    fixedDeposits.map((fd) => (
                      <Card key={fd.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Lock className="h-5 w-5 text-green-600" />
                              <span className="font-semibold">{fd.term.duration}</span>
                            </div>
                            <Badge
                              variant={fd.status === 'active' ? 'default' : fd.status === 'matured' ? 'secondary' : 'outline'}
                            >
                              {fd.status}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Principal Amount</p>
                              <p className="text-2xl font-bold">${fd.amount.toLocaleString()}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Interest Rate</p>
                                <p className="font-semibold text-green-600">{fd.term.interestRate}% p.a.</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Maturity Amount</p>
                                <p className="font-semibold">${(fd.amount + fd.interestEarned).toLocaleString()}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">Maturity Date</p>
                              <p className="font-medium">{fd.maturityDate.toLocaleDateString()}</p>
                            </div>

                            {fd.saveToInvest && (
                              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                <ArrowRight className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-800">Save to Invest enabled</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Savings Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gray-500" />
                <CardTitle>Smart Savings Tips</CardTitle>
              </div>
              <CardDescription>Expert advice to boost your savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {savingsTips.map((tip, index) => {
                  const Icon = tip.icon
                  return (
                    <Card key={index} className="bg-gray-50 dark:bg-gray-800 border-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4">
                            <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                          </div>
                          <h3 className="font-medium mb-2 dark:text-white">{tip.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{tip.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </LayoutWrapper>
  )
}
