'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Search, 
  CreditCard, 
  Plus, 
  Lock, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Sliders,
  ArrowLeft,
  ChevronRight,
  Settings,
  Shield,
  Wallet,
  History
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const cards = [
  { 
    id: 1, 
    name: 'Hoardrun Platinum', 
    number: '**** **** **** 1234', 
    balance: 5000, 
    limit: 10000, 
    type: 'Visa', 
    color: 'from-violet-500 to-purple-600',
    expiryMonth: '12',
    expiryYear: '25',
    cvv: '***'
  },
  { 
    id: 2, 
    name: 'Hoardrun Gold', 
    number: '**** **** **** 5678', 
    balance: 2500, 
    limit: 5000, 
    type: 'Mastercard', 
    color: 'from-yellow-500 to-orange-600',
    expiryMonth: '09',
    expiryYear: '24',
    cvv: '***'
  },
]

const recentTransactions = [
  { id: 1, type: 'purchase', amount: -89.99, merchant: 'Amazon', date: '2023-12-20', category: 'Shopping' },
  { id: 2, type: 'withdrawal', amount: -200, merchant: 'ATM', date: '2023-12-19', category: 'Cash' },
  { id: 3, type: 'refund', amount: 45.50, merchant: 'Nike Store', date: '2023-12-18', category: 'Shopping' },
]

export function ManageCardsPageComponent() {
  const router = useRouter()
  const [showCardDetails, setShowCardDetails] = useState<{ [key: number]: boolean }>({})
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const toggleCardDetails = (cardId: number) => {
    setShowCardDetails(prev => ({ ...prev, [cardId]: !prev[cardId] }))
  }

  const handleCardClick = (cardId: number) => {
    setSelectedCard(cardId === selectedCard ? null : cardId)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Cards</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search transactions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-12">
          {/* Main Content */}
          <div className="md:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <Card 
                      className={`overflow-hidden bg-gradient-to-br ${card.color} cursor-pointer`}
                      onClick={() => handleCardClick(card.id)}
                    >
                      <CardContent className="p-6 text-white">
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h3 className="font-semibold">{card.name}</h3>
                            <p className="text-sm text-white/80">{card.type}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleCardDetails(card.id)
                            }}
                          >
                            {showCardDetails[card.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <div className="text-xl font-mono tracking-wider">
                            {showCardDetails[card.id] ? card.number : '**** **** **** ****'}
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div>
                              <div className="text-white/80">Expires</div>
                              <div>{card.expiryMonth}/{card.expiryYear}</div>
                            </div>
                            <div>
                              <div className="text-white/80">CVV</div>
                              <div>{showCardDetails[card.id] ? card.cvv : '***'}</div>
                            </div>
                            <div>
                              <div className="text-white/80">Balance</div>
                              <div>${card.balance.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <AnimatePresence>
                      {selectedCard === card.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="mt-4 space-y-2"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" className="w-full">
                              <Lock className="mr-2 h-4 w-4" />
                              Lock
                            </Button>
                            <Button variant="outline" className="w-full">
                              <Shield className="mr-2 h-4 w-4" />
                              Limits
                            </Button>
                            <Button variant="outline" className="w-full">
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Add New Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed">
                    <CardContent className="h-full flex items-center justify-center p-6">
                      <Button variant="ghost" className="flex flex-col gap-2 h-auto py-8">
                        <Plus className="h-8 w-8" />
                        <span>Add New Card</span>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                      <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">Add Money</span>
                  </div>
                </Card>
                <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-2">
                      <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium">Security</span>
                  </div>
                </Card>
                <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
                      <Sliders className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium">Limits</span>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <Button variant="ghost" size="sm" className="text-sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        whileHover={{ x: 2 }}
                        className="flex items-center justify-between py-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{transaction.merchant}</div>
                            <div className="text-sm text-gray-500">{transaction.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Spending Analytics */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Spending Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">Monthly Limit</div>
                      <div className="font-medium">$10,000</div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: '65%' }}
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      $6,500 spent of $10,000 limit
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}