'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  ChevronDown, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight, 
  Settings,
  ArrowLeft,
  ChevronRight,
  PieChart,
  BarChart,
  Wallet,
  Globe,
  Shield,
  AlertCircle,
  Info,
  Sparkles,
  Target,
  Clock,
  Filter
} from 'lucide-react'
import { useRouter } from 'next/router'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

const data = [
  { name: 'Jan', value: 4000, profit: 2400 },
  { name: 'Feb', value: 3000, profit: 1398 },
  { name: 'Mar', value: 5000, profit: 3800 },
  { name: 'Apr', value: 2780, profit: 3908 },
  { name: 'May', value: 1890, profit: 4800 },
  { name: 'Jun', value: 2390, profit: 3800 },
  { name: 'Jul', value: 3490, profit: 4300 },
]

const popularInvestments = [
  { 
    name: 'Tech Fund', 
    return: 12.5, 
    trend: 'up',
    description: 'Diversified technology sector fund',
    risk: 'Moderate',
    minInvestment: 1000,
    popularity: 85,
    volatility: 'Medium',
    holdings: ['AAPL', 'MSFT', 'GOOGL'],
    performance: [
      { period: '1M', value: 2.5 },
      { period: '3M', value: 8.2 },
      { period: '1Y', value: 12.5 }
    ]
  },
  { 
    name: 'Real Estate', 
    return: 8.2, 
    trend: 'up',
    description: 'Commercial real estate portfolio',
    risk: 'Low',
    minInvestment: 5000,
    popularity: 72,
    volatility: 'Low',
    holdings: ['Office', 'Retail', 'Industrial'],
    performance: [
      { period: '1M', value: 1.2 },
      { period: '3M', value: 3.8 },
      { period: '1Y', value: 8.2 }
    ]
  },
  { 
    name: 'Green Energy', 
    return: 15.7, 
    trend: 'up',
    description: 'Renewable energy investments',
    risk: 'High',
    minInvestment: 2000,
    popularity: 90,
    volatility: 'High',
    holdings: ['Solar', 'Wind', 'Hydro'],
    performance: [
      { period: '1M', value: 4.2 },
      { period: '3M', value: 10.5 },
      { period: '1Y', value: 15.7 }
    ]
  },
  { 
    name: 'Crypto Blend', 
    return: -5.3, 
    trend: 'down',
    description: 'Diversified cryptocurrency portfolio',
    risk: 'Very High',
    minInvestment: 500,
    popularity: 65,
    volatility: 'Very High',
    holdings: ['BTC', 'ETH', 'SOL'],
    performance: [
      { period: '1M', value: -2.1 },
      { period: '3M', value: -4.8 },
      { period: '1Y', value: -5.3 }
    ]
  },
]

const investmentCategories = [
  { name: 'Stocks', icon: BarChart, color: 'blue', count: 45 },
  { name: 'Crypto', icon: Globe, color: 'purple', count: 12 },
  { name: 'Real Estate', icon: PieChart, color: 'green', count: 8 },
  { name: 'ETFs', icon: TrendingUp, color: 'orange', count: 23 },
]

