'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

import { DepositModal } from '@/components/deposit-modal'
import { SectionFooter } from '@/components/ui/section-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api-client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Loader2
} from 'lucide-react'

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Analytics data state
  const [cashFlowData, setCashFlowData] = useState<any>(null)
  const [spendingData, setSpendingData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [weeklySpending, setWeeklySpending] = useState<any[]>([])

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch cash flow analysis for the last 6 months
        const cashFlowResponse = await apiClient.getCashFlowAnalysis({
          period: 'monthly',
          start_date: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        })

        if (cashFlowResponse.error) {
          throw new Error(cashFlowResponse.error)
        }

        setCashFlowData(cashFlowResponse.data)

        // Fetch spending analysis by category
        const spendingResponse = await apiClient.getSpendingAnalysis({
          period: 'monthly',
          group_by: 'category',
          start_date: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        })

        if (spendingResponse.error) {
          throw new Error(spendingResponse.error)
        }

        setSpendingData(spendingResponse.data || [])

        // Transform cash flow data for charts
        if (cashFlowResponse.data) {
          const monthlyChartData = cashFlowResponse.data.monthly_breakdown?.map((month: any) => ({
            month: new Date(month.period).toLocaleDateString('en-US', { month: 'short' }),
            income: month.total_income || 0,
            expenses: month.total_expenses || 0,
            savings: (month.total_income || 0) - (month.total_expenses || 0)
          })) || []
          setMonthlyData(monthlyChartData)
        }

        // Transform spending data for pie chart
        if (spendingResponse.data) {
          const categoryChartData = spendingResponse.data.map((category: any, index: number) => ({
            name: category.category || 'Other',
            value: category.total_amount || 0,
            color: `hsl(${(index * 45) % 360}, 70%, 50%)`
          }))
          setCategoryData(categoryChartData)
        }

        // Fetch weekly spending data from API
        const weeklySpendingResponse = await apiClient.getSpendingAnalysis({
          period: 'weekly',
          group_by: 'day',
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        })

        if (weeklySpendingResponse.data && !weeklySpendingResponse.error) {
          // Transform API data for weekly chart
          const weeklyData = weeklySpendingResponse.data.map((day: any) => ({
            day: new Date(day.period || day.date).toLocaleDateString('en-US', { weekday: 'short' }),
            amount: day.total_amount || day.amount || 0
          }))
          setWeeklySpending(weeklyData)
        } else {
          // Fallback to empty data if API fails
          console.warn('Failed to fetch weekly spending data:', weeklySpendingResponse.error)
          setWeeklySpending([])
        }

      } catch (err) {
        console.error('Error fetching analytics data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  // Calculate metrics from the fetched data
  const totalIncome = monthlyData.reduce((sum, month) => sum + (month.income || 0), 0)
  const totalExpenses = monthlyData.reduce((sum, month) => sum + (month.expenses || 0), 0)
  const totalSavings = monthlyData.reduce((sum, month) => sum + (month.savings || 0), 0)
  const avgMonthlyIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0
  const avgMonthlyExpenses = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : '0.0'



  if (error) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-32 px-2">
        <div className="w-full space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{t('dashboard.analytics.errorLoadingAnalytics')}</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
        <div className="min-h-screen bg-background pt-16 pb-32 px-2">
          <div className="w-full space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                  {t('dashboard.analytics.title')}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  {t('dashboard.analytics.description')}
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.analytics.avgMonthlyIncome')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground">
                    ${avgMonthlyIncome.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.analytics.last6Months')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.analytics.avgMonthlyExpenses')}</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground">
                    ${avgMonthlyExpenses.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.analytics.last6Months')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.analytics.savingsRate')}</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground">
                    {savingsRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.analytics.ofTotalIncome')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.analytics.totalSavings')}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground">
                    ${totalSavings.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.analytics.last6Months')}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">{t('dashboard.analytics.tabs.overview')}</TabsTrigger>
                <TabsTrigger value="spending" className="text-xs sm:text-sm">{t('dashboard.analytics.tabs.spending')}</TabsTrigger>
                <TabsTrigger value="trends" className="text-xs sm:text-sm">{t('dashboard.analytics.tabs.trends')}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                {/* Monthly Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('dashboard.analytics.monthlyFinancialOverview')}</CardTitle>
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
                      <CardTitle>{t('dashboard.analytics.spendingByCategory')}</CardTitle>
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
                      <CardTitle>{t('dashboard.analytics.weeklySpendingPattern')}</CardTitle>
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
                      <CardTitle>{t('dashboard.analytics.categoryBreakdown')}</CardTitle>
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
                    <CardTitle>{t('dashboard.analytics.incomeVsExpensesTrend')}</CardTitle>
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
    </div>
  )
}
