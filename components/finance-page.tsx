'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Plus,
  ChevronRight,
  Bell,
  Settings,
  Download,
  Upload,
  PieChart,
  BarChart2
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { responsiveStyles as rs } from '@/styles/responsive-utilities'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const data = [
  { date: '2024-01', income: 5000, expenses: 3500 },
  { date: '2024-02', income: 5500, expenses: 3200 },
  { date: '2024-03', income: 4800, expenses: 3800 },
  { date: '2024-04', income: 6000, expenses: 3600 },
  { date: '2024-05', income: 5200, expenses: 3400 },
  { date: '2024-06', income: 5800, expenses: 3700 },
]

const categories = [
  { name: 'Food & Dining', amount: 850, percentage: 25, color: 'blue' },
  { name: 'Transportation', amount: 500, percentage: 15, color: 'green' },
  { name: 'Shopping', amount: 700, percentage: 20, color: 'purple' },
  { name: 'Bills & Utilities', amount: 1200, percentage: 35, color: 'orange' },
  { name: 'Entertainment', amount: 150, percentage: 5, color: 'red' },
]

const transactions = [
  { 
    id: '1',
    type: 'expense',
    amount: 85.50,
    description: 'Grocery Shopping',
    category: 'Food & Dining',
    date: '2024-03-15',
    merchant: 'Whole Foods'
  },
  { 
    id: '2',
    type: 'income',
    amount: 2500.00,
    description: 'Salary Deposit',
    category: 'Income',
    date: '2024-03-15',
    merchant: 'Company XYZ'
  },
  { 
    id: '3',
    type: 'expense',
    amount: 45.00,
    description: 'Uber Ride',
    category: 'Transportation',
    date: '2024-03-14',
    merchant: 'Uber'
  },
]

export function FinancePageComponent() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <LayoutWrapper className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold dark:text-white">Finance</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search transactions..." 
                  className="w-64 pl-9"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Financial Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Total Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,750.85</div>
                <div className="flex items-center mt-1 text-blue-100">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+8.2% from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-100">Monthly Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$5,800.00</div>
                <div className="flex items-center mt-1 text-green-100">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+12% from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-100">Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$3,700.00</div>
                <div className="flex items-center mt-1 text-orange-100">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+5% from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">Savings Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">36.2%</div>
                <div className="flex items-center mt-1 text-purple-100">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+2.5% from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Financial Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>Track your income and expenses</CardDescription>
                </div>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    name="Income"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorExpenses)" 
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Spending Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Spending Categories</CardTitle>
                  <CardDescription>Your spending breakdown by category</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full bg-${category.color}-500`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium dark:text-white">{category.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">${category.amount}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${category.color}-500`} 
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium">{category.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activities</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Transaction</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Income</SelectItem>
                              <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Amount</Label>
                          <Input type="number" placeholder="Enter amount" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Description</Label>
                          <Input placeholder="Enter description" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Category</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category, index) => (
                                <SelectItem key={index} value={category.name.toLowerCase()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Date</Label>
                          <DatePicker />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Transaction</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium dark:text-white">{transaction.description}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.merchant} • {transaction.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.type === 'income' 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </LayoutWrapper>
  )
}