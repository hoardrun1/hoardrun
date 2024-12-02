'use client'

import { useState } from 'react'
import { Bell, ChevronDown, Send, Download, Plus, ChevronUp, Info, ArrowUpRight, ArrowDownRight, LineChart, DollarSign, Search, Wallet, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Link from 'next/link'

export function HomePageComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [timeframe, setTimeframe] = useState('1D')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
  }

  const timeframes = ['1H', '1D', '1W', '1M', '1Y', 'ALL']
  
  const assets = [
    { name: 'USD Balance', amount: 12435.23, change: 2.5, icon: DollarSign },
    { name: 'Investments', amount: 5678.90, change: -1.2, icon: ArrowUpRight },
    { name: 'Savings', amount: 3421.45, change: 0.8, icon: LineChart },
  ]

  const recentTransactions = [
    { type: 'Received', amount: 500, from: 'John Doe', time: '2 hours ago', status: 'completed' },
    { type: 'Sent', amount: 250, to: 'Alice Smith', time: '5 hours ago', status: 'completed' },
    { type: 'Investment', amount: 1000, to: 'Stock Fund', time: '1 day ago', status: 'processing' },
  ]

  return (
    <div className="min-h-screen bg-[#1a1b1f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1b1f] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Hoardrun</span>
              </Link>
              <nav className="flex items-center space-x-6">
                <Link href="/" className="text-blue-400 font-medium">Overview</Link>
                <Link href="/finance" className="text-gray-400 hover:text-gray-200">Finance</Link>
                <Link href="/cards" className="text-gray-400 hover:text-gray-200">Cards</Link>
                <Link href="/investment" className="text-gray-400 hover:text-gray-200">Investment</Link>
              </nav>
            </div>

            <div className="flex items-center space-x-6">
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-[#2c2d33] border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
              </form>

              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatar.png" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#2c2d33] border-gray-700">
                  <a href="/settings">
                    <DropdownMenuItem className="text-gray-200 hover:bg-gray-700">Profile</DropdownMenuItem>
                  </a>
                  <a href="/settings">
                    <DropdownMenuItem className="text-gray-200 hover:bg-gray-700">Settings</DropdownMenuItem>
                  </a>
                  <a href="/signin">
                    <DropdownMenuItem className="text-gray-200 hover:bg-gray-700">Logout</DropdownMenuItem>
                  </a>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {assets.map((asset, index) => (
              <Card key={index} className="bg-[#2c2d33] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-gray-400 flex items-center space-x-2">
                    <asset.icon className="h-4 w-4" />
                    <span>{asset.name}</span>
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4 text-gray-400" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${asset.amount.toLocaleString()}</div>
                  <div className="flex items-center mt-1">
                    {asset.change >= 0 ? (
                      <ChevronUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(asset.change)}%
                    </span>
                    <span className="text-sm text-gray-400 ml-2">24h</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart Section */}
          <Card className="bg-[#2c2d33] border-gray-800 mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Portfolio Performance</CardTitle>
                <div className="text-sm text-gray-400">Total Balance: $21,535.58</div>
              </div>
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

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link href="/send-money">
              <Button className="bg-blue-600 hover:bg-blue-700 h-20 space-x-2 w-full">
                <Send className="h-5 w-5" />
                <span>Send</span>
              </Button>
            </Link>
            <a href="/receive-money">
              <Button className="bg-[#2c2d33] hover:bg-gray-700 h-20 space-x-2 w-full">
                <Download className="h-5 w-5" />
                <span>Receive</span>
              </Button>
            </a>
            <a href="/savings">
              <Button className="bg-[#2c2d33] hover:bg-gray-700 h-20 space-x-2 w-full">
                <Wallet className="h-5 w-5" />
                <span>Savings</span>
              </Button>
            </a>
            <a href="/settings">
              <Button className="bg-[#2c2d33] hover:bg-gray-700 h-20 space-x-2 w-full">
                <Plus className="h-5 w-5" />
                <span>Settings</span>
              </Button>
            </a>
          </div>

          {/* Recent Transactions */}
          <Card className="bg-[#2c2d33] border-gray-800">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction, index) => (
                  <a href="/finance" key={index} className="block hover:bg-[#2c2d33] transition-colors duration-200">
                    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'Received' ? 'bg-green-500/10' : 
                          transaction.type === 'Sent' ? 'bg-red-500/10' : 'bg-blue-500/10'
                        }`}>
                          {transaction.type === 'Received' ? (
                            <ArrowDownRight className={`h-5 w-5 text-green-500`} />
                          ) : transaction.type === 'Sent' ? (
                            <ArrowUpRight className={`h-5 w-5 text-red-500`} />
                          ) : (
                            <TrendingUp className={`h-5 w-5 text-blue-500`} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{transaction.type}</div>
                          <div className="text-sm text-gray-400">
                            {transaction.from ? `From ${transaction.from}` : `To ${transaction.to}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          transaction.type === 'Received' ? 'text-green-500' : 
                          transaction.type === 'Sent' ? 'text-red-500' : 'text-white'
                        }`}>
                          {transaction.type === 'Received' ? '+' : '-'}${transaction.amount}
                        </div>
                        <div className="text-sm text-gray-400">{transaction.time}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}