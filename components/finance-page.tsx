'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Plus, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 9800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 1890, expenses: 4800 },
  { name: 'Jun', income: 2390, expenses: 3800 },
  { name: 'Jul', income: 3490, expenses: 4300 },
]

const recentTransactions = [
  { id: 1, name: 'Salary Deposit', amount: 5000, type: 'income' },
  { id: 2, name: 'Rent Payment', amount: 1200, type: 'expense' },
  { id: 3, name: 'Grocery Shopping', amount: 150, type: 'expense' },
  { id: 4, name: 'Freelance Income', amount: 800, type: 'income' },
]

export function FinancePageComponent() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                Hoardrun
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/">Home</Link>
              <Link href="/finance" className="text-foreground">Finance</Link>
              <Link href="/cards">Cards</Link>
              <Link href="/investment">Investment</Link>
              <Link href="/settings">Settings</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions" className="pl-8" />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? '🌞' : '🌙'}
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="@johndoe" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Finance Overview</h1>
            <p className="text-muted-foreground">
              Track your income, expenses, and financial goals.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,345.67</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$8,000.00</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$3,500.00</div>
                <p className="text-xs text-muted-foreground">-5.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">75%</div>
                <p className="text-xs text-muted-foreground">$15,000 / $20,000</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="income" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{transaction.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{transaction.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </p>
                      </div>
                      <div className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4 inline mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 inline mr-1" />
                        )}
                        ${transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Income
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                  </Button>
                  <Button className="w-full" variant="secondary">
                    <CreditCard className="mr-2 h-4 w-4" /> Manage Budget
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Track your progress towards your financial goals.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Emergency Fund</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Vacation Savings</span>
                      <span className="text-sm font-medium">50%</span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">New Car</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}