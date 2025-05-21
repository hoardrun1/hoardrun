'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'
import { useSavingsData } from '@/hooks/useSavingsData'
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
  const { data: session } = useSession()
  const { toast } = useToast()
  const {
    savingsGoals,
    analytics,
    isLoading,
    error,
    fetchSavingsGoals,
    fetchAnalytics,
    addSavingsGoal
  } = useSavingsData()

  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false)
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
    if (session?.user) {
      fetchSavingsGoals()
      fetchAnalytics()
    }
  }, [session, fetchSavingsGoals, fetchAnalytics])

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

      await addSavingsGoal(goalData)
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
      toast({
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
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{goal.name}</CardTitle>
            <Button variant="ghost" size="sm">
              Contribute
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
            <Progress value={goal.progress} />
            <div className="flex justify-between text-sm text-gray-500">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalSavings)}</div>
          </CardContent>
        </Card>
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
            <CardTitle>Next Milestone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.nextMilestone ? formatCurrency(analytics.nextMilestone) : formatCurrency(0)}
            </div>
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
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Savings</h1>
        <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
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

      {renderAnalytics()}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Goals</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              savingsGoals
                .filter(goal => !goal.isCompleted)
                .map(goal => renderGoalCard(goal))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {savingsGoals
              .filter(goal => goal.isCompleted)
              .map(goal => renderGoalCard(goal))}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Savings Insights</CardTitle>
              <CardDescription>
                Track your savings progress and get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.insights?.map((insight: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-gray-500">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}