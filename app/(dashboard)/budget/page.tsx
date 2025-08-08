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
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  Plus, Target, PiggyBank,
  ShoppingCart, Home, Car, Utensils, Gamepad2,
  Heart, GraduationCap, Plane
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Mock data for budget categories
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

// Monthly spending trend data
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

  // Calculate budget summary
  const remainingBudget = totalBudget - totalSpent
  const budgetProgress = (totalSpent / totalBudget) * 100

  // Get categories that are over budget
  const overBudgetCategories = budgetData.filter(cat => cat.percentage > 100)

  // Prepare pie chart data
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
        icon: ShoppingCart, // Default icon
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
        <div className="min-h-screen bg-white pt-16 pb-4 px-4 sm:pt-20 sm:pb-6 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">
              Budget Tracker
            </h1>
            <p className="text-black/60 mt-1">
              Track your spending and manage your budget
            </p>
          </div>
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Budget Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input
                    placeholder="e.g., Groceries"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Budget</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newCategory.budget}
                    onChange={(e) => setNewCategory({...newCategory, budget: e.target.value})}
                  />
                </div>
                <Button onClick={handleAddCategory} className="w-full">
                  Add Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Budget Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Monthly allocation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {budgetProgress.toFixed(1)}% of budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-black' : 'text-black'}`}>
                ${Math.abs(remainingBudget).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {remainingBudget >= 0 ? 'Under budget' : 'Over budget'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {overBudgetCategories.length}
              </div>
              <p className="text-xs text-muted-foreground">Categories over budget</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Budget Progress</CardTitle>
            <CardDescription>
              You've spent ${totalSpent.toLocaleString()} of your ${totalBudget.toLocaleString()} budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={budgetProgress} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0%</span>
                <span>{budgetProgress.toFixed(1)}%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
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
                <CardHeader>
                  <CardTitle>Budget vs Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="budgeted" fill="#000000" name="Budgeted" />
                      <Bar dataKey="spent" fill="#666666" name="Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category Details */}
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetData.map((category) => {
                    const IconComponent = category.icon
                    const isOverBudget = category.percentage > 100
                    
                    return (
                      <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full" style={{ backgroundColor: category.color + '20' }}>
                            <IconComponent className="h-5 w-5" style={{ color: category.color }} />
                          </div>
                          <div>
                            <h3 className="font-medium">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              ${category.spent} of ${category.budgeted}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={isOverBudget ? "destructive" : "secondary"}>
                            {category.percentage.toFixed(1)}%
                          </Badge>
                          <div className="w-24">
                            <Progress 
                              value={Math.min(category.percentage, 100)} 
                              className="h-2"
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
              <CardHeader>
                <CardTitle>Monthly Spending Trends</CardTitle>
                <CardDescription>
                  Compare your budgeted vs actual spending over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="budgeted" stroke="#000000" name="Budgeted" />
                    <Line type="monotone" dataKey="spent" stroke="#666666" name="Actual Spent" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-black mt-0.5" />
                    <div>
                      <p className="font-medium">Great job on Transportation!</p>
                      <p className="text-sm text-black/60">
                        You're 24% under budget this month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <TrendingDown className="h-5 w-5 text-black mt-0.5" />
                    <div>
                      <p className="font-medium">Watch your Entertainment spending</p>
                      <p className="text-sm text-black/60">
                        You're 40% over budget in this category
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-black mt-0.5" />
                    <div>
                      <p className="font-medium">On track overall</p>
                      <p className="text-sm text-black/60">
                        You're within 5% of your total monthly budget
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-black/5 rounded-lg border border-black/10">
                    <p className="font-medium text-black">
                      Consider reallocating budget
                    </p>
                    <p className="text-sm text-black/60">
                      Move $100 from Transportation to Entertainment to better match your spending patterns
                    </p>
                  </div>
                  <div className="p-3 bg-black/5 rounded-lg border border-black/10">
                    <p className="font-medium text-black">
                      Save more this month
                    </p>
                    <p className="text-sm text-black/60">
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

        {/* Deposit Modal */}
        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
