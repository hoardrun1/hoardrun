'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, CreditCard, Smartphone, Building, Sun, Moon, DollarSign } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const walletProviders = ['M-Pesa', 'MTN Mobile Money', 'Airtel Money', 'Vodafone Cash']

export function SendMoneyPageComponent() {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('mobile')
  const [walletProvider, setWalletProvider] = useState('')
  const [walletNumber, setWalletNumber] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Sending money:', { amount, method, walletProvider, walletNumber })
    // Here you would typically integrate with a payment service
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Back to Home</span>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Send Money</h1>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              <span className="sr-only">Toggle dark mode</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Send Money</CardTitle>
              <CardDescription>Choose your preferred method to send money.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to send</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      type="number"
                      id="amount"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <RadioGroup value={method} onValueChange={setMethod} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Label htmlFor="mobile" className="flex items-center cursor-pointer">
                      <Smartphone className="h-5 w-5 mr-2" />
                      Mobile Wallet
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center cursor-pointer">
                      <Building className="h-5 w-5 mr-2" />
                      Bank Transfer
                    </Label>
                  </div>
                </RadioGroup>

                <AnimatePresence mode="wait">
                  {method === 'mobile' && (
                    <motion.div
                      key="mobile"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="wallet-provider">Mobile Wallet Provider</Label>
                        <Select value={walletProvider} onValueChange={setWalletProvider}>
                          <SelectTrigger id="wallet-provider">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {walletProviders.map((provider) => (
                              <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wallet-number">Mobile Wallet Number</Label>
                        <Input
                          type="tel"
                          id="wallet-number"
                          placeholder="Enter your mobile wallet number"
                          value={walletNumber}
                          onChange={(e) => setWalletNumber(e.target.value)}
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {method === 'card' && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" type="text" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="flex space-x-4">
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" type="text" placeholder="MM / YY" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" type="text" placeholder="123" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {method === 'bank' && (
                    <motion.div
                      key="bank"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="account-number">Account Number</Label>
                        <Input id="account-number" type="text" placeholder="Enter account number" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="routing-number">Routing Number</Label>
                        <Input id="routing-number" type="text" placeholder="Enter routing number" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Send Now</Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'John Doe', amount: 50, date: '2024-03-01' },
                  { name: 'Jane Smith', amount: 75, date: '2024-02-28' },
                  { name: 'Bob Johnson', amount: 100, date: '2024-02-27' },
                ].map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{transaction.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-red-600">-${transaction.amount}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}