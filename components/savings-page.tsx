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
  Gift
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
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFinance } from '@/contexts/FinanceContext'
import { useSession } from 'next-auth/react'
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

// Add TypeScript interfaces for better type safety
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

// Add new interfaces for AI features
interface AIRecommendation {
  type: 'savings' | 'investment'
  title: string
  description: string
  confidence: number
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

export function SavingsPageComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
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
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false)
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
    if (session?.user) {
      fetchSavingsGoals()
      fetchAnalytics()
    }
  }, [session])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/savings/analytics')
      if (!response.ok) throw new Error('Failed to fetch analytics')

      const data = await response.json()
      setAnalytics(data.analytics)
      setRecommendations(data.recommendations)
      setInsights(data.insights)
      setGoalRecommendations(data.goalRecommendations)
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
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const renderGoalCard = (goal: SavingsGoal) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{goal.name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleInvestNow(goal.id)}>
              Invest Now
            </Button>
          </div>
          <CardDescription>{goal.category}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
            </div>
            <Progress value={goal.progress} className={getProgressColor(goal.progress)} />
            <div className="flex justify-between text-sm text-gray-500">
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
      // Implementation for investing in a goal
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

  const renderAnalytics = () => {
    if (!analytics) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.monthlyGrowth)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Projected Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.projectedSavings)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next Milestone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.nextMilestone)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Emergency</span>
                <span>{analytics.recommendedAllocation.emergency}%</span>
              </div>
              <div className="flex justify-between">
                <span>Investment</span>
                <span>{analytics.recommendedAllocation.investment}%</span>
              </div>
              <div className="flex justify-between">
                <span>Goals</span>
                <span>{analytics.recommendedAllocation.goals}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderRecommendations = () => (
    <div className="space-y-4 mb-8">
      <h3 className="text-lg font-semibold">AI Recommendations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-base">{rec.title}</CardTitle>
              <CardDescription>{rec.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span>Confidence</span>
                <span>{rec.confidence}%</span>
              </div>
              {rec.potentialReturn && (
                <div className="flex justify-between text-sm mt-2">
                  <span>Potential Return</span>
                  <span>{rec.potentialReturn}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const handleFeedback = async (insightId: string, isHelpful: boolean) => {
    try {
      // Implementation for submitting insight feedback
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
    <div className="space-y-4 mb-8">
      <h3 className="text-lg font-semibold">Behavior Insights</h3>
      {insights.map((insight) => (
        <Card key={insight.id}>
          <CardHeader>
            <CardTitle className="text-base">{insight.title}</CardTitle>
            <CardDescription>{insight.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Impact</span>
                <span>{insight.impact}%</span>
              </div>
              <div className="space-y-2">
                {insight.suggestedActions.map((action, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{action.action}</span>
                    <span>+{action.potentialImpact}%</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(insight.id, true)}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(insight.id, false)}
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
    <LayoutWrapper className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold dark:text-white">Savings</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                {savingsGoals.length} Goals
              </Badge>
            </div>
            <div className="flex items-center gap-3">
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
        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <CardTitle>AI Insights</CardTitle>
              </div>
              <CardDescription>Personalized recommendations for your savings</CardDescription>
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
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-gray-50 dark:bg-gray-800">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-blue-600 dark:text-blue-400">
                                {rec.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {rec.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="secondary">
                                  {rec.impact > 0 ? '+' : ''}{rec.impact}% Impact
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">AI Confidence:</span>
                                  <Progress value={rec.confidence} className="w-24" />
                                </div>
                              </div>
                            </div>
                            {rec.type === 'investment' && (
                              <Button
                                size="sm"
                                onClick={() => handleInvestNow(rec.id)}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                Invest Now
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
                  <Brain className="h-5 w-5 text-purple-500" />
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
                          <Badge variant="outline" className="text-purple-500">
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
                            className="bg-purple-500 hover:bg-purple-600 text-white"
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
                <Sparkles className="h-5 w-5 text-blue-500" />
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
                <CardTitle className="text-sm font-medium text-blue-100">Total Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(24000).toLocaleString()}</div>
                <div className="flex items-center mt-1 text-blue-100">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+{analytics?.monthlyGrowth}% from last month</span>
                </div>
                <div className="mt-2 text-xs text-blue-100">
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
                <CardTitle className="text-sm font-medium text-green-100">Monthly Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,600.00</div>
                <div className="flex items-center mt-1 text-green-100">
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
                <CardTitle className="text-sm font-medium text-purple-100">Active Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savingsGoals.length}</div>
                <div className="flex items-center mt-1 text-purple-100">
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
                <CardTitle className="text-sm font-medium text-orange-100">Auto-Save</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,600.00</div>
                <div className="flex items-center mt-1 text-orange-100">
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
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
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
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#colorTarget)" 
                    name="Target Amount"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
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
                <Sparkles className="h-5 w-5 text-yellow-500" />
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
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
