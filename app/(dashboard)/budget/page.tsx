'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"


import { DepositModal } from '@/components/deposit-modal'
import { SectionFooter } from '@/components/ui/section-footer'
import { useTheme } from '@/contexts/ThemeContext'
import { apiClient, BudgetCategory, BudgetSummary, SpendingByCategory, FinancialInsight } from '@/lib/api-client'
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  Plus, Target, PiggyBank, RefreshCcw, Loader2,
  ShoppingCart, Home, Car, Utensils, Gamepad2,
  Heart, GraduationCap, Plane
} from 'lucide-react'

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  housing: Home,
  food: Utensils,
  transportation: Car,
  entertainment: Gamepad2,
  shopping: ShoppingCart,
  healthcare: Heart,
  education: GraduationCap,
  travel: Plane,
  default: ShoppingCart
}

// Color mapping for categories
const categoryColors: Record<string, string> = {
  housing: '#000000',
  food: '#333333',
  transportation: '#666666',
  entertainment: '#999999',
  shopping: '#CCCCCC',
  healthcare: '#FFFFFF',
  education: '#444444',
  travel: '#777777',
  default: '#888888'
}

interface BudgetData {
  id: string
  name: string
  icon: any
  color: string
  budgeted: number
  spent: number
  percentage: number
}

interface MonthlyTrendData {
  month: string
  budgeted: number
  spent: number
}

