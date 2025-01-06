'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  ChevronRight,
  Bell,
  Settings,
  Download,
  Sparkles,
  Trophy,
  Clock,
  Rocket,
  Shield
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { responsiveStyles as rs } from '@/styles/responsive-utilities'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const savingsData = [
  { date: '2024-01', amount: 2000, target: 2500 },
  { date: '2024-02', amount: 4500, target: 5000 },
  { date: '2024-03', amount: 7200, target: 7500 },
  { date: '2024-04', amount: 9800, target: 10000 },
  { date: '2024-05', amount: 12500, target: 12500 },
  { date: '2024-06', amount: 15000, target: 15000 },
]

const savingsGoals = [
  {
    id: '1',
    name: 'Emergency Fund',
    currentAmount: 12500,
    targetAmount: 15000,
    deadline: '2024-12-31',
    category: 'Emergency',
    progress: 83,
    monthlyContribution: 500,
    isAutoSave: true
  },
  {
    id: '2',
    name: 'Dream Vacation',
    currentAmount: 3500,
    targetAmount: 5000,
    deadline: '2024-09-30',
    category: 'Travel',
    progress: 70,
    monthlyContribution: 300,
    isAutoSave: true
  },
  {
    id: '3',
    name: 'New Car',
    currentAmount: 8000,
    targetAmount: 20000,
    deadline: '2025-06-30',
    category: 'Vehicle',
    progress: 40,
    monthlyContribution: 800,
    isAutoSave: false
  }
]

const savingsTips = [
  {
    title: '50/30/20 Rule',
    description: 'Allocate 50% for needs, 30% for wants, and 20% for savings.',
    icon: PiggyBank
  },
  {
    title: 'Automate Savings',
    description: 'Set up automatic transfers to your savings account.',
    icon: Clock
  },
  {
    title: 'Set Clear Goals',
    description: 'Define specific savings goals with deadlines.',
    icon: Target
  },
  {
    title: 'Track Progress',
    description: 'Regularly monitor your savings progress.',
    icon: TrendingUp
  }
]

export function SavingsPageComponent() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)

  const calculateTimeLeft = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = Math.abs(deadlineDate.getTime() - now.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <LayoutWrapper className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold dark:text-white">Savings</h1>
            </div>
            <div className="flex items-center gap-3">
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
        {/* Savings Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Total Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$24,000.00</div>
                <div className="flex items-center mt-1 text-blue-100">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+15.3% from last month</span>
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
                <CardTitle className="text-sm font-medium text-green-100">Monthly Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,600.00</div>
                <div className="flex items-center mt-1 text-green-100">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+8% from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">Active Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savingsGoals.length}</div>
                <div className="flex items-center mt-1 text-purple-100">
                  <Target className="h-4 w-4 mr-1" />
                  <span className="text-sm">On track</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-100">Auto-Save</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,600.00</div>
                <div className="flex items-center mt-1 text-orange-100">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">Monthly</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Savings Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Savings Progress</CardTitle>
                  <CardDescription>Track your savings journey</CardDescription>
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
                <AreaChart data={savingsData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                    name="Current Amount"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#colorTarget)" 
                    name="Target Amount"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold dark:text-white">Savings Goals</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Savings Goal</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Goal Name</Label>
                    <Input placeholder="Enter goal name" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Target Amount</Label>
                    <Input type="number" placeholder="Enter target amount" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Monthly Contribution</Label>
                    <Input type="number" placeholder="Enter monthly contribution" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Target Date</Label>
                    <DatePicker />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="auto-save" />
                    <Label htmlFor="auto-save">Enable Auto-Save</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Goal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savingsGoals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{goal.name}</CardTitle>
                      {goal.isAutoSave && (
                        <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                          <Clock className="h-3 w-3" />
                          Auto-Save
                        </div>
                      )}
                    </div>
                    <CardDescription>{goal.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="text-sm font-medium">{goal.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressColor(goal.progress)} transition-all duration-500`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Current</div>
                          <div className="font-medium dark:text-white">${goal.currentAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Target</div>
                          <div className="font-medium dark:text-white">${goal.targetAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Monthly</div>
                          <div className="font-medium dark:text-white">${goal.monthlyContribution}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Days Left</div>
                          <div className="font-medium dark:text-white">{calculateTimeLeft(goal.deadline)}</div>
                        </div>
                      </div>

                      <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button className="w-full">Manage Goal</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Savings Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <CardTitle>Smart Savings Tips</CardTitle>
              </div>
              <CardDescription>Expert advice to boost your savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {savingsTips.map((tip, index) => {
                  const Icon = tip.icon
                  return (
                    <Card key={index} className="bg-gray-50 dark:bg-gray-800 border-0">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-medium mb-2 dark:text-white">{tip.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{tip.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </LayoutWrapper>
  )
}