'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Briefcase, GraduationCap, Home as HomeIcon, PiggyBank, DollarSign, TrendingUp, Target, Plus, Bell, Sun, Moon, ChevronUp, ChevronDown, BarChart2, LineChart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import Link from 'next/link'
import { motion } from 'framer-motion'

export function SavingsPageComponent() {
  const [activeShortTerm, setActiveShortTerm] = useState('goal-based')
  const [activeLongTerm, setActiveLongTerm] = useState('retirement')
  const [savingsAmount, setSavingsAmount] = useState(500)
  const [savingsFrequency, setSavingsFrequency] = useState('monthly')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [timeframe, setTimeframe] = useState('1D')

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const shortTermOptions = [
    { id: 'goal-based', title: 'Goal-Based Savings', icon: Target, description: 'Set specific savings goals with target amounts and deadlines.' },
    { id: 'automated', title: 'Automated Savings', icon: PiggyBank, description: 'Set up automatic transfers from checking to savings.' },
    { id: 'round-up', title: 'Round-Up Savings', icon: DollarSign, description: 'Round purchases to the nearest dollar and save the difference.' },
    { id: 'budget', title: 'Budget Tracking', icon: TrendingUp, description: 'Analyze spending habits to identify savings opportunities.' },
  ]

  const longTermOptions = [
    { id: 'retirement', title: 'Retirement Savings', icon: Briefcase, description: 'View and manage your retirement account balances and contributions.' },
    { id: 'college', title: 'College Savings', icon: GraduationCap, description: 'Save for your children&apos;s future education expenses.' },
    { id: 'down-payment', title: 'Down Payment Savings', icon: HomeIcon, description: 'Save for a down payment on a new home.' },
  ]

  const savingsGoals = [
    { id: 1, name: 'Emergency Fund', current: 2000, target: 10000, deadline: '2024-12-31', change: 5.2 },
    { id: 2, name: 'Vacation', current: 1500, target: 3000, deadline: '2024-06-30', change: -2.1 },
    { id: 3, name: 'New Laptop', current: 500, target: 1500, deadline: '2024-09-30', change: 1.8 },
  ]

  const timeframes = ['1H', '1D', '1W', '1M', '1Y', 'ALL']

  return (
    <div className="min-h-screen bg-[#1a1b1f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1b1f] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="icon" className="mr-4">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Savings Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="bg-[#2c2d33] text-white border-gray-700">
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-[#2c2d33] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Total Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$4,000.00</div>
                <div className="flex items-center mt-1">
                  <ChevronUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+2.5%</span>
                  <span className="text-sm text-gray-400 ml-2">24h</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#2c2d33] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Monthly Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$500.00</div>
                <div className="flex items-center mt-1">
                  <BarChart2 className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-gray-400">Auto-saving active</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#2c2d33] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Goals Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3/5</div>
                <Progress value={60} className="mt-2 bg-gray-700" />
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <Card className="bg-[#2c2d33] border-gray-800 mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Savings Growth</CardTitle>
              <div className="flex space-x-2">
                {timeframes.map((tf) => (
                  <Button
                    key={tf}
                    variant={timeframe === tf ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe(tf)}
                    className={timeframe === tf ? "bg-blue-600 text-white" : "text-gray-400"}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <LineChart className="h-8 w-8" />
                <span className="ml-2">Chart visualization would go here</span>
              </div>
            </CardContent>
          </Card>

          {/* Savings Goals Table */}
          <Card className="bg-[#2c2d33] border-gray-800">
            <CardHeader>
              <CardTitle>Active Savings Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-400">
                      <th className="pb-4">Goal</th>
                      <th className="pb-4">Progress</th>
                      <th className="pb-4">Current/Target</th>
                      <th className="pb-4">24h Change</th>
                      <th className="pb-4">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsGoals.map((goal) => (
                      <tr key={goal.id} className="border-t border-gray-800">
                        <td className="py-4">
                          <div className="font-medium">{goal.name}</div>
                        </td>
                        <td className="py-4">
                          <Progress 
                            value={(goal.current / goal.target) * 100} 
                            className="w-32 bg-gray-700"
                          />
                        </td>
                        <td className="py-4">
                          ${goal.current.toLocaleString()}/{goal.target.toLocaleString()}
                        </td>
                        <td className="py-4">
                          <div className={`flex items-center ${goal.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {goal.change >= 0 ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                            {Math.abs(goal.change)}%
                          </div>
                        </td>
                        <td className="py-4 text-gray-400">{goal.deadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}