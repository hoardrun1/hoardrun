'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content-unified'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/contexts/NotificationContext'
import { apiClient, DashboardData, Transaction } from '@/lib/api-client'
import { useApiCache } from '@/lib/api-cache'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Target,
  Calendar,
  Bell
} from 'lucide-react'
import { SectionFooter } from '@/components/ui/section-footer'

export default function HomePage() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const apiCache = useApiCache()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data from API with caching
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check cache first
        const cacheKey = 'dashboard-data'
        const cachedData = apiCache.get<DashboardData>(cacheKey)
        
        if (cachedData) {
          setDashboardData(cachedData)
          setIsLoading(false)
          return
        }
        
        const response = await apiClient.getDashboard()
        
        if (response.error) {
          throw new Error(response.error)
        }
        
        if (response.data) {
          setDashboardData(response.data)
          // Cache for 2 minutes
          apiCache.set(cacheKey, response.data, 2 * 60 * 1000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
        console.error('Dashboard fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [apiCache])

  // Use API data or fallback to empty values
  const stats = {
    totalBalance: dashboardData?.balance || 0,
    monthlyIncome: dashboardData?.total_income || 0,
    monthlyExpenses: dashboardData?.total_expenses || 0,
    savings: dashboardData?.savings_goals?.reduce((total, goal) => total + (goal.current_amount || 0), 0) || 0,
    investments: dashboardData?.investments?.reduce((total, inv) => total + inv.amount, 0) || 0,
    creditScore: 750 // This would come from a separate API call
  }

  const recentTransactions: Transaction[] = dashboardData?.recent_transactions || []

  const handleQuickAction = (action: { href?: string; action?: () => void }) => {
    if (action.href) {
      router.push(action.href)
    } else if (action.action) {
      action.action()
    }
  }

  // Empty function - notifications should come from real data
  const testNotifications = () => {
    // No demo notifications
  }

  const quickActions = [
    { label: 'Send Money', href: '/send', icon: ArrowUpRight, color: 'bg-black' },
    { label: 'Add Money', action: () => setIsDepositModalOpen(true), icon: ArrowDownLeft, color: 'bg-black' },
    { label: 'View Cards', href: '/cards', icon: CreditCard, color: 'bg-black' },
    { label: 'Savings Goals', href: '/savings', icon: Target, color: 'bg-black' },
    { label: 'Investments', href: '/investment', icon: TrendingUp, color: 'bg-black' },
    { label: 'Analytics', href: '/analytics', icon: DollarSign, color: 'bg-black' },
    { label: 'Test Notifications', action: testNotifications, icon: Bell, color: 'bg-black' },
    { label: 'Help & Support', href: '/help', icon: Calendar, color: 'bg-black' }
  ]

  return (
    <div className="dashboard-content">
      {/* Hero Balance Card */}
      <div className="card-primary p-6 sm:p-8 text-center animate-fade-in">
        <div className="space-y-3">
          <p className="text-primary-foreground/70 text-sm sm:text-base">Total Balance</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            ${stats.totalBalance.toLocaleString()}
          </h1>
          <div className="flex items-center justify-center space-x-2 text-primary-foreground/80">
            <TrendingUp className="h-4 w-4" />
            <p className="text-sm sm:text-base">+2.5% from last month</p>
          </div>
        </div>
      </div>

      {/* Primary Actions - Enhanced Design */}
      <div className="dashboard-section">
        <h2 className="heading-tertiary text-center">Quick Actions</h2>
        <div className="flex overflow-x-auto lg:justify-center gap-4 pb-2">
          {[
            { label: 'Send', href: '/send', icon: ArrowUpRight, color: 'btn-gradient' },
            { label: 'Add Money', action: () => setIsDepositModalOpen(true), icon: ArrowDownLeft, color: 'btn-surface' },
            { label: 'Cards', href: '/cards', icon: CreditCard, color: 'btn-surface' },
            { label: 'Invest', href: '/investment', icon: TrendingUp, color: 'btn-surface' },
            { label: 'Save', href: '/savings', icon: Target, color: 'btn-surface' }
          ].map((action, index) => (
            <Button
              key={index}
              className={`${action.color} btn-enhanced min-w-[90px] h-18 flex flex-col items-center justify-center space-y-2 hover-lift`}
              onClick={() => handleQuickAction(action)}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="card-enhanced p-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Analytics', href: '/analytics', icon: DollarSign },
            { label: 'Notifications', action: testNotifications, icon: Bell },
            { label: 'Help', href: '/help', icon: Calendar }
          ].map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="h-16 flex flex-col items-center justify-center space-y-2 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all duration-200"
              onClick={() => handleQuickAction(action)}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Financial Overview and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview */}
        <div className="dashboard-section">
          <h2 className="heading-tertiary">Financial Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="card-gradient p-4 hover-lift">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xl font-bold text-foreground">
                ${stats.totalBalance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +2.5% from last month
              </p>
            </div>

            <div className="card-gradient p-4 hover-lift">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Total Savings</span>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xl font-bold text-foreground">
                ${stats.savings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +8% from last month
              </p>
            </div>

            <div className="card-gradient p-4 hover-lift">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Net Worth</span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xl font-bold text-foreground">
                ${(stats.totalBalance + stats.investments).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +15% from last month
              </p>
            </div>

            <div className="card-gradient p-4 hover-lift">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Portfolio Value</span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xl font-bold text-foreground">
                ${stats.investments.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +12.5% from last month
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card-enhanced overflow-hidden">
          <div className="card-primary p-4 -m-px rounded-t-xl">
            <h3 className="heading-tertiary text-primary-foreground">Recent Transactions</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 card-surface hover-lift"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="p-2 rounded-full bg-surface border border-border">
                      {transaction.type === 'DEPOSIT' ? (
                        <ArrowDownLeft className="h-4 w-4 text-foreground" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-foreground ml-2">
                    {transaction.type === 'DEPOSIT' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent transactions</p>
                  <p className="text-sm">Your transactions will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-enhanced overflow-hidden">
          <div className="card-primary p-4 -m-px rounded-t-xl">
            <h3 className="heading-tertiary text-primary-foreground">Financial Health</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credit Score</span>
              <span className="font-bold text-foreground">{stats.creditScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Debt-to-Income</span>
              <span className="font-bold text-foreground">15%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Savings Rate</span>
              <span className="font-bold text-foreground">25%</span>
            </div>
          </div>
        </div>

        <div className="card-enhanced overflow-hidden">
          <div className="card-primary p-4 -m-px rounded-t-xl">
            <h3 className="heading-tertiary text-primary-foreground">Investment Performance</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Invested</span>
              <span className="font-bold text-foreground">${stats.investments.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Return</span>
              <span className="font-bold text-foreground">+12.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-bold text-foreground">+2.1%</span>
            </div>
          </div>
        </div>
      </div>

      <DepositModal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
      />
    </div>
  )
}
