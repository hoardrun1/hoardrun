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
import { PiggyBank, Target, Clock, TrendingUp, AlertCircle, Plus, ChevronRight } from 'lucide-react'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
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

  useEffect(() => {
    if (user) {
      fetchSavingsGoals()
    }
  }, [user, fetchSavingsGoals])

  // Calculate analytics when savings goals change
  useEffect(() => {
    if (savingsGoals.length > 0) {
      const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
      const monthlyGrowth = savingsGoals.reduce((sum, goal) => sum + (goal.autoSaveAmount || 0), 0)
      const nextMilestone = Math.min(...savingsGoals.map(goal => goal.targetAmount - goal.currentAmount).filter(diff => diff > 0)) || 0
      const projectedSavings = totalSavings + (monthlyGrowth * 12)

      setAnalytics({
        totalSavings,
        monthlyGrowth,
        nextMilestone,
        projectedSavings,
        insights: [
          {
            title: 'Savings Progress',
            description: `You're on track to save $${monthlyGrowth.toLocaleString()} per month`
          }
        ]
      })
    }
  }, [savingsGoals])

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
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-background pt-16 pb-4 px-3 sm:pt-20 sm:pb-6 sm:px-4 mb-20">
          <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xs sm:text-base font-bold text-foreground">
              Savings Goals
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Track and manage your savings goals
            </p>
          </div>
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

      <Tabs defaultValue="active" className="space-y-3 sm:space-y-4">
        <TabsList className="text-xs sm:text-sm">
          <TabsTrigger value="active" className="text-xs sm:text-sm">Active Goals</TabsTrigger>
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
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
