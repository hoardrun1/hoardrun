'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'
import { SectionFooter } from '@/components/ui/section-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target
} from 'lucide-react'

// Mock analytics data
const monthlyData = [
  { month: 'Jan', income: 5000, expenses: 3200, savings: 1800 },
  { month: 'Feb', income: 5200, expenses: 3400, savings: 1800 },
  { month: 'Mar', income: 4800, expenses: 3100, savings: 1700 },
  { month: 'Apr', income: 5500, expenses: 3600, savings: 1900 },
  { month: 'May', income: 5300, expenses: 3300, savings: 2000 },
  { month: 'Jun', income: 5800, expenses: 3800, savings: 2000 }
]

const categoryData = [
  { name: 'Housing', value: 1200, color: '#000000' },
  { name: 'Food', value: 800, color: '#333333' },
  { name: 'Transportation', value: 400, color: '#666666' },
  { name: 'Entertainment', value: 300, color: '#999999' },
  { name: 'Shopping', value: 250, color: '#CCCCCC' },
  { name: 'Other', value: 200, color: '#EEEEEE' }
]

const weeklySpending = [
  { day: 'Mon', amount: 45 },
  { day: 'Tue', amount: 120 },
  { day: 'Wed', amount: 80 },
  { day: 'Thu', amount: 200 },
  { day: 'Fri', amount: 150 },
  { day: 'Sat', amount: 300 },
  { day: 'Sun', amount: 90 }
]

export default function AnalyticsPage() {
  const { theme } = useTheme()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0)
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0)
  const totalSavings = monthlyData.reduce((sum, month) => sum + month.savings, 0)
  const avgMonthlyIncome = totalIncome / monthlyData.length
  const avgMonthlyExpenses = totalExpenses / monthlyData.length
  const savingsRate = ((totalSavings / totalIncome) * 100).toFixed(1)

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-background pt-16 pb-32 px-4 sm:pt-20 sm:pb-32 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                  Analytics
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Insights into your financial patterns and trends
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Monthly Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground">
                    ${avgMonthlyIncome.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 6 months</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Monthly Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground">
                    ${avgMonthlyExpenses.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 6 months</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground">
                    {savingsRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">Of total income</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground">
                    ${totalSavings.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 6 months</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="spending" className="text-xs sm:text-sm">Spending</TabsTrigger>
                <TabsTrigger value="trends" className="text-xs sm:text-sm">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                {/* Monthly Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Financial Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))' }} />
                          <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              color: 'hsl(var(--foreground))'
                            }} 
                          />
                          <Bar dataKey="income" fill="hsl(var(--foreground))" name="Income" />
                          <Bar dataKey="expenses" fill="hsl(var(--muted-foreground))" name="Expenses" />
                          <Bar dataKey="savings" fill="hsl(var(--muted))" name="Savings" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, value}) => `${name}: $${value}`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`$${value}`, 'Amount']}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              color: 'hsl(var(--foreground))'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="spending" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Spending Pattern</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={weeklySpending}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" tick={{ fill: 'hsl(var(--foreground))' }} />
                          <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              color: 'hsl(var(--foreground))'
                            }}
                          />
                          <Area type="monotone" dataKey="amount" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground))" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categoryData.map((category, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="text-sm font-medium">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-foreground">${category.value}</span>
                              <p className="text-xs text-muted-foreground">
                                {((category.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Income vs Expenses Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--foreground))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Line type="monotone" dataKey="income" stroke="hsl(var(--foreground))" strokeWidth={2} name="Income" />
                        <Line type="monotone" dataKey="expenses" stroke="hsl(var(--muted-foreground))" strokeWidth={2} name="Expenses" />
                        <Line type="monotone" dataKey="savings" stroke="hsl(var(--muted))" strokeWidth={2} name="Savings" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
        <SectionFooter section="financial" activePage="/analytics" />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
