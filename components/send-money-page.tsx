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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Loader2, 
  AlertCircle, 
  Clock,
  ArrowLeft,
  Send,
  Check,
  DollarSign,
  User,
  CreditCard,
  Smartphone
} from 'lucide-react'
import { formatCurrency, calculateTransactionFee } from '@/lib/banking'
import { cn } from '@/lib/utils'
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DepositModal } from '@/components/deposit-modal'
import { MomoClient } from '@/lib/momo-client'
import { MastercardClient } from '@/lib/mastercard-client'
import { VisaClient } from '@/lib/visa-client'

// Types
type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT'
type TransactionType = 'SEND' | 'RECEIVE' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'

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
}

interface TransactionPreview {
  amount: number
  fee: number
  total: number
  estimatedTime: string
}

interface TransactionData {
  accountId: string
  type: TransactionType
  amount: number
  description?: string
  beneficiaryId: string
}

// Loading Component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto pt-20 px-4 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

// Error Component
function ErrorDisplay({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function SendMoneyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Form state
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('')
  const [transferType, setTransferType] = useState<'bank' | 'momo' | 'card'>('bank')
  const [momoPhone, setMomoPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  
  // UI state
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<TransactionPreview | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  // Hooks
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
  } = useTransactions()

  const {
    beneficiaries,
    isLoading: beneficiariesLoading,
    error: beneficiariesError,
    fetchBeneficiaries,
  } = useBeneficiaries()

  // Load data on mount
  useEffect(() => {
    if (user) {
      fetchAccounts()
      fetchBeneficiaries()
    }
  }, [user, fetchAccounts, fetchBeneficiaries])

  // Ensure accounts and beneficiaries are arrays
  const safeAccounts = Array.isArray(accounts) ? accounts : []
  const safeBeneficiaries = Array.isArray(beneficiaries) ? beneficiaries : []

  // Calculate preview when amount changes
  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const numAmount = parseFloat(amount)
      const fee = calculateTransactionFee(numAmount, 'TRANSFER')
      setPreview({
        amount: numAmount,
        fee,
        total: numAmount + fee,
        estimatedTime: transferType === 'momo' ? '~1 minute' : '~10 minutes'
      })
    } else {
      setPreview(null)
    }
  }, [amount, transferType])

  // Validation
  const validateForm = useCallback((): boolean => {
    setError(null)

    if (!selectedAccountId) {
      setError('Please select an account')
      return false
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return false
    }

    const selectedAccount = getAccountById(selectedAccountId)
    if (selectedAccount && parseFloat(amount) > selectedAccount.balance) {
      setError('Insufficient funds')
      return false
    }

    if (transferType === 'bank' && !selectedBeneficiaryId) {
      setError('Please select a beneficiary')
      return false
    }

    if (transferType === 'momo' && !momoPhone) {
      setError('Please enter a phone number')
      return false
    }

    if (transferType === 'card' && !cardNumber) {
      setError('Please enter a card number')
      return false
    }

    return true
  }, [selectedAccountId, amount, transferType, selectedBeneficiaryId, momoPhone, cardNumber, getAccountById])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsProcessing(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Show success animation
      setShowSuccess(true)
      
      toast({
        title: 'Success',
        description: 'Money sent successfully',
      })

      // Reset form after delay
      setTimeout(() => {
        setAmount('')
        setDescription('')
        setSelectedBeneficiaryId('')
        setMomoPhone('')
        setCardNumber('')
        setPreview(null)
        setShowSuccess(false)
        router.push('/finance')
      }, 2000)

    } catch (err) {
      setError('Transaction failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [validateForm, toast, router])

  // Get selected account
  const selectedAccount = selectedAccountId ? getAccountById(selectedAccountId) : null

  // Loading state
  if (accountsLoading || beneficiariesLoading) {
    return <LoadingSkeleton />
  }

  // Error state
  if (accountsError || beneficiariesError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <ErrorDisplay message={accountsError || beneficiariesError || 'An error occurred'} />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <LayoutWrapper>
          <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
              <div className="max-w-md mx-auto px-4 py-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <h1 className="text-xl font-semibold text-black">Send Money</h1>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-md mx-auto px-4 py-6">
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <ErrorDisplay message={error} />
                  </motion.div>
                )}

                {/* Amount Input */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label className="text-sm font-medium text-gray-700">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-12 h-16 text-2xl font-semibold text-center border-2 border-gray-200 focus:border-black transition-colors"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </motion.div>

                {/* From Account */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label className="text-sm font-medium text-gray-700">From Account</Label>
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-black">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <SelectValue placeholder="Select account" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {safeAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <div className="font-medium">{account.type}</div>
                              <div className="text-sm text-gray-500">•••• {account.number.slice(-4)}</div>
                            </div>
                            <div className="text-sm font-medium">
                              {formatCurrency(account.balance)}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAccount && (
                    <div className="text-sm text-gray-600">
                      Available: {formatCurrency(selectedAccount.balance)}
                    </div>
                  )}
                </motion.div>

                {/* Transfer Type */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label className="text-sm font-medium text-gray-700">Transfer Method</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'bank', label: 'Bank', icon: CreditCard },
                      { value: 'momo', label: 'Mobile', icon: Smartphone },
                      { value: 'card', label: 'Card', icon: CreditCard }
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        type="button"
                        variant={transferType === value ? "default" : "outline"}
                        className={cn(
                          "h-14 flex-col gap-1",
                          transferType === value 
                            ? "bg-black text-white hover:bg-gray-800" 
                            : "border-2 border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => setTransferType(value as any)}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </motion.div>

                {/* Recipient Selection */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {transferType === 'bank' && (
                    <>
                      <Label className="text-sm font-medium text-gray-700">To Beneficiary</Label>
                      <Select value={selectedBeneficiaryId} onValueChange={setSelectedBeneficiaryId}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-black">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <SelectValue placeholder="Select beneficiary" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {safeBeneficiaries.map((beneficiary) => (
                            <SelectItem key={beneficiary.id} value={beneficiary.id}>
                              <div>
                                <div className="font-medium">{beneficiary.name}</div>
                                <div className="text-sm text-gray-500">
                                  {beneficiary.bankName} • •••• {beneficiary.accountNumber.slice(-4)}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}

                  {transferType === 'momo' && (
                    <>
                      <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="tel"
                          value={momoPhone}
                          onChange={(e) => setMomoPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="pl-12 h-14 border-2 border-gray-200 focus:border-black"
                        />
                      </div>
                    </>
                  )}

                  {transferType === 'card' && (
                    <>
                      <Label className="text-sm font-medium text-gray-700">Card Number</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="pl-12 h-14 border-2 border-gray-200 focus:border-black"
                        />
                      </div>
                    </>
                  )}
                </motion.div>

                {/* Description */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label className="text-sm font-medium text-gray-700">Description (Optional)</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this for?"
                    className="h-12 border-2 border-gray-200 focus:border-black"
                  />
                </motion.div>

                {/* Transaction Preview */}
                <AnimatePresence>
                  {preview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-2 border-gray-100">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Amount</span>
                              <span className="font-medium">{formatCurrency(preview.amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Fee</span>
                              <span className="font-medium">{formatCurrency(preview.fee)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Total</span>
                              <span>{formatCurrency(preview.total)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{preview.estimatedTime}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold bg-black hover:bg-gray-800 text-white"
                    disabled={isProcessing || !amount || !selectedAccountId}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Send {preview ? formatCurrency(preview.total) : 'Money'}
                      </div>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </div>

            {/* Success Animation */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="bg-white rounded-2xl p-8 shadow-2xl"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 360]
                        }}
                        transition={{ duration: 0.6 }}
                        className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Check className="w-8 h-8 text-gray-600" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-black mb-2">Success!</h3>
                      <p className="text-gray-600">Your money has been sent</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Deposit Modal */}
            <DepositModal
              open={isDepositModalOpen}
              onOpenChange={setIsDepositModalOpen}
            />
          </div>
        </LayoutWrapper>
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
