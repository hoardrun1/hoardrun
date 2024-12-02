'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Copy, Share2, QrCode, Wallet, Building2, Phone, ChevronDown, Bell, Info, CheckCircle2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from 'next/link'
import { motion } from 'framer-motion'

const banks = ['GCB Bank', 'Ecobank', 'Fidelity Bank', 'Zenith Bank', 'Stanbic Bank']
const mobileWallets = ['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money']

export function ReceiveMoneyPageComponent() {
  const [walletAddress, setWalletAddress] = useState('0x1234...5678')
  const [amount, setAmount] = useState('')
  const [selectedBank, setSelectedBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Payment Details',
        text: `Here's my wallet address: ${walletAddress}`,
        url: window.location.href,
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1b1f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1b1f] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">ll
              <Link href="/">
                <Button variant="ghost" size="icon" className="mr-4">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Receive Money</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-6 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Amount Input Card */}
          <Card className="bg-[#2c2d33] border-gray-800 mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-200">Enter Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-grow">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-2xl font-bold bg-[#1a1b1f] border-gray-700 h-14"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-32 bg-[#1a1b1f] border-gray-700">
                    <SelectValue placeholder="USD" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2c2d33] border-gray-700">
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="gbp">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-[#2c2d33] border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-200">Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="wallet" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[#1a1b1f] p-1 gap-1">
                  <TabsTrigger 
                    value="wallet" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Wallet
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bank"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Bank
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mobile"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Mobile
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="wallet">
                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-gray-400">Your Wallet Address</Label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-blue-400 hover:text-blue-300"
                          onClick={() => {}}
                        >
                          <Info className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          value={walletAddress}
                          readOnly
                          className="font-mono bg-[#1a1b1f] border-gray-700"
                        />
                        <Button 
                          onClick={handleCopyAddress}
                          variant="outline"
                          className="bg-[#1a1b1f] border-gray-700 hover:bg-[#2c2d33]"
                        >
                          {copied ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          onClick={handleShare}
                          variant="outline"
                          className="bg-[#1a1b1f] border-gray-700 hover:bg-[#2c2d33]"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="bg-[#1a1b1f] p-6 rounded-lg border border-gray-700 flex items-center justify-center">
                        <QrCode className="h-32 w-32 text-gray-400" />
                      </div>
                      <p className="text-center text-sm text-gray-400 mt-4">
                        Scan QR code to get wallet address
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bank">
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-gray-400">Select Bank</Label>
                      <Select value={selectedBank} onValueChange={setSelectedBank}>
                        <SelectTrigger className="bg-[#1a1b1f] border-gray-700">
                          <SelectValue placeholder="Choose your bank" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2c2d33] border-gray-700">
                          {banks.map((bank) => (
                            <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-400">Account Number</Label>
                      <Input
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="bg-[#1a1b1f] border-gray-700"
                        placeholder="Enter your account number"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mobile">
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-gray-400">Select Mobile Wallet</Label>
                      <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                        <SelectTrigger className="bg-[#1a1b1f] border-gray-700">
                          <SelectValue placeholder="Choose mobile wallet" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2c2d33] border-gray-700">
                          {mobileWallets.map((wallet) => (
                            <SelectItem key={wallet} value={wallet}>{wallet}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-400">Phone Number</Label>
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-[#1a1b1f] border-gray-700"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="mt-6">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold"
              onClick={() => {}}
            >
              Generate Payment Link
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}