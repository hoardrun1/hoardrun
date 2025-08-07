'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { useBeneficiaries } from '@/hooks/useBeneficiaries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Loader2, 
  AlertCircle, 
  Search,
  Clock,
  Star,
  ChevronRight,
  Info,
  ArrowLeft,
  Users,
  CreditCard,
  Send,
  Check,
  Plus
} from 'lucide-react'
import { formatCurrency, calculateTransactionFee } from '@/lib/banking'
import { AccountType, TransactionType } from '@prisma/client'
import { cn } from '@/lib/utils'
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DepositModal } from '@/components/deposit-modal'
import { MomoClient } from '@/lib/momo-client';
import { MastercardClient } from '@/lib/mastercard-client';
import { VisaClient } from '@/lib/visa-client';

interface Account {
  id: string
  type: AccountType
  number: string
  balance: number
  currency: string
  isActive: boolean
}

interface Beneficiary {
  id: string
  name: string
  accountNumber: string
  bankName: string
  bankCode?: string
  email?: string
  phoneNumber?: string
  isActive: boolean
  transactionCount?: number
}

interface TransactionError {
  message: string
  field?: string
}

interface TransactionPreview {
  amount: number
  fee: number
  total: number
  exchangeRate?: number
  estimatedTime: string
}

interface TransactionData {
  accountId: string
  type: TransactionType
  amount: number
  description?: string
  beneficiaryId: string
}

interface MomoTransferData {
  phone: string
  amount: number
  description?: string
}

const transformBeneficiaries = (beneficiaries: Beneficiary[]) => {
  return beneficiaries.map(b => ({
    ...b,
    transactionCount: Math.floor(Math.random() * 50)
  }))
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  )
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } }
}