export function InvestmentPageComponent() {
  const router = useRouter()
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInvestmentSelect = (name: string) => {
    setSelectedInvestment(selectedInvestment === name ? null : name)
  }

  const handleInvestNow = async (investment: any) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Investment Initiated",
        description: `Your investment in ${investment.name} has been initiated.`,
        duration: 5000,
      })
    } catch (error) {
      toast({
        title: "Investment Failed",
        description: "There was an error processing your investment. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 backdrop-blur-lg bg-opacity-80">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold dark:text-white">Investments</h1>
                <Badge variant="secondary" className="ml-2">Beta</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search investments..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 pr-4 transition-all focus:w-80 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 dark:hover:bg-gray-800">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Investment Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
                  Total Investment
                  <Info className="h-4 w-4 text-blue-200" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <div className="flex items-center mt-1 text-blue-100">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+20.1% from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
                  Total Return
                  <Sparkles className="h-4 w-4 text-green-200" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+15.3%</div>
                <div className="flex items-center mt-1 text-green-100">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+4% from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
                  Active Investments
                  <Target className="h-4 w-4 text-purple-200" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <div className="flex items-center mt-1 text-purple-100">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">2 new this month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-100 flex items-center gap-2">
                  Available to Invest
                  <Wallet className="h-4 w-4 text-orange-200" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$10,000.00</div>
                <div className="flex items-center mt-1 text-orange-100">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">Ready to grow</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Investment Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {investmentCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400"
                  onClick={() => setSelectedCategory(category.name.toLowerCase())}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full bg-${category.color}-100 dark:bg-${category.color}-900 flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
                      <Icon className={`h-6 w-6 text-${category.color}-600 dark:text-${category.color}-400`} />
                    </div>
                    <h3 className="font-medium mb-1">{category.name}</h3>
                    <Badge variant="secondary">{category.count} Assets</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Investment Performance</CardTitle>
                  <CardDescription>Your portfolio performance over time</CardDescription>
                </div>
                <Select defaultValue="6m">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">Last Month</SelectItem>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <CartesianGrid 
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    name="Investment Value"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                    name="Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Investment Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <CardTitle>Investment Opportunities</CardTitle>
                  <CardDescription>Explore curated investment options</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {popularInvestments.map((investment, index) => (
                  <motion.div
                    key={investment.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer hover:shadow-md transition-all border-2 ${
                        selectedInvestment === investment.name 
                          ? 'border-blue-500 dark:border-blue-400' 
                          : 'border-transparent'
                      }`}
                      onClick={() => handleInvestmentSelect(investment.name)}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{investment.name}</h3>
                              <Badge variant={investment.risk === 'Low' ? 'secondary' : investment.risk === 'High' ? 'destructive' : 'default'}>
                                {investment.risk}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{investment.description}</p>
                          </div>
                          <div className={`flex items-center ${
                            investment.trend === 'up' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {investment.trend === 'up' ? (
                              <ArrowUpRight className="h-5 w-5" />
                            ) : (
                              <ArrowDownRight className="h-5 w-5" />
                            )}
                            <span className="ml-1 font-semibold">{investment.return}%</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Popularity</span>
                            <div className="flex items-center gap-2">
                              <Progress value={investment.popularity} className="w-24" />
                              <span>{investment.popularity}%</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500 dark:text-gray-400">Volatility</div>
                              <div className="font-medium">{investment.volatility}</div>
                            </div>
                            <div>
                              <div className="text-gray-500 dark:text-gray-400">Min Investment</div>
                              <div className="font-medium">${investment.minInvestment}</div>
                            </div>
                          </div>

                          <div className="flex gap-2 overflow-x-auto">
                            {investment.holdings.map((holding) => (
                              <Badge key={holding} variant="outline">{holding}</Badge>
                            ))}
                          </div>

                          <div className="flex justify-between items-center">
                            {investment.performance.map((perf) => (
                              <div key={perf.period} className="text-center">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{perf.period}</div>
                                <div className={`font-medium ${
                                  perf.value >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  {perf.value > 0 ? '+' : ''}{perf.value}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <AnimatePresence>
                          {selectedInvestment === investment.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t"
                            >
                              <div className="space-y-4">
                                <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-100">
                                  <Info className="h-4 w-4" />
                                  <AlertDescription>
                                    This investment has shown consistent growth over the past year
                                  </AlertDescription>
                                </Alert>
                                <div className="flex items-center text-sm">
                                  <Shield className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>Protected by Investor Insurance</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>Past performance does not guarantee future results</span>
                                </div>
                                <Button 
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleInvestNow(investment)}
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <>
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="mr-2"
                                      >
                                        <Clock className="h-4 w-4" />
                                      </motion.div>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <DollarSign className="h-4 w-4 mr-2" />
                                      Invest Now
                                    </>
                                  )}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}