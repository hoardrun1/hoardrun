'use client'

import { useState, useEffect } from 'react'
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
  Loader2,
  PiggyBank
} from 'lucide-react'
import { PageHero, StatPills, CountUp, usd } from '@/components/app/page-hero'
import { EmptyChart, PieGraphic } from '@/components/app/home-graphics'

// Hoardrun's palette for series: income iris, spending coral, savings mint
const SERIES = { income: '#5aa9ff', expenses: '#fb7185', savings: '#34d399' }
const tooltipStyle = { backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff' }
const axisTick = { fill: '#8e8e93', fontSize: 12 }

export default function AnalyticsPage() {
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
        const startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const endDate = new Date().toISOString().split('T')[0]

        const [cashFlowResponse, spendingResponse, weeklySpendingResponse] = await Promise.all([
          apiClient.getCashFlowAnalysis({
            period: 'monthly',
            start_date: startDate,
            end_date: endDate
          }),
          apiClient.getSpendingAnalysis({
            period: 'monthly',
            group_by: 'category',
            start_date: startDate,
            end_date: endDate
          }),
          apiClient.getSpendingAnalysis({
            period: 'weekly',
            group_by: 'day',
            start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: endDate
          })
        ])

        const cashFlowError = cashFlowResponse.error
        const spendingError = spendingResponse.error

        if (cashFlowError && spendingError) {
          throw new Error(cashFlowError)
        }

        setCashFlowData(cashFlowResponse.data || null)
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
            value: category.total_amount || category.amount || 0,
            color: `hsl(${(index * 45) % 360}, 70%, 50%)`
          }))
          setCategoryData(categoryChartData)
        } else {
          setCategoryData([])
        }

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
              <p className="text-red-500 mb-2">Error Loading Analytics</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
        <div>
          <div className="space-y-4 pb-28 sm:space-y-5 lg:pb-8">
            <PageHero
              title="Analytics"
              subtitle="Where your money came from and where it went."
              tone="violet"
              graphic={PieGraphic}
              figureLabel="Net over the last 6 months"
              figure={loading ? '…' : <CountUp value={totalIncome - totalExpenses} format={(n) => usd(n)} />}
            />
            <StatPills
              items={[
                { label: 'Avg monthly income', value: <CountUp value={avgMonthlyIncome} format={(n) => usd(n, 0)} />, note: 'Last 6 months', tone: 'iris', icon: TrendingUp },
                { label: 'Avg monthly spend', value: <CountUp value={avgMonthlyExpenses} format={(n) => usd(n, 0)} />, note: 'Last 6 months', tone: 'coral', icon: TrendingDown },
                { label: 'Savings rate', value: `${savingsRate}%`, note: 'Of total income', tone: 'sky', icon: Target },
                { label: 'Total saved', value: <CountUp value={totalSavings} format={(n) => usd(n, 0)} />, note: 'Last 6 months', tone: 'mint', icon: PiggyBank },
              ]}
            />

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
                      {monthlyData.length === 0 ? <EmptyChart label="Monthly totals appear after your first transactions" /> : (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={monthlyData} barGap={4}>
                          <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.07)" vertical={false} />
                          <XAxis dataKey="month" tick={axisTick} />
                          <YAxis tick={axisTick} />
                          <Tooltip 
                            contentStyle={tooltipStyle} 
                          />
                          <Bar dataKey="income" fill={SERIES.income} radius={[6, 6, 0, 0]} name="Income" />
                          <Bar dataKey="expenses" fill={SERIES.expenses} radius={[6, 6, 0, 0]} name="Expenses" />
                          <Bar dataKey="savings" fill={SERIES.savings} radius={[6, 6, 0, 0]} name="Savings" />
                        </BarChart>
                      </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categoryData.length === 0 ? <EmptyChart label="Spending by category shows up once you spend" /> : (
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={96}
                            paddingAngle={3}
                            stroke="none"
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
                            contentStyle={tooltipStyle}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      )}
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
                      {weeklySpending.length === 0 ? <EmptyChart label="No spending this week" /> : (
                      <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={weeklySpending}>
                          <defs>
                            <linearGradient id="hrWeekFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0" stopColor={SERIES.expenses} stopOpacity={0.45} />
                              <stop offset="1" stopColor={SERIES.expenses} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.07)" vertical={false} />
                          <XAxis dataKey="day" tick={axisTick} />
                          <YAxis tick={axisTick} />
                          <Tooltip 
                            contentStyle={tooltipStyle}
                          />
                          <Area type="monotone" dataKey="amount" stroke={SERIES.expenses} strokeWidth={2.5} fill="url(#hrWeekFill)" />
                        </AreaChart>
                      </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categoryData.length === 0 && <p className="py-6 text-center text-sm text-[#8e8e93]">No categories yet</p>}
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
                    {monthlyData.length === 0 ? <EmptyChart label="Trends appear after a month of activity" /> : (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.07)" vertical={false} />
                        <XAxis dataKey="month" tick={axisTick} />
                        <YAxis tick={axisTick} />
                        <Tooltip 
                          contentStyle={tooltipStyle}
                        />
                        <Line type="monotone" dataKey="income" stroke={SERIES.income} strokeWidth={2.5} dot={false} name="Income" />
                        <Line type="monotone" dataKey="expenses" stroke={SERIES.expenses} strokeWidth={2.5} dot={false} name="Expenses" />
                        <Line type="monotone" dataKey="savings" stroke={SERIES.savings} strokeWidth={2.5} dot={false} name="Savings" />
                      </LineChart>
                    </ResponsiveContainer>
                    )}
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