export function SendMoneyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { addToast } = useToast()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<TransactionError | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [preview, setPreview] = useState<TransactionPreview | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isBeneficiaryLoading, setIsBeneficiaryLoading] = useState(false)
  const [isAmountFocused, setIsAmountFocused] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [isNewBeneficiaryDialogOpen, setIsNewBeneficiaryDialogOpen] = useState(false)
  const [isMomoTransfer, setIsMomoTransfer] = useState(false)
  const [momoPhone, setMomoPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [isProcessingCard, setIsProcessingCard] = useState(false)
  const [showVisaDeposit, setShowVisaDeposit] = useState(false)
  const [visaCardNumber, setVisaCardNumber] = useState('')
  const [isProcessingVisa, setIsProcessingVisa] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  const {
    accounts, 
    isLoading: accountsLoading, 
    error: accountsError,
    fetchAccounts,
    getAccountById,
  } = useBankAccounts()

  const {
    createTransaction,
    isLoading: transactionLoading,
    error: transactionError,
  } = useTransactions()

  const {
    beneficiaries,
    isLoading: beneficiariesLoading,
    error: beneficiariesError,
    fetchBeneficiaries,
    searchBeneficiaries,
    createBeneficiary,
  } = useBeneficiaries()

  const {
    newBeneficiary,
    setNewBeneficiary,
  } = useBeneficiaries()

  const loadInitialData = useCallback(async () => {
    try {
      await Promise.all([
        fetchAccounts(),
        fetchBeneficiaries()
      ])
    } catch (error) {
      console.error('Failed to load initial data:', error)
    }
  }, [fetchAccounts, fetchBeneficiaries])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  useEffect(() => {
    if (session?.user) {
      fetchBeneficiaries()
      fetchAccounts()
    }
  }, [session, fetchBeneficiaries, fetchAccounts])

  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const numAmount = parseFloat(amount)
      const fee = calculateTransactionFee(numAmount, 'TRANSFER')
      setPreview({
        amount: numAmount,
        fee,
        total: numAmount + fee,
        estimatedTime: '10-30 minutes'
      })
    } else {
      setPreview(null)
    }
  }, [amount])

  const validateAmount = useCallback((value: string): boolean => {
    const numAmount = parseFloat(value)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError({ message: 'Please enter a valid amount', field: 'amount' })
      return false
    }

    const selectedAccount = selectedAccountId ? getAccountById(selectedAccountId) : null
    if (selectedAccount && numAmount > selectedAccount.balance) {
      setError({ message: 'Insufficient funds', field: 'amount' })
      return false
    }

    if (numAmount > 1000000) {
      setError({ message: 'Amount exceeds maximum transfer limit', field: 'amount' })
      return false
    }

    return true
  }, [selectedAccountId, getAccountById])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsProcessing(true)

    try {
      if (!selectedAccountId) {
        throw new Error('Please select an account')
      }

      if (!amount || !validateAmount(amount)) {
        return
      }

      if (isMomoTransfer) {
        if (!momoPhone) {
          throw new Error('Please enter a phone number')
        }

        const momoClient = new MomoClient({
          baseUrl: process.env.NEXT_PUBLIC_MOMO_API_URL!,
          subscriptionKey: process.env.NEXT_PUBLIC_MOMO_SUBSCRIPTION_KEY!,
          targetEnvironment: process.env.NEXT_PUBLIC_MOMO_ENVIRONMENT!,
          apiKey: process.env.NEXT_PUBLIC_MOMO_API_KEY!,
          callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payments/momo/callback`,
        })

        const referenceId = await momoClient.requestToPay(
          parseFloat(amount),
          'EUR',
          momoPhone,
          description || 'Money transfer'
        )

        // Show success animation
        setShowSuccessAnimation(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        router.push('/finance')
      } else {
        if (!selectedBeneficiaryId) {
          throw new Error('Please select a beneficiary')
        }

        const transactionData: TransactionData = {
          accountId: selectedAccountId,
          type: 'TRANSFER',
          amount: parseFloat(amount),
          description: description.trim() || undefined,
          beneficiaryId: selectedBeneficiaryId,
        }

        // Show loading state
        setIsProcessing(true)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Show success animation
        setShowSuccessAnimation(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        router.push('/finance')
      }
    } catch (err) {
      setError({ 
        message: err instanceof Error ? err.message : 'Failed to process transaction'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [
    selectedAccountId,
    amount,
    validateAmount,
    selectedBeneficiaryId,
    description,
    router,
    isMomoTransfer,
    momoPhone
  ])

  const handleBeneficiarySelect = useCallback(async (beneficiaryId: string) => {
    try {
      setIsBeneficiaryLoading(true)
      setSelectedBeneficiaryId(beneficiaryId)
      setError(null)
      setIsSheetOpen(false)
    } catch (error) {
      console.error('Error selecting beneficiary:', error)
      setError({ message: 'Failed to select beneficiary' })
    } finally {
      setIsBeneficiaryLoading(false)
    }
  }, [])

  const selectedAccount = selectedAccountId ? getAccountById(selectedAccountId) : null
  const filteredBeneficiaries = searchQuery 
    ? searchBeneficiaries(searchQuery)
    : beneficiaries

  const transformedBeneficiaries = transformBeneficiaries(beneficiaries)
  const recentBeneficiaries = transformedBeneficiaries.slice(0, 3)
  const frequentBeneficiaries = transformedBeneficiaries
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, 3)

  const renderTransactionPreview = useCallback(() => {
    if (!preview) return null

    return (
      <Card className="p-4 bg-gray-50 dark:bg-gray-800">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Amount:</span>
            <span className="dark:text-gray-200">{formatCurrency(preview.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Fee:</span>
            <span className="dark:text-gray-200">{formatCurrency(preview.fee)}</span>
          </div>
          <Separator className="dark:bg-gray-700" />
          <div className="flex justify-between font-medium">
            <span className="dark:text-gray-200">Total:</span>
            <span className="dark:text-gray-200">{formatCurrency(preview.total)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>Estimated time: {preview.estimatedTime}</span>
          </div>
          {preview.exchangeRate && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Info className="h-4 w-4 mr-1" />
              <span>Exchange rate: {preview.exchangeRate}</span>
            </div>
          )}
        </div>
      </Card>
    )
  }, [preview])

  const renderBeneficiaryList = useCallback((beneficiaries: Beneficiary[]) => {
    return beneficiaries.map((beneficiary) => (
      <motion.div
        key={beneficiary.id}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`p-3 cursor-pointer hover:shadow-md transition-all ${
            isBeneficiaryLoading ? 'opacity-50 pointer-events-none' : ''
          }`}
          onClick={() => handleBeneficiarySelect(beneficiary.id)}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{beneficiary.name}</div>
              <div className="text-sm text-gray-500">
                {beneficiary.bankName} • {beneficiary.accountNumber}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {beneficiary.transactionCount} transfers
            </div>
          </div>
        </Card>
      </motion.div>
    ))
  }, [handleBeneficiarySelect, isBeneficiaryLoading])

  const renderAmountInput = () => (
    <div className="space-y-2">
      <Label>Amount</Label>
      <motion.div
        animate={isAmountFocused ? { scale: 1.02 } : { scale: 1 }}
        className="relative"
      >
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onFocus={() => setIsAmountFocused(true)}
          onBlur={() => setIsAmountFocused(false)}
          placeholder="0.00"
          className="text-2xl font-semibold h-16 text-center pr-20 transition-all"
          step="0.01"
          min="0"
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
      </motion.div>
    </div>
  )

  const isSubmitDisabled = !selectedAccountId || !amount || isProcessing || transactionLoading || 
    !selectedBeneficiaryId || accountsLoading || beneficiariesLoading

  const handleSendMoney = async () => {
    try {
      setIsProcessing(true)

      if (!selectedAccountId || !selectedBeneficiaryId || !amount) {
        throw new Error('Please fill in all required fields')
      }

      const transactionData = {
        accountId: selectedAccountId,
        type: 'TRANSFER',
        amount: parseFloat(amount),
        description,
        beneficiaryId: selectedBeneficiaryId,
      }

      await createTransaction(transactionData)

      // Reset form
      setSelectedBeneficiaryId('')
      setAmount('')
      setDescription('')
      setPreview(null)

      addToast({
        title: 'Success',
        description: 'Money sent successfully',
      })
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send money',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateBeneficiary = async () => {
    try {
      if (!newBeneficiary.name || !newBeneficiary.accountNumber || !newBeneficiary.bankName) {
        throw new Error('Please fill in all required fields')
      }

      await createBeneficiary(newBeneficiary)
      setIsNewBeneficiaryDialogOpen(false)
      setNewBeneficiary({
        name: '',
        accountNumber: '',
        bankName: '',
        bankCode: '',
        email: '',
        phoneNumber: '',
      })

      addToast({
        title: 'Success',
        description: 'Beneficiary added successfully',
      })
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add beneficiary',
        variant: 'destructive',
      })
    }
  }

  const handlePreviewTransaction = useCallback(async () => {
    if (!amount || !selectedAccountId || !selectedBeneficiaryId) return

    try {
      const preview: TransactionPreview = {
        amount: parseFloat(amount),
        fee: parseFloat(amount) * 0.001, // 0.1% fee
        total: parseFloat(amount) * 1.001,
        estimatedTime: '~2 minutes',
      }

      setPreview(preview)
    } catch (error) {
      console.error('Preview error:', error)
      setPreview(null)
    }
  }, [amount, selectedAccountId, selectedBeneficiaryId])

  useEffect(() => {
    handlePreviewTransaction()
  }, [amount, selectedAccountId, selectedBeneficiaryId, handlePreviewTransaction])

  if (accountsLoading || beneficiariesLoading) {
    return <LoadingSkeleton />
  }

  if (accountsError || beneficiariesError) {
    return <ErrorDisplay message={accountsError || beneficiariesError || 'An error occurred'} />
  }

  const handleCardPayment = async () => {
    setIsProcessingCard(true);
    try {
      const response = await fetch('/api/payments/mastercard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: 'EUR',
          cardNumber: cardNumber,
          description: description || 'Card transfer'
        }),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const result = await response.json();
      
      // Show success animation
      setShowSuccessAnimation(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/finance');
    } catch (err) {
      setError({ 
        message: err instanceof Error ? err.message : 'Card payment failed'
      });
    } finally {
      setIsProcessingCard(false);
    }
  };

  const handleVisaDeposit = async () => {
    if (!amount || !visaCardNumber) {
      addToast({
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

      await visaClient.initiateDeposit({
        amount: parseFloat(amount),
        currency: 'EUR',
        cardNumber: visaCardNumber,
        description: 'Visa deposit'
      });

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

      addToast({
        title: "Success",
        description: "Deposit successful",
      });

      // Reset form
      setAmount('');
      setVisaCardNumber('');
      setShowVisaDeposit(false);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Deposit failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessingVisa(false);
    }
  };

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <LayoutWrapper>
          <motion.div
            className="min-h-screen bg-white pt-20 pb-4 px-4 sm:pt-24 sm:pb-6 sm:px-6"
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
        {/* Header */}
        <motion.div 
          className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg sm:text-xl font-semibold">Send Money</h1>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 py-6 max-w-lg">
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
          >
            {error && <ErrorDisplay message={error.message} />}
            
            {/* Account Selection */}
            <motion.div 
              className="space-y-2"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Label>From Account</Label>
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex justify-between items-center">
                        <span>{account.type} - {account.number}</span>
                        <span className="text-gray-500">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Transfer Type Selection */}
            <motion.div 
              className="space-y-2"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Label>Transfer Type</Label>
              <Select
                value={isMomoTransfer ? 'momo' : 'bank'}
                onValueChange={(value) => setIsMomoTransfer(value === 'momo')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select transfer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="momo">MTN Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {isMomoTransfer ? (
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value)}
                  placeholder="Enter recipient's phone number"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>To Beneficiary</Label>
                <Select
                  value={selectedBeneficiaryId}
                  onValueChange={setSelectedBeneficiaryId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select beneficiary" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBeneficiaries.map((beneficiary) => (
                      <SelectItem key={beneficiary.id} value={beneficiary.id}>
                        {beneficiary.name} - {beneficiary.bankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Amount Input with Animation */}
            <motion.div
              className="space-y-2"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              {renderAmountInput()}
            </motion.div>

            {/* Transaction Preview with Animation */}
            <AnimatePresence mode="wait">
              {preview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTransactionPreview()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={isSubmitDisabled}
              >
                {isProcessing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Money
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-full p-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 360]
                }}
                transition={{ duration: 0.5 }}
              >
                <Check className="w-16 h-16 text-green-500" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <CardTitle>Pay with Card</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
              />
              <Input
                placeholder="CVV"
                type="password"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleCardPayment}
              disabled={isProcessingCard}
              className="w-full"
            >
              {isProcessingCard && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay with Card
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onClick={() => setShowVisaDeposit(true)}
        className="mt-4"
      >
        Deposit with Visa
      </Button>

      <Dialog open={showVisaDeposit} onOpenChange={setShowVisaDeposit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit via Visa</DialogTitle>
          </DialogHeader>
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
                'Deposit'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DepositModal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
      />
        </LayoutWrapper>
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}




