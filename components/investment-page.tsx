'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, ChevronDown, Search, TrendingUp, DollarSign, Percent, ArrowUpRight, ArrowDownRight, Sun, Moon, Menu } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
]

const popularInvestments = [
  { name: 'Tech Fund', return: 12.5, trend: 'up' },
  { name: 'Real Estate', return: 8.2, trend: 'up' },
  { name: 'Green Energy', return: 15.7, trend: 'up' },
  { name: 'Crypto Blend', return: -5.3, trend: 'down' },
]

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'jp', label: 'Japan' },
  { value: 'de', label: 'Germany' },
]

export function InvestmentPageComponent() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('us')
  const [shareType, setShareType] = useState('ordinary')

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

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <img src="/logo.svg" alt="Hoardrun Logo" className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                Hoardrun
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/">Home</Link>
              <Link href="/finance">Finance</Link>
              <Link href="/cards">Cards</Link>
              <Link href="/investment" className="text-blue-600">Investment</Link>
            </nav>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search investments" className="pl-8 w-full md:w-[300px]" />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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

      <main className="flex-1 container py-6 md:py-10">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Investment Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your investments and explore new opportunities.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={shareType} onValueChange={setShareType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select share type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordinary">Ordinary Shares</SelectItem>
                <SelectItem value="preference">Preference Shares</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+15.3%</div>
                <p className="text-xs text-muted-foreground">+4% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 new this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available to Invest</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$10,000.00</div>
                <p className="text-xs text-muted-foreground">Ready to grow</p>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Investment Performance</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Popular Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {popularInvestments.map((investment, index) => (
                    <div key={index} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`/placeholder-${index + 1}.svg`} alt="Avatar" />
                        <AvatarFallback>{investment.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{investment.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {investment.return}% return
                        </p>
                      </div>
                      <div className={`ml-auto font-medium ${investment.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {investment.trend === 'up' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Invest</CardTitle>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Input id="amount" placeholder="Enter amount" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">Select Investment <ChevronDown className="ml-2 h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Tech Fund</DropdownMenuItem>
                          <DropdownMenuItem>Real Estate</DropdownMenuItem>
                          <DropdownMenuItem>Green Energy</DropdownMenuItem>
                          <DropdownMenuItem>Crypto Blend</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">Invest Now</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Investment Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="stocks">Stocks</TabsTrigger>
                  <TabsTrigger value="crypto">Crypto</TabsTrigger>
                  <TabsTrigger value="realestate">Real Estate</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {['Tech Giants ETF', 'Green Energy Fund', 'Bitcoin Trust', 'Real Estate REIT'].map((item, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle>{item}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-semibold">+12.5%</p>
                          <p className="text-xs text-muted-foreground">Annual return</p>
                          <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">Invest</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="stocks">Stocks content</TabsContent>
                <TabsContent value="crypto">Crypto content</TabsContent>
                <TabsContent value="realestate">Real Estate content</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}