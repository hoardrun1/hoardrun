'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, CreditCard, Plus, Lock, Eye, EyeOff, DollarSign, Sliders } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const cards = [
  { id: 1, name: 'Hoardrun Platinum', number: '**** **** **** 1234', balance: 5000, limit: 10000, type: 'Visa', color: 'from-purple-400 to-blue-500' },
  { id: 2, name: 'Hoardrun Gold', number: '**** **** **** 5678', balance: 2500, limit: 5000, type: 'Mastercard', color: 'from-yellow-400 to-orange-500' },
]

export function ManageCardsPageComponent() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showCardDetails, setShowCardDetails] = useState<{ [key: number]: boolean }>({})

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  const toggleCardDetails = (cardId: number) => {
    setShowCardDetails(prev => ({ ...prev, [cardId]: !prev[cardId] }))
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
              <Link href="../home-page.tsx">Home</Link>
              <Link href="../finance-page.tsx">Finance</Link>
              <Link href="../cards-page.tsx" className="text-foreground">Cards</Link>
              <Link href="../investment-page.tsx">Investment</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search cards" className="pl-8" />
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
            <h1 className="text-3xl font-bold tracking-tight">Manage Cards</h1>
            <p className="text-muted-foreground">
              View and manage your Hoardrun cards.
            </p>
          </div>

          <Tabs defaultValue="physical" className="w-full">
            <TabsList>
              <TabsTrigger value="physical">Physical Cards</TabsTrigger>
              <TabsTrigger value="virtual">Virtual Cards</TabsTrigger>
            </TabsList>
            <TabsContent value="physical">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`overflow-hidden bg-gradient-to-br ${card.color}`}>
                      <CardHeader className="relative pb-8">
                        <CardTitle className="text-white">{card.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-4 text-white hover:bg-white/20"
                          onClick={() => toggleCardDetails(card.id)}
                        >
                          {showCardDetails[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </CardHeader>
                      <CardContent className="bg-white/10 backdrop-blur-sm p-6 text-white">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold">{showCardDetails[card.id] ? card.number : '**** **** **** ****'}</span>
                            <CreditCard className="h-6 w-6" />
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Balance</span>
                            <span className="font-semibold">${card.balance.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Limit</span>
                            <span className="font-semibold">${card.limit.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Type</span>
                            <span className="font-semibold">{card.type}</span>
                          </div>
                          <div className="flex space-x-2 pt-4">
                            <Button className="flex-1 bg-white/20 hover:bg-white/30 text-white">
                              <Lock className="mr-2 h-4 w-4" /> Lock Card
                            </Button>
                            <Button variant="outline" className="flex-1 border-white/40 text-white hover:bg-white/20">
                              <Sliders className="mr-2 h-4 w-4" /> Settings
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card className="flex items-center justify-center h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                    <CardContent>
                      <Button variant="outline" className="w-full h-32 border-dashed border-2 border-gray-400 dark:border-gray-600">
                        <Plus className="mr-2 h-6 w-6" /> Add New Card
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
            <TabsContent value="virtual">
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">No Virtual Cards Yet</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Create a virtual card for safer online transactions and easy management.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Virtual Card
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index % 2 === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{index % 2 === 0 ? 'Online Purchase' : 'ATM Withdrawal'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${index % 2 === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {index % 2 === 0 ? '-$89.99' : '+$200.00'}
                    </p>
                  </div>
                ))}
              </div>
              <Button variant="link" className="mt-4 w-full">View All Transactions</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}