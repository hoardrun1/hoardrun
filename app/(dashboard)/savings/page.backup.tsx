'use client'

import { useState, useEffect } from 'react'
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
      const totalFDInterest = fixedDeposits.reduce((sum, fd) => {
        const { interest } = calculateFixedDepositInterest(fd.amount, fd.term, fd.interestRate)
        return sum + interest
      }, 0)
      insights.push({
        title: 'Fixed Deposit Returns',
        description: `Expected to earn ${formatCurrency(totalFDInterest)} from fixed deposits`
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
        deadline: (newGoalForm.deadline instanceof Date)
          ? newGoalForm.deadline.toISOString()
          : new Date(Date.now() + 31536000000).toISOString(),
        isAutoSave: newGoalForm.isAutoSave,
      }

      // Create savings goal functionality would go here
      console.log('Creating savings goal:', goalData)
      setIsNewGoalDialogOpen(false)
      setNewGoalForm({
        name: '',
        targetAmount: '',
        monthlyContribution: '',
        category: '',
        deadline: null,
        isAutoSave: true,
      })
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create savings goal',
        variant: 'destructive',
      })
    }
  }

  // Handle Fixed Deposit Creation
  const handleCreateFixedDeposit = async () => {
    try {
      const amount = parseFloat(fixedDepositForm.amount)
      if (!amount || amount < 1000) {
        throw new Error('Minimum deposit amount is $1,000')
      }

      let termInMonths: number
      if (fixedDepositForm.term === 'custom') {
        const customTerm = parseFloat(fixedDepositForm.customTerm)
        if (!customTerm || customTerm <= 0) {
          throw new Error('Please enter a valid term')
        }
        termInMonths = fixedDepositForm.termType === 'years' ? customTerm * 12 : customTerm
      } else {
        termInMonths = parseInt(fixedDepositForm.term)
      }

      if (termInMonths < 1 || termInMonths > 120) {
        throw new Error('Term must be between 1 month and 10 years')
      }

      const interestRate = getInterestRate(termInMonths)
      const startDate = new Date()
      const maturityDate = new Date(startDate)
      maturityDate.setMonth(maturityDate.getMonth() + termInMonths)

      const newFixedDeposit: FixedDeposit = {
        id: `fd_${Date.now()}`,
        amount,
        term: termInMonths,
        interestRate,
        startDate,
        maturityDate,
        status: 'ACTIVE',
        autoRenew: fixedDepositForm.autoRenew,
        roundupEnabled: fixedDepositForm.roundupEnabled,
      }

      setFixedDeposits(prev => [...prev, newFixedDeposit])
      setIsFixedDepositDialogOpen(false)
      setFixedDepositForm({
        amount: '',
        term: '12',
        customTerm: '',
        termType: 'months',
        roundupEnabled: false,
        autoRenew: false,
      })

      addToast({
        title: 'Success',
        description: `Fixed deposit of ${formatCurrency(amount)} created successfully`,
      })
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create fixed deposit',
        variant: 'destructive',
      })
    }
  }

  // Handle Automated Saving Creation
  const handleCreateAutomatedSaving = async () => {
    try {
      const amount = parseFloat(automatedSavingForm.amount)
      if (!amount || amount < 1) {
        throw new Error('Please enter a valid amount')
      }

      if (!automatedSavingForm.name.trim()) {
        throw new Error('Please enter a name for your automated saving')
      }

      const nextDeduction = new Date(automatedSavingForm.startDate)
      if (automatedSavingForm.frequency === 'DAILY') {
        nextDeduction.setDate(nextDeduction.getDate() + 1)
      } else if (automatedSavingForm.frequency === 'WEEKLY') {
        nextDeduction.setDate(nextDeduction.getDate() + 7)
      } else {
        nextDeduction.setMonth(nextDeduction.getMonth() + 1)
      }

      const newAutomatedSaving: AutomatedSaving = {
        id: `as_${Date.now()}`,
        name: automatedSavingForm.name.trim(),
        amount,
        frequency: automatedSavingForm.frequency,
        nextDeduction,
        isActive: true,
        totalSaved: 0,
      }

      setAutomatedSavings(prev => [...prev, newAutomatedSaving])
      setIsAutomatedSavingDialogOpen(false)
      setAutomatedSavingForm({
        name: '',
        amount: '',
        frequency: 'MONTHLY',
        startDate: new Date(),
      })

      addToast({
        title: 'Success',
        description: `Automated saving "${newAutomatedSaving.name}" created successfully`,
      })
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create automated saving',
        variant: 'destructive',
      })
    }
  }

  const renderGoalCard = (goal: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={goal.id}
    >
      <Card className="mb-3 sm:mb-4">
        <CardHeader className="p-3 sm:p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xs sm:text-base">{goal.name}</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
              Contribute
            </Button>
          </div>
          <CardDescription className="text-xs sm:text-sm">{goal.category}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Progress</span>
              <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
            </div>
            <Progress value={goal.progress} className="h-1.5 sm:h-2" />
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>Monthly: {formatCurrency(goal.monthlyContribution)}</span>
              <span>{goal.daysLeft} days left</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderAnalytics = () => {
    if (!analytics) return null

    return (
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
    )
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
            <Dialog open={isFixedDepositDialogOpen} onOpenChange={setIsFixedDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-xs sm:text-sm">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Fixed Deposit
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={isAutomatedSavingDialogOpen} onOpenChange={setIsAutomatedSavingDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-xs sm:text-sm">
                  <Repeat className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Auto Save
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="text-xs sm:text-sm">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xs sm:text-base">Create New Savings Goal</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Set up a new savings goal with regular contributions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="name" className="text-xs sm:text-sm">Goal Name</Label>
                <Input
                  id="name"
                  className="text-xs sm:text-sm"
                  value={newGoalForm.name}
                  onChange={(e) => setNewGoalForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="targetAmount" className="text-xs sm:text-sm">Target Amount</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  className="text-xs sm:text-sm"
                  value={newGoalForm.targetAmount}
                  onChange={(e) => setNewGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="monthlyContribution" className="text-xs sm:text-sm">Monthly Contribution</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  className="text-xs sm:text-sm"
                  value={newGoalForm.monthlyContribution}
                  onChange={(e) => setNewGoalForm(prev => ({ ...prev, monthlyContribution: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-xs sm:text-sm">Category</Label>
                <Select
                  value={newGoalForm.category}
                  onValueChange={(value) => setNewGoalForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
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
                <Label htmlFor="autoSave" className="text-xs sm:text-sm">Enable Auto-Save</Label>
              </div>
              <Button onClick={handleCreateGoal} className="w-full text-xs sm:text-sm">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {renderAnalytics()}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
        <TabsList className="text-xs sm:text-sm grid w-full grid-cols-5">
          <TabsTrigger value="active" className="text-xs sm:text-sm">Goals</TabsTrigger>
          <TabsTrigger value="fixed-deposits" className="text-xs sm:text-sm">Fixed Deposits</TabsTrigger>
          <TabsTrigger value="automated" className="text-xs sm:text-sm">Auto Save</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs sm:text-sm">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-3 sm:space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              savingsGoals
                .filter(goal => goal.status === 'ACTIVE')
                .map(goal => renderGoalCard(goal))
            )}
          </div>
        </TabsContent>

        <TabsContent value="fixed-deposits">
          <div className="space-y-3 sm:space-y-4">
            {/* Fixed Deposit Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Fixed Deposits</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Secure your savings with guaranteed returns
                </p>
              </div>
              <Dialog open={isFixedDepositDialogOpen} onOpenChange={setIsFixedDepositDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="text-xs sm:text-sm">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    New FD
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-sm sm:text-base">Create Fixed Deposit</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      Lock in your savings for guaranteed returns
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Amount Input */}
                    <div>
                      <Label htmlFor="fd-amount" className="text-xs sm:text-sm">Deposit Amount</Label>
                      <Input
                        id="fd-amount"
                        type="number"
                        placeholder="Minimum $1,000"
                        className="text-xs sm:text-sm"
                        value={fixedDepositForm.amount}
                        onChange={(e) => setFixedDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>

                    {/* Term Selection */}
                    <div>
                      <Label className="text-xs sm:text-sm">Deposit Term</Label>
                      <Select
                        value={fixedDepositForm.term}
                        onValueChange={(value) => setFixedDepositForm(prev => ({ ...prev, term: value }))}
                      >
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Month (3.5% APY)</SelectItem>
                          <SelectItem value="3">3 Months (3.8% APY)</SelectItem>
                          <SelectItem value="6">6 Months (4.0% APY)</SelectItem>
                          <SelectItem value="12">1 Year (4.5% APY)</SelectItem>
                          <SelectItem value="24">2 Years (4.8% APY)</SelectItem>
                          <SelectItem value="36">3 Years (5.0% APY)</SelectItem>
                          <SelectItem value="60">5 Years (5.5% APY)</SelectItem>
                          <SelectItem value="custom">Custom Term</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom Term Input */}
                    {fixedDepositForm.term === 'custom' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            type="number"
                            placeholder="Duration"
                            className="text-xs sm:text-sm"
                            value={fixedDepositForm.customTerm}
                            onChange={(e) => setFixedDepositForm(prev => ({ ...prev, customTerm: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Select
                            value={fixedDepositForm.termType}
                            onValueChange={(value: 'months' | 'years') => setFixedDepositForm(prev => ({ ...prev, termType: value }))}
                          >
                            <SelectTrigger className="text-xs sm:text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="months">Months</SelectItem>
                              <SelectItem value="years">Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Interest Calculation Preview */}
                    {fixedDepositForm.amount && (
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-xs sm:text-sm font-medium mb-2">Interest Calculation</div>
                        {(() => {
                          const amount = parseFloat(fixedDepositForm.amount) || 0
                          let termInMonths = 0
                          if (fixedDepositForm.term === 'custom') {
                            const customTerm = parseFloat(fixedDepositForm.customTerm) || 0
                            termInMonths = fixedDepositForm.termType === 'years' ? customTerm * 12 : customTerm
                          } else {
                            termInMonths = parseInt(fixedDepositForm.term) || 0
                          }
                          const rate = getInterestRate(termInMonths)
                          const { interest, maturityAmount } = calculateFixedDepositInterest(amount, termInMonths, rate)

                          return (
                            <div className="space-y-1 text-xs sm:text-sm">
                              <div className="flex justify-between">
                                <span>Principal:</span>
                                <span>{formatCurrency(amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Interest Rate:</span>
                                <span>{rate}% APY</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Interest Earned:</span>
                                <span className="text-green-600">{formatCurrency(interest)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-semibold">
                                <span>Maturity Amount:</span>
                                <span className="text-green-600">{formatCurrency(maturityAmount)}</span>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}

                    {/* Options */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="roundup"
                          checked={fixedDepositForm.roundupEnabled}
                          onCheckedChange={(checked) => setFixedDepositForm(prev => ({ ...prev, roundupEnabled: checked }))}
                        />
                        <Label htmlFor="roundup" className="text-xs sm:text-sm">Enable Roundup Savings</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="autoRenew"
                          checked={fixedDepositForm.autoRenew}
                          onCheckedChange={(checked) => setFixedDepositForm(prev => ({ ...prev, autoRenew: checked }))}
                        />
                        <Label htmlFor="autoRenew" className="text-xs sm:text-sm">Auto-renew at maturity</Label>
                      </div>
                    </div>

                    <Button onClick={handleCreateFixedDeposit} className="w-full text-xs sm:text-sm">
                      Create Fixed Deposit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Fixed Deposits List */}
            <div className="space-y-3">
              {fixedDeposits.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-sm font-medium mb-2">No Fixed Deposits Yet</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Start earning guaranteed returns with fixed deposits
                    </p>
                    <Button
                      onClick={() => setIsFixedDepositDialogOpen(true)}
                      className="text-xs"
                    >
                      Create Your First FD
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                fixedDeposits.map((fd) => (
                  <motion.div
                    key={fd.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="p-3 sm:p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xs sm:text-base">
                              Fixed Deposit #{fd.id.slice(-4)}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              {fd.term} months • {fd.interestRate}% APY
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-xs sm:text-sm font-semibold">
                              {formatCurrency(fd.amount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {fd.status}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Maturity Date:</span>
                            <span>{fd.maturityDate.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Expected Return:</span>
                            <span className="text-green-600">
                              {formatCurrency(calculateFixedDepositInterest(fd.amount, fd.term, fd.interestRate).maturityAmount)}
                            </span>
                          </div>
                          {fd.roundupEnabled && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <DollarSign className="h-3 w-3 mr-1" />
                              Roundup savings enabled
                            </div>
                          )}
                          {fd.autoRenew && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Repeat className="h-3 w-3 mr-1" />
                              Auto-renewal enabled
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="automated">
          <div className="space-y-3 sm:space-y-4">
            {/* Automated Savings Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Automated Savings</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Set up automatic transfers to build your savings effortlessly
                </p>
              </div>
              <Dialog open={isAutomatedSavingDialogOpen} onOpenChange={setIsAutomatedSavingDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="text-xs sm:text-sm">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    New Auto Save
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-sm sm:text-base">Create Automated Saving</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      Set up regular automatic transfers to your savings
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Name Input */}
                    <div>
                      <Label htmlFor="as-name" className="text-xs sm:text-sm">Saving Name</Label>
                      <Input
                        id="as-name"
                        placeholder="e.g., Emergency Fund, Vacation"
                        className="text-xs sm:text-sm"
                        value={automatedSavingForm.name}
                        onChange={(e) => setAutomatedSavingForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    {/* Amount Input */}
                    <div>
                      <Label htmlFor="as-amount" className="text-xs sm:text-sm">Amount per Transfer</Label>
                      <Input
                        id="as-amount"
                        type="number"
                        placeholder="Enter amount"
                        className="text-xs sm:text-sm"
                        value={automatedSavingForm.amount}
                        onChange={(e) => setAutomatedSavingForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>

                    {/* Frequency Selection */}
                    <div>
                      <Label className="text-xs sm:text-sm">Transfer Frequency</Label>
                      <Select
                        value={automatedSavingForm.frequency}
                        onValueChange={(value: 'DAILY' | 'WEEKLY' | 'MONTHLY') =>
                          setAutomatedSavingForm(prev => ({ ...prev, frequency: value }))
                        }
                      >
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAILY">Daily</SelectItem>
                          <SelectItem value="WEEKLY">Weekly</SelectItem>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Start Date */}
                    <div>
                      <Label htmlFor="as-start-date" className="text-xs sm:text-sm">Start Date</Label>
                      <Input
                        id="as-start-date"
                        type="date"
                        className="text-xs sm:text-sm"
                        value={automatedSavingForm.startDate.toISOString().split('T')[0]}
                        onChange={(e) => setAutomatedSavingForm(prev => ({
                          ...prev,
                          startDate: new Date(e.target.value)
                        }))}
                      />
                    </div>

                    {/* Savings Projection */}
                    {automatedSavingForm.amount && (
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-xs sm:text-sm font-medium mb-2">Savings Projection</div>
                        {(() => {
                          const amount = parseFloat(automatedSavingForm.amount) || 0
                          const frequency = automatedSavingForm.frequency
                          let monthlyAmount = 0

                          if (frequency === 'DAILY') monthlyAmount = amount * 30
                          else if (frequency === 'WEEKLY') monthlyAmount = amount * 4.33
                          else monthlyAmount = amount

                          const yearlyAmount = monthlyAmount * 12

                          return (
                            <div className="space-y-1 text-xs sm:text-sm">
                              <div className="flex justify-between">
                                <span>Per Month:</span>
                                <span>{formatCurrency(monthlyAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Per Year:</span>
                                <span className="text-green-600">{formatCurrency(yearlyAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>In 5 Years:</span>
                                <span className="text-green-600 font-semibold">{formatCurrency(yearlyAmount * 5)}</span>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}

                    <Button onClick={handleCreateAutomatedSaving} className="w-full text-xs sm:text-sm">
                      Create Automated Saving
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Automated Savings List */}
            <div className="space-y-3">
              {automatedSavings.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Repeat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-sm font-medium mb-2">No Automated Savings Yet</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Set up automatic transfers to build your savings consistently
                    </p>
                    <Button
                      onClick={() => setIsAutomatedSavingDialogOpen(true)}
                      className="text-xs"
                    >
                      Create Auto Save
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                automatedSavings.map((saving) => (
                  <motion.div
                    key={saving.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="p-3 sm:p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xs sm:text-base">
                              {saving.name}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              {formatCurrency(saving.amount)} • {saving.frequency.toLowerCase()}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-xs sm:text-sm font-semibold">
                              {formatCurrency(saving.totalSaved)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total Saved
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Next Transfer:</span>
                            <span>{saving.nextDeduction.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Status:</span>
                            <span className={saving.isActive ? 'text-green-600' : 'text-red-600'}>
                              {saving.isActive ? 'Active' : 'Paused'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Monthly Projection:</span>
                            <span className="text-green-600">
                              {(() => {
                                let monthlyAmount = 0
                                if (saving.frequency === 'DAILY') monthlyAmount = saving.amount * 30
                                else if (saving.frequency === 'WEEKLY') monthlyAmount = saving.amount * 4.33
                                else monthlyAmount = saving.amount
                                return formatCurrency(monthlyAmount)
                              })()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs flex-1"
                            onClick={() => {
                              setAutomatedSavings(prev =>
                                prev.map(s => s.id === saving.id ? { ...s, isActive: !s.isActive } : s)
                              )
                            }}
                          >
                            {saving.isActive ? 'Pause' : 'Resume'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-3 sm:space-y-4">
            {savingsGoals
              .filter(goal => goal.status === 'COMPLETED')
              .map(goal => renderGoalCard(goal))}
          </div>
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
      </div>
    </div>
  )
}
