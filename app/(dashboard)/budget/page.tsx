'use client'

import { useState } from 'react'
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

import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'
import { SectionFooter } from '@/components/ui/section-footer'
import { useTheme } from '@/contexts/ThemeContext'
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  Plus, Target, PiggyBank,
  ShoppingCart, Home, Car, Utensils, Gamepad2,
  Heart, GraduationCap, Plane
} from 'lucide-react'

const budgetCategories = [
  { id: 'housing', name: 'Housing', icon: Home, color: '#000000', budgeted: 2000, spent: 1850, percentage: 92.5 },
  { id: 'food', name: 'Food & Dining', icon: Utensils, color: '#333333', budgeted: 800, spent: 720, percentage: 90 },
  { id: 'transportation', name: 'Transportation', icon: Car, color: '#666666', budgeted: 500, spent: 380, percentage: 76 },
  { id: 'entertainment', name: 'Entertainment', icon: Gamepad2, color: '#999999', budgeted: 300, spent: 420, percentage: 140 },
  { id: 'shopping', name: 'Shopping', icon: ShoppingCart, color: '#CCCCCC', budgeted: 400, spent: 350, percentage: 87.5 },
  { id: 'healthcare', name: 'Healthcare', icon: Heart, color: '#FFFFFF', budgeted: 200, spent: 150, percentage: 75 },
  { id: 'education', name: 'Education', icon: GraduationCap, color: '#444444', budgeted: 150, spent: 100, percentage: 66.7 },
  { id: 'travel', name: 'Travel', icon: Plane, color: '#777777', budgeted: 250, spent: 0, percentage: 0 }
]

const monthlyTrend = [
  { month: 'Jan', budgeted: 4600, spent: 4200 },
  { month: 'Feb', budgeted: 4600, spent: 4350 },
  { month: 'Mar', budgeted: 4600, spent: 4100 },
  { month: 'Apr', budgeted: 4600, spent: 4500 },
  { month: 'May', budgeted: 4600, spent: 4250 },
  { month: 'Jun', budgeted: 4600, spent: 3970 }
]

export default function BudgetPage() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', budget: '', icon: 'ShoppingCart' })
  const [budgetData, setBudgetData] = useState(budgetCategories)
  const [totalBudget, setTotalBudget] = useState(4600)
  const [totalSpent] = useState(3970)

  const remainingBudget = totalBudget - totalSpent
  const budgetProgress = (totalSpent / totalBudget) * 100

  const overBudgetCategories = budgetData.filter(cat => cat.percentage > 100)

  const pieChartData = budgetData.map(cat => ({
    name: cat.name,
    value: cat.spent,
    color: cat.color
  }))

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.budget) {
      const newCat = {
        id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        name: newCategory.name,
        icon: ShoppingCart,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        budgeted: parseFloat(newCategory.budget),
        spent: 0,
        percentage: 0
      }
      setBudgetData([...budgetData, newCat])
      setTotalBudget(prev => prev + parseFloat(newCategory.budget))
      setNewCategory({ name: '', budget: '', icon: 'ShoppingCart' })
      setIsAddCategoryOpen(false)
    }
  }

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-base">Budget vs Actual</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
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
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-base">Category Details</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {budgetData.map((category) => {
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
                              ${category.spent} of ${category.budgeted}
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
                  })}
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
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-foreground">Great job on Transportation!</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        You&apos;re 24% under budget this month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-foreground">Watch your Entertainment spending</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        You&apos;re 40% over budget in this category
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-foreground">On track overall</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        You&apos;re within 5% of your total monthly budget
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-base">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="p-2 sm:p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      Consider reallocating budget
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Move $100 from Transportation to Entertainment to better match your spending patterns
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      Save more this month
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      You have $630 remaining. Consider moving it to savings or investments
                    </p>
                  </div>
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
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
