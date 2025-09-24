'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { useSavingsGoals } from '@/hooks/useSavingsGoals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/banking'
import { PiggyBank, Target, Clock, TrendingUp, AlertCircle, Plus, ChevronRight, Calculator, Repeat, Shield, Calendar, DollarSign } from 'lucide-react'

import { DepositModal } from '@/components/deposit-modal'
import { SectionFooter } from '@/components/ui/section-footer'
import { useTheme } from '@/contexts/ThemeContext'

interface SavingsAnalytics {
  totalSavings: number;
  monthlyGrowth: number;
  nextMilestone: number;
  projectedSavings: number;
  insights?: Array<{
    title: string;
    description: string;
  }>;
}

interface FixedDeposit {
  id: string;
  amount: number;
  term: number; // in months
  interestRate: number;
  startDate: Date;
  maturityDate: Date;
  status: 'ACTIVE' | 'MATURED' | 'CANCELLED';
  autoRenew: boolean;
  roundupEnabled: boolean;
}

interface AutomatedSaving {
  id: string;
  name: string;
  amount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  nextDeduction: Date;
  isActive: boolean;
  totalSaved: number;
}

export default function SavingsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const {
    savingsGoals,
    isLoading,
    error,
    fetchSavingsGoals,
    createSavingsGoal,
    calculateProgress
  } = useSavingsGoals()

  const [analytics, setAnalytics] = useState<SavingsAnalytics>({
    totalSavings: 0,
    monthlyGrowth: 0,
    nextMilestone: 0,
    projectedSavings: 0,
    insights: []
  })

  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isFixedDepositDialogOpen, setIsFixedDepositDialogOpen] = useState(false)
  const [isAutomatedSavingDialogOpen, setIsAutomatedSavingDialogOpen] = useState(false)
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([])
  const [automatedSavings, setAutomatedSavings] = useState<AutomatedSaving[]>([])
  const [activeTab, setActiveTab] = useState('active')

  const [newGoalForm, setNewGoalForm] = useState<{
    name: string;
    targetAmount: string;
    monthlyContribution: string;
    category: string;
    deadline: Date | null;
    isAutoSave: boolean;
  }>({
    name: '',
    targetAmount: '',
    monthlyContribution: '',
    category: '',
    deadline: null,
    isAutoSave: true,
  })

  // Fixed Deposit Form State
  const [fixedDepositForm, setFixedDepositForm] = useState({
    amount: '',
    term: '12', // months
    customTerm: '',
    termType: 'months', // 'months' or 'years'
    roundupEnabled: false,
    autoRenew: false,
  })

  // Automated Saving Form State
  const [automatedSavingForm, setAutomatedSavingForm] = useState({
    name: '',
    amount: '',
    frequency: 'MONTHLY' as 'DAILY' | 'WEEKLY' | 'MONTHLY',
    startDate: new Date(),
  })

  useEffect(() => {
    if (user) {
      fetchSavingsGoals()
    }
  }, [user, fetchSavingsGoals])

  // Calculate analytics when savings goals, fixed deposits, or automated savings change
  useEffect(() => {
    const goalsSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    const fdSavings = fixedDeposits.reduce((sum, fd) => sum + fd.amount, 0)
    const autoSavings = automatedSavings.reduce((sum, saving) => sum + saving.totalSaved, 0)
    const totalSavings = goalsSavings + fdSavings + autoSavings

    const goalsMonthlyGrowth = savingsGoals.reduce((sum, goal) => sum + (goal.autoSaveAmount || 0), 0)
    const autoMonthlyGrowth = automatedSavings
      .filter(saving => saving.isActive)
      .reduce((sum, saving) => {
        if (saving.frequency === 'DAILY') return sum + (saving.amount * 30)
        if (saving.frequency === 'WEEKLY') return sum + (saving.amount * 4.33)
        return sum + saving.amount
      }, 0)
    const monthlyGrowth = goalsMonthlyGrowth + autoMonthlyGrowth

    const nextMilestone = savingsGoals.length > 0 
      ? Math.min(...savingsGoals.map(goal => goal.targetAmount - goal.currentAmount).filter(diff => diff > 0)) || 0
      : 0
    
    const projectedSavings = totalSavings + (monthlyGrowth * 12)

    const insights = []
    if (monthlyGrowth > 0) {
      insights.push({
        title: 'Monthly Savings',
        description: `You're saving ${formatCurrency(monthlyGrowth)} per month across all accounts`
      })
    }
    if (fixedDeposits.length > 0) {
      insights.push({
        title: 'Fixed Deposit Returns',
        description: `${fixedDeposits.length} active fixed deposits`
      })
    }
    if (automatedSavings.filter(s => s.isActive).length > 0) {
      insights.push({
        title: 'Automated Savings',
        description: `${automatedSavings.filter(s => s.isActive).length} active automated savings plans`
      })
    }

    setAnalytics({
      totalSavings,
      monthlyGrowth,
      nextMilestone,
      projectedSavings,
      insights
    })
  }, [savingsGoals, fixedDeposits, automatedSavings])

  // Fixed Deposit Interest Calculation
  const calculateFixedDepositInterest = (amount: number, term: number, rate: number = 4.5) => {
    // Simple interest calculation: P * R * T / 100
    const interest = (amount * rate * (term / 12)) / 100
    const maturityAmount = amount + interest
    return { interest, maturityAmount, rate }
  }

  // Get interest rate based on term (longer terms get better rates)
  const getInterestRate = (termInMonths: number) => {
    if (termInMonths >= 60) return 5.5 // 5+ years
    if (termInMonths >= 36) return 5.0 // 3-5 years
    if (termInMonths >= 24) return 4.8 // 2-3 years
    if (termInMonths >= 12) return 4.5 // 1-2 years
    if (termInMonths >= 6) return 4.0  // 6-12 months
    return 3.5 // Less than 6 months
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-background pt-16 pb-4 px-3 sm:pt-20 sm:pb-6 sm:px-4 mb-20">
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xs sm:text-base font-bold text-foreground">
                Savings & Deposits
              </h1>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                Manage goals, fixed deposits, and automated savings
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="text-xs sm:text-sm">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Fixed Deposit
              </Button>
              <Button variant="outline" className="text-xs sm:text-sm">
                <Repeat className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Auto Save
              </Button>
              <Button className="text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                New Goal
              </Button>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Savings</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="text-xs sm:text-base font-bold">{formatCurrency(analytics.totalSavings)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Monthly Growth</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="text-xs sm:text-base font-bold">{formatCurrency(analytics.monthlyGrowth)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Next Milestone</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="text-xs sm:text-base font-bold">
                  {analytics?.nextMilestone ? formatCurrency(analytics.nextMilestone) : formatCurrency(0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Projected Savings</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="text-xs sm:text-base font-bold">{formatCurrency(analytics.projectedSavings)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
            <TabsList className="text-xs sm:text-sm grid w-full grid-cols-5">
              <TabsTrigger value="active" className="text-xs sm:text-sm">Goals</TabsTrigger>
              <TabsTrigger value="fixed-deposits" className="text-xs sm:text-sm">Fixed Deposits</TabsTrigger>
              <TabsTrigger value="automated" className="text-xs sm:text-sm">Auto Save</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed</TabsTrigger>
              <TabsTrigger value="insights" className="text-xs sm:text-sm">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Card>
                <CardContent className="p-6 text-center">
                  <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-sm font-medium mb-2">Savings Goals Coming Soon</h3>
                  <p className="text-xs text-muted-foreground">
                    Create and track your savings goals
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fixed-deposits">
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-sm font-medium mb-2">Fixed Deposits Coming Soon</h3>
                  <p className="text-xs text-muted-foreground">
                    Secure your savings with guaranteed returns
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automated">
              <Card>
                <CardContent className="p-6 text-center">
                  <Repeat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-sm font-medium mb-2">Automated Savings Coming Soon</h3>
                  <p className="text-xs text-muted-foreground">
                    Set up automatic transfers to build your savings
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-sm font-medium mb-2">No Completed Goals</h3>
                  <p className="text-xs text-muted-foreground">
                    Completed savings goals will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-base">Savings Insights</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Track your savings progress and get personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    {analytics?.insights?.map((insight: any, index: number) => (
                      <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                        <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-foreground">{insight.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
      />
      <SectionFooter section="main" activePage="/savings" />
    </div>
  )
}