export default function BudgetPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', budget: '', icon: 'ShoppingCart' })
  
  // API data states
  const [budgetData, setBudgetData] = useState<BudgetData[]>([])
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [spendingByCategory, setSpendingByCategory] = useState<SpendingByCategory[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendData[]>([])
  const [insights, setInsights] = useState<FinancialInsight[]>([])

  // Computed values
  const totalBudget = budgetSummary?.total_budgeted || 0
  const totalSpent = budgetSummary?.total_spent || 0
  const remainingBudget = budgetSummary?.total_remaining || 0
  const budgetProgress = budgetSummary?.overall_percentage_used || 0
  const overBudgetCategories = budgetData.filter(cat => cat.percentage > 100)

  const pieChartData = budgetData.map(cat => ({
    name: cat.name,
    value: cat.spent,
    color: cat.color
  }))

  // Fetch budget data from API
  const fetchBudgetData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch budget data in parallel
      const [budgetsResponse, summaryResponse, spendingResponse, insightsResponse] = await Promise.all([
        apiClient.getBudgets(),
        apiClient.getBudgetSummary(),
        apiClient.getSpendingAnalysis({
          period: 'monthly',
          group_by: 'category'
        }),
        apiClient.getFinancialInsights()
      ])

      // Handle budget categories
      if (budgetsResponse.data) {
        const formattedBudgets: BudgetData[] = budgetsResponse.data.map((budget: BudgetCategory) => ({
          id: budget.id,
          name: budget.name,
          icon: categoryIcons[budget.category.toLowerCase()] || categoryIcons.default,
          color: categoryColors[budget.category.toLowerCase()] || categoryColors.default,
          budgeted: budget.budgeted_amount,
          spent: budget.spent_amount,
          percentage: budget.percentage_used
        }))
        setBudgetData(formattedBudgets)
      }

      // Handle budget summary
      if (summaryResponse.data) {
        setBudgetSummary(summaryResponse.data)
      }

      // Handle spending by category
      if (spendingResponse.data) {
        setSpendingByCategory(spendingResponse.data)
      }

      // Handle insights
      if (insightsResponse.data) {
        setInsights(insightsResponse.data)
      }

      // Generate monthly trend data from spending analysis
      const trendResponse = await apiClient.getSpendingAnalysis({
        period: 'monthly',
        group_by: 'month'
      })

      if (trendResponse.data) {
        const trendData: MonthlyTrendData[] = trendResponse.data.map((item: any) => ({
          month: item.month || item.period,
          budgeted: totalBudget, // Use current total budget as baseline
          spent: item.amount
        }))
        setMonthlyTrend(trendData)
      }

    } catch (err) {
      const errorMessage = 'Failed to load budget data. Please try again.'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, totalBudget])

  // Load data on component mount
  useEffect(() => {
    fetchBudgetData()
  }, [fetchBudgetData])

  const handleAddCategory = async () => {
    if (newCategory.name && newCategory.budget) {
      try {
        setIsLoading(true)
        
        // Here you would typically call an API to create a new budget category
        // For now, we'll add it locally and refresh the data
        const newCat: BudgetData = {
          id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
          name: newCategory.name,
          icon: categoryIcons[newCategory.icon.toLowerCase()] || categoryIcons.default,
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
          budgeted: parseFloat(newCategory.budget),
          spent: 0,
          percentage: 0
        }
        
        setBudgetData(prev => [...prev, newCat])
        setNewCategory({ name: '', budget: '', icon: 'ShoppingCart' })
        setIsAddCategoryOpen(false)
        
        toast({
          title: "Success",
          description: "Budget category added successfully",
          duration: 3000
        })
        
        // Refresh data from API
        await fetchBudgetData()
        
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add budget category. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription>{error}</AlertDescription>
              <Button 
                onClick={fetchBudgetData}
                variant="outline"
                className="mt-4"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </Alert>
          </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-background pt-16 pb-4 px-3 sm:pt-20 sm:pb-6 sm:px-4 mb-20">
          <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xs sm:text-base font-bold text-foreground">
              Budget Tracker
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Track your spending and manage your budget
            </p>
          </div>
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button className="text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xs sm:text-base">Add Budget Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Category Name</Label>
                  <Input
                    className="text-xs sm:text-sm"
                    placeholder="e.g., Groceries"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Monthly Budget</Label>
                  <Input
                    className="text-xs sm:text-sm"
                    type="number"
                    placeholder="0.00"
                    value={newCategory.budget}
                    onChange={(e) => setNewCategory({...newCategory, budget: e.target.value})}
                  />
                </div>
                <Button onClick={handleAddCategory} className="w-full text-xs sm:text-sm">
                  Add Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[100px] rounded-lg" />
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Budget</CardTitle>
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-xs sm:text-base font-bold">${totalBudget.toLocaleString()}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Monthly allocation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-xs sm:text-base font-bold">${totalSpent.toLocaleString()}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {budgetProgress.toFixed(1)}% of budget
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Remaining</CardTitle>
                  <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className={`text-xs sm:text-base font-bold ${remainingBudget >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                    ${Math.abs(remainingBudget).toLocaleString()}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {remainingBudget >= 0 ? 'Under budget' : 'Over budget'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Alerts</CardTitle>
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-xs sm:text-base font-bold text-foreground">
                    {overBudgetCategories.length}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Categories over budget</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-base">Overall Budget Progress</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              You've spent ${totalSpent.toLocaleString()} of your ${totalBudget.toLocaleString()} budget
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2">
              <Progress value={budgetProgress} className="h-2 sm:h-3" />
              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                <span>0%</span>
                <span>{budgetProgress.toFixed(1)}%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="categories" className="space-y-3 sm:space-y-4">
          <TabsList className="text-xs sm:text-sm">
            <TabsTrigger value="categories" className="text-xs sm:text-sm">Categories</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs sm:text-sm">Trends</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-base">Spending by Category</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, value}) => `${name}: $${value}`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, 'Spent']} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-base">Budget vs Actual</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={budgetData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="budgeted" fill="hsl(var(--foreground))" name="Budgeted" />
                        <Bar dataKey="spent" fill="hsl(var(--muted-foreground))" name="Spent" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-base">Category Details</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))
                  ) : budgetData.length > 0 ? (
                    budgetData.map((category) => {
                      const IconComponent = category.icon
                      const isOverBudget = category.percentage > 100
                      
                      return (
                        <div key={category.id} className="flex items-center justify-between p-3 sm:p-4 border-border rounded-lg border bg-card">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="p-1.5 sm:p-2 rounded-full" style={{ backgroundColor: category.color + '20' }}>
                              <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: category.color }} />
                            </div>
                            <div>
                              <h3 className="text-xs sm:text-sm font-medium text-foreground">{category.name}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                ${category.spent.toLocaleString()} of ${category.budgeted.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge variant={isOverBudget ? "destructive" : "secondary"}>
                              {category.percentage.toFixed(1)}%
                            </Badge>
                            <div className="w-16 sm:w-24">
                              <Progress 
                                value={Math.min(category.percentage, 100)} 
                                className="h-1.5 sm:h-2"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">No budget categories found</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setIsAddCategoryOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Category
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-base">Monthly Spending Trends</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Compare your budgeted vs actual spending over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="budgeted" stroke="hsl(var(--foreground))" name="Budgeted" />
                      <Line type="monotone" dataKey="spent" stroke="hsl(var(--muted-foreground))" name="Actual Spent" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-base">Budget Insights</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : insights.length > 0 ? (
                    insights.slice(0, 3).map((insight, index) => {
                      const getInsightIcon = (type: string, priority: string) => {
                        if (priority === 'high' || priority === 'urgent') {
                          return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400 mt-0.5" />
                        } else if (type === 'saving' || priority === 'low') {
                          return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 mt-0.5" />
                        }
                        return <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      }

                      return (
                        <div key={insight.id} className="flex items-start space-x-2 sm:space-x-3">
                          {getInsightIcon(insight.insight_type, insight.priority)}
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-foreground">{insight.title}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    // Fallback insights based on budget data
                    <>
                      {budgetData.some(cat => cat.percentage < 80) && (
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-foreground">Great budget management!</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              You&apos;re staying under budget in several categories
                            </p>
                          </div>
                        </div>
                      )}
                      {overBudgetCategories.length > 0 && (
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400 mt-0.5" />
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-foreground">Watch your spending</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {overBudgetCategories.length} {overBudgetCategories.length === 1 ? 'category is' : 'categories are'} over budget
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-foreground">Overall progress</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            You&apos;ve used {budgetProgress.toFixed(1)}% of your total budget
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-base">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(2).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : insights.length > 0 ? (
                    insights
                      .filter(insight => insight.action_recommended)
                      .slice(0, 2)
                      .map((insight, index) => (
                        <div key={insight.id} className="p-2 sm:p-3 bg-muted/50 rounded-lg border border-border">
                          <p className="text-xs sm:text-sm font-medium text-foreground">
                            {insight.title}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {insight.action_recommended}
                          </p>
                        </div>
                      ))
                  ) : (
                    // Fallback recommendations
                    <>
                      {remainingBudget > 0 && (
                        <div className="p-2 sm:p-3 bg-muted/50 rounded-lg border border-border">
                          <p className="text-xs sm:text-sm font-medium text-foreground">
                            Save more this month
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            You have ${remainingBudget.toLocaleString()} remaining. Consider moving it to savings or investments
                          </p>
                        </div>
                      )}
                      {overBudgetCategories.length > 0 && (
                        <div className="p-2 sm:p-3 bg-muted/50 rounded-lg border border-border">
                          <p className="text-xs sm:text-sm font-medium text-foreground">
                            Review overspending categories
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Consider adjusting your budget or reducing spending in {overBudgetCategories[0]?.name}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
          </div>
        </div>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
        <SectionFooter section="main" activePage="/budget" />
    </div>
  )
}
