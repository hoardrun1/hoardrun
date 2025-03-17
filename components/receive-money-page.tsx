'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Copy, 
  Share2, 
  QrCode, 
  Wallet, 
  Building2, 
  Phone, 
  Bell, 
  Info, 
  CheckCircle2,
  ArrowUpRight,
  Clock,
  Settings,
  Download,
  Shield
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency } from '@/lib/banking'
import { MomoClient } from '@/lib/momo-client'
import { MastercardClient } from '@/lib/mastercard-client'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { VisaClient } from '@/lib/visa-client'

const banks = ['GCB Bank', 'Ecobank', 'Fidelity Bank', 'Zenith Bank', 'Stanbic Bank']
const mobileWallets = ['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money']

const paymentStats = [
  {
    title: 'Total Received',
    amount: 15250.75,
    change: 12.5,
    color: 'blue'
  },
  {
    title: 'Pending',
    amount: 500.00,
    change: -2.3,
    color: 'orange'
  },
  {
    title: 'Last 7 Days',
    amount: 3200.50,
    change: 8.7,
    color: 'green'
  },
  {
    title: 'Average',
    amount: 458.65,
    change: 5.2,
    color: 'purple'
  }
]

export function ReceiveMoneyPageComponent() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState('0x1234...5678')
  const [amount, setAmount] = useState('')
  const [selectedBank, setSelectedBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrVisible, setQrVisible] = useState(false)
  const { data: session } = useSession()
  const [momoPhone, setMomoPhone] = useState('')
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [isGeneratingCardLink, setIsGeneratingCardLink] = useState(false)
  const [paymentLink, setPaymentLink] = useState('')
  const { toast } = useToast()
  const [isProcessingVisa, setIsProcessingVisa] = useState(false)
  const [visaCardNumber, setVisaCardNumber] = useState('')

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

  const handleGeneratePaymentLink = async () => {
    if (!amount || !momoPhone) {
      toast({
        title: "Error",
        description: "Please enter amount and phone number",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingLink(true)
    try {
      const response = await fetch('/api/payments/momo/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          phone: momoPhone,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate payment link')
      }

      const data = await response.json()
      
      toast({
        title: "Success",
        description: "Payment link generated and sent to the phone number",
      })

      // Clear form
      setAmount('')
      setMomoPhone('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate payment link",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const handleGenerateCardPaymentLink = async () => {
    if (!amount) {
      toast({
        title: "Error",
        description: "Please enter amount",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingCardLink(true);
    try {
      const response = await fetch('/api/payments/mastercard/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: 'EUR',
          description: 'Payment request'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate payment link');
      }

      const { paymentUrl } = await response.json();
      setPaymentLink(paymentUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate payment link",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCardLink(false);
    }
  };

  const handleVisaDeposit = async () => {
    if (!amount || !visaCardNumber) {
      toast({
        title: "Error",
        description: "Please enter amount and card number",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingVisa(true);
    try {
      const visaClient = new VisaClient({
        apiKey: 'U2CB9EXCQOX9FPUT6DUS2106HUAHml5g_sDhH1Ql_oOq0D0xQ',
        environment: 'sandbox'
      });

      const response = await visaClient.initiateDeposit({
        amount: parseFloat(amount),
        currency: 'EUR',
        cardNumber: visaCardNumber,
        description: 'Visa deposit'
      });

      // Update user's balance
      await fetch('/api/user/balance/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type: 'DEPOSIT',
          provider: 'VISA'
        }),
      });

      toast({
        title: "Success",
        description: "Deposit successful",
      });

      // Reset form
      setAmount('');
      setVisaCardNumber('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Deposit failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessingVisa(false);
    }
  };

  return (
    <LayoutWrapper className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
              <h1 className="text-xl font-semibold dark:text-white">Receive Money</h1>
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
        {/* Payment Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {paymentStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 text-white`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm font-medium text-${stat.color}-100`}>{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stat.amount)}</div>
                  <div className="flex items-center mt-1 text-blue-100">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span className="text-sm">{stat.change > 0 ? '+' : ''}{stat.change}% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Amount Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Request Amount</CardTitle>
              <CardDescription>Enter the amount you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-grow">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-2xl font-bold h-16 text-center pr-20"
                    />
                    <Select defaultValue="usd">
                      <SelectTrigger className="absolute right-0 top-0 bottom-0 w-20 border-l">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD</SelectItem>
                        <SelectItem value="eur">EUR</SelectItem>
                        <SelectItem value="gbp">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how you want to receive money</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="wallet" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="wallet" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    <Wallet className="h-4 w-4 mr-2" />
                    Wallet
                  </TabsTrigger>
                  <TabsTrigger value="bank" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    <Building2 className="h-4 w-4 mr-2" />
                    Bank
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    <Phone className="h-4 w-4 mr-2" />
                    Mobile
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="wallet">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-gray-500 dark:text-gray-400">Your Wallet Address</Label>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Info className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Wallet Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Wallet Address</div>
                                <div className="font-mono break-all">{walletAddress}</div>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Shield className="h-4 w-4 mr-2" />
                                Your wallet is protected by end-to-end encryption
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          value={walletAddress}
                          readOnly
                          className="font-mono bg-gray-50 dark:bg-gray-800"
                        />
                        <Button 
                          onClick={handleCopyAddress}
                          variant="outline"
                          className="min-w-[40px]"
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
                          className="min-w-[40px]"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="relative"
                      >
                        <Card className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="absolute top-2 right-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setQrVisible(!qrVisible)}
                              >
                                {qrVisible ? 'Hide QR' : 'Show QR'}
                              </Button>
                            </div>
                            <AnimatePresence>
                              {qrVisible && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex flex-col items-center justify-center pt-4"
                                >
                                  <div className="bg-white p-4 rounded-lg shadow-inner">
                                    <QrCode className="h-48 w-48 text-gray-800" />
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                    Scan QR code to get wallet address
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </TabsContent>

                <TabsContent value="bank">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Bank</Label>
                      <Select value={selectedBank} onValueChange={setSelectedBank}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {banks.map((bank) => (
                            <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter your account number"
                      />
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Bank transfers typically take 1-3 business days to process
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>

                <TabsContent value="mobile">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Mobile Wallet</Label>
                      <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose mobile wallet" />
                        </SelectTrigger>
                        <SelectContent>
                          {mobileWallets.map((wallet) => (
                            <SelectItem key={wallet} value={wallet}>{wallet}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        type="tel"
                        value={momoPhone}
                        onChange={(e) => setMomoPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleGeneratePaymentLink}
                      disabled={isGeneratingLink}
                    >
                      {isGeneratingLink ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Link...
                        </>
                      ) : (
                        'Generate Payment Link'
                      )}
                    </Button>

                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Mobile money transfers are usually instant
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Receive Card Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button 
                onClick={handleGenerateCardPaymentLink}
                disabled={isGeneratingCardLink}
                className="w-full"
              >
                {isGeneratingCardLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Payment Link
              </Button>
              {paymentLink && (
                <div className="mt-4">
                  <Label>Payment Link</Label>
                  <div className="flex items-center gap-2">
                    <Input value={paymentLink} readOnly />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(paymentLink);
                        toast({
                          title: "Copied",
                          description: "Payment link copied to clipboard",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Deposit via Visa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Card Number"
                value={visaCardNumber}
                onChange={(e) => setVisaCardNumber(e.target.value)}
              />
              <Button 
                onClick={handleVisaDeposit}
                disabled={isProcessingVisa}
                className="w-full"
              >
                {isProcessingVisa ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Deposit with Visa'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold"
            onClick={() => {}}
          >
            Generate Payment Link
          </Button>
        </motion.div>
      </main>
    </LayoutWrapper>
  )
}









