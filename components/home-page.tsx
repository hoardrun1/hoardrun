'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Progress } from '../components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { formatCurrency } from '@/lib/banking'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  CreditCard, 
  PiggyBank,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Filter,
  RefreshCcw,
  Bell,
  Settings
} from 'lucide-react'
import type { TransactionStatus, TransactionType } from '@prisma/client'
interface TransactionStatusInfo {
  label: string
  color: 'green' | 'yellow' | 'red' | 'gray' | 'blue'
}

interface Transaction {
  id: string
  type: TransactionType
  amount: number
  currency: string
  description?: string
  status: TransactionStatus
  createdAt: string
  beneficiary?: {
    name: string
    accountNumber: string
    bankName: string
  }
}

interface Account {
  id: string
  type: 'SAVINGS' | 'CHECKING' | 'INVESTMENT'
  number: string
  balance: number
  currency: string
  isActive: boolean
  _count?: {
    transactions: number
  }
}

export function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedAccountType, setSelectedAccountType] = useState<'SAVINGS' | 'CHECKING' | 'INVESTMENT' | 'ALL'>('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const { 
    accounts, 
    isLoading: accountsLoading, 
    error: accountsError,
    fetchAccounts, 
    getTotalBalance,
    getAccountsByType 
  } = useBankAccounts()
  
  const { 
    transactions, 
    isLoading: transactionsLoading,
    error: transactionsError,
    fetchTransactionHistory,
    formatTransactionDate,
    getTransactionStatus,
    calculateTotalAmount
  } = useTransactions()

  const loadInitialData = useCallback(async () => {
    try {
      await fetchAccounts()
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    }
  }, [fetchAccounts])

  const loadTransactions = useCallback(async (accountId: string) => {
    try {
      await fetchTransactionHistory(accountId, 1, 5)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }, [fetchTransactionHistory])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  useEffect(() => {
    if (accounts?.[0]?.id) {
      loadTransactions(accounts[0].id)
    }
  }, [accounts, loadTransactions])

  const navigateTo = useCallback((path: string) => {
    router.push(path)
  }, [router])

  const getStatusStyles = useCallback((status: TransactionStatusInfo) => {
    const styles = {
      green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
      yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
      red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
      gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    }
    return styles[status.color]
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        fetchAccounts(),
        accounts[0]?.id && fetchTransactionHistory(accounts[0].id, 1, 5)
      ])
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchAccounts, fetchTransactionHistory, accounts])

  const filteredAccounts = selectedAccountType === 'ALL' 
    ? accounts 
    : getAccountsByType(selectedAccountType)

  const monthlyIncome = calculateTotalAmount('DEPOSIT')
  const monthlyWithdrawals = calculateTotalAmount('WITHDRAWAL')
  const monthlyTransfers = calculateTotalAmount('TRANSFER')
  const monthlyPayments = calculateTotalAmount('PAYMENT')
  
  const monthlyExpenses = monthlyWithdrawals + monthlyTransfers + monthlyPayments
  const savingsProgress = monthlyIncome ? (monthlyIncome - monthlyExpenses) / monthlyIncome * 100 : 0

  if (accountsError || transactionsError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {accountsError || transactionsError}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {user?.name || 'User'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigateTo('/notifications')}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateTo('/settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="mb-2 text-sm text-blue-100">Total Balance</div>
                  {accountsLoading ? (
                    <Skeleton className="h-8 w-32 bg-white/20" />
                  ) : (
                    <h2 className="text-3xl font-bold">
                      {formatCurrency(getTotalBalance())}
                    </h2>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={cn('text-white hover:text-white/80', isRefreshing && 'animate-spin')}
                >
                  <RefreshCcw className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-blue-100 mb-1">
                  <span>Monthly Savings</span>
                  <span>{savingsProgress > 0 ? '+' : ''}{savingsProgress.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={Math.max(0, Math.min(savingsProgress, 100))} 
                  className="h-2 bg-white/20" 
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
                  onClick={() => navigateTo('/send-money')}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Send
                </Button>
                <Button 
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
                  onClick={() => navigateTo('/receive-money')}
                >
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  Receive
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto hover:bg-blue-50 dark:hover:bg-gray-800"
            onClick={() => navigateTo('/cards')}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-gray-800 flex items-center justify-center mb-2">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm">Cards</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto hover:bg-green-50 dark:hover:bg-gray-800"
            onClick={() => navigateTo('/savings')}
          >
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-gray-800 flex items-center justify-center mb-2">
              <PiggyBank className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm">Savings</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto hover:bg-purple-50 dark:hover:bg-gray-800"
            onClick={() => navigateTo('/investment')}
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-gray-800 flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm">Invest</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto hover:bg-orange-50 dark:hover:bg-gray-800"
            onClick={() => navigateTo('/finance')}
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-gray-800 flex items-center justify-center mb-2">
              <Plus className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm">More</span>
          </Button>
        </motion.div>

        {/* Account Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs defaultValue="ALL" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
              <TabsTrigger value="ALL" onClick={() => setSelectedAccountType('ALL')}>
                All Accounts
              </TabsTrigger>
              <TabsTrigger value="CHECKING" onClick={() => setSelectedAccountType('CHECKING')}>
                Checking
              </TabsTrigger>
              <TabsTrigger value="SAVINGS" onClick={() => setSelectedAccountType('SAVINGS')}>
                Savings
              </TabsTrigger>
              <TabsTrigger value="INVESTMENT" onClick={() => setSelectedAccountType('INVESTMENT')}>
                Investment
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedAccountType} className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {accountsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))
                ) : filteredAccounts.map((account: Account) => (
                  <motion.div
                    key={account.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className="p-4 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => navigateTo(`/accounts/${account.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {account.type}
                          </div>
                          <div className="font-medium text-lg">
                            {formatCurrency(account.balance)}
                          </div>
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {account._count?.transactions || 0} transactions
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="pb-20"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-gray-100">Recent Transactions</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full"
                onClick={() => navigateTo('/finance/filters')}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="font-medium"
                onClick={() => navigateTo('/finance')}
              >
                View All
              </Button>
            </div>
          </div>
          
          {transactionsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>No recent transactions</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction: Transaction) => {
                const status = getTransactionStatus(transaction.status);
                const statusStyles = getStatusStyles(status);
                return (
                  <motion.div
                    key={transaction.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Card
                      className="flex items-center justify-between p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigateTo(`/finance/transactions/${transaction.id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn('p-2 rounded-full', statusStyles)}>
                          {transaction.type === 'DEPOSIT' ? (
                            <ArrowDownLeft className="h-5 w-5" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium dark:text-gray-100">
                            {transaction.description || transaction.type}
                            {transaction.beneficiary && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                • {transaction.beneficiary.name}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTransactionDate(transaction.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          'font-medium',
                          transaction.type === 'DEPOSIT' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        )}>
                          {transaction.type === 'DEPOSIT' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className={cn('text-sm px-2 py-1 rounded-full inline-block', statusStyles)}>
                          {status.label}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}