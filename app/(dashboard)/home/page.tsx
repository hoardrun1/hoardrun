'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Target,
  Activity,
  Calendar
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  // Mock data for the dashboard
  const stats = {
    totalBalance: 12450.75,
    monthlyIncome: 5200.00,
    monthlyExpenses: 3150.25,
    savings: 8750.50,
    investments: 15200.30,
    creditScore: 742
  }

  const recentTransactions = [
    { id: 1, type: 'income', description: 'Salary Deposit', amount: 5200.00, date: '2024-01-15' },
    { id: 2, type: 'expense', description: 'Grocery Shopping', amount: -120.50, date: '2024-01-14' },
    { id: 3, type: 'expense', description: 'Gas Station', amount: -45.00, date: '2024-01-13' },
    { id: 4, type: 'income', description: 'Freelance Payment', amount: 800.00, date: '2024-01-12' }
  ]

  const handleQuickAction = (action: any) => {
    if (action.href) {
      router.push(action.href)
    } else if (action.action) {
      action.action()
    }
  }

  const quickActions = [
    { label: 'Send Money', href: '/send', icon: ArrowUpRight, color: 'bg-black' },
    { label: 'Add Money', action: () => setIsDepositModalOpen(true), icon: ArrowDownLeft, color: 'bg-black' },
    { label: 'View Cards', href: '/cards', icon: CreditCard, color: 'bg-black' },
    { label: 'Savings Goals', href: '/savings', icon: Target, color: 'bg-black' }
  ]

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-white pt-16 pb-4 px-4 sm:pt-20 sm:pb-6 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black">
                  Welcome back!
                </h1>
                <p className="text-black/60 mt-1 text-sm sm:text-base">
                  Here's what's happening with your money today
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-black/60">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span className="sm:hidden">{new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-black/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-black">
                    ${stats.totalBalance.toLocaleString()}
                  </div>
                  <p className="text-xs text-black/60">
                    +2.5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-black/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">
                    ${stats.monthlyIncome.toLocaleString()}
                  </div>
                  <p className="text-xs text-black/60">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-black/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">
                    ${stats.monthlyExpenses.toLocaleString()}
                  </div>
                  <p className="text-xs text-black/60">
                    -5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Savings</CardTitle>
                  <PiggyBank className="h-4 w-4 text-black/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">
                    ${stats.savings.toLocaleString()}
                  </div>
                  <p className="text-xs text-black/60">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border-black/10 hover:bg-black hover:text-white transition-colors"
                        onClick={() => handleQuickAction(action)}
                      >
                        <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-xs text-center">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-2 sm:p-3 border border-black/10 rounded-lg"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className={`p-1.5 sm:p-2 rounded-full ${
                            transaction.type === 'income'
                              ? 'bg-black/10'
                              : 'bg-black/10'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-black text-sm sm:text-base truncate">{transaction.description}</p>
                            <p className="text-xs sm:text-sm text-black/60">{transaction.date}</p>
                          </div>
                        </div>
                        <div className={`font-bold text-sm sm:text-base ${
                          transaction.type === 'income' ? 'text-black' : 'text-black'
                        } ml-2`}>
                          {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Credit Score</span>
                      <span className="font-bold text-black">{stats.creditScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Debt-to-Income</span>
                      <span className="font-bold text-black">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Savings Rate</span>
                      <span className="font-bold text-black">25%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Total Invested</span>
                      <span className="font-bold text-black">${stats.investments.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Total Return</span>
                      <span className="font-bold text-black">+12.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">This Month</span>
                      <span className="font-bold text-black">+2.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
