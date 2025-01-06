'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { useBeneficiaries } from '@/hooks/useBeneficiaries'
import { Card } from '@/components/ui/card'
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
  Send
} from 'lucide-react'
import { formatCurrency, calculateTransactionFee } from '@/lib/banking'
import { AccountType, TransactionType } from '@prisma/client'
import { cn } from '@/lib/utils'

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
  _count?: {
    transactions: number
  }
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

export function SendMoneyPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<TransactionError | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [preview, setPreview] = useState<TransactionPreview | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

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

    if (!selectedAccountId) {
      setError({ message: 'Please select an account', field: 'account' })
      return
    }

    if (!amount || !validateAmount(amount)) {
      return
    }

    if (!selectedBeneficiaryId) {
      setError({ message: 'Please select a beneficiary', field: 'beneficiary' })
      return
    }

    const transactionData: TransactionData = {
      accountId: selectedAccountId,
      type: 'TRANSFER',
      amount: parseFloat(amount),
      description: description.trim() || undefined,
      beneficiaryId: selectedBeneficiaryId,
    }

    setIsProcessing(true)
    try {
      const result = await createTransaction(transactionData)
      if (result) {
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
    createTransaction,
    router
  ])

  const handleBeneficiarySelect = useCallback((beneficiaryId: string) => {
    setSelectedBeneficiaryId(beneficiaryId)
    setError(null)
    setIsSheetOpen(false)
  }, [])

  const selectedAccount = selectedAccountId ? getAccountById(selectedAccountId) : null
  const filteredBeneficiaries = searchQuery 
    ? searchBeneficiaries(searchQuery)
    : beneficiaries

  const recentBeneficiaries = beneficiaries.slice(0, 3)
  const frequentBeneficiaries = beneficiaries
    .sort((a, b) => ((b._count?.transactions || 0) - (a._count?.transactions || 0)))
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
      <Button
        key={beneficiary.id}
        variant="ghost"
        className="w-full justify-start mb-2"
        onClick={() => handleBeneficiarySelect(beneficiary.id)}
      >
        <div className="text-left">
          <div className="font-medium dark:text-gray-200">{beneficiary.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {beneficiary.bankName} • {beneficiary.accountNumber}
          </div>
        </div>
      </Button>
    ))
  }, [handleBeneficiarySelect])

  if (accountsError || beneficiariesError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {accountsError || beneficiariesError}
        </AlertDescription>
      </Alert>
    )
  }

  const isSubmitDisabled = !selectedAccountId || !amount || isProcessing || transactionLoading || 
    !selectedBeneficiaryId || accountsLoading || beneficiariesLoading

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
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
            <h1 className="text-xl font-semibold">Send Money</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source Account Selection */}
            <div className="space-y-2">
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
                    <SelectItem
                      key={account.id}
                      value={account.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <span>{account.type}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(account.balance)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Beneficiary Selection */}
            <div className="space-y-2">
              <Label>To Beneficiary</Label>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-10 px-3"
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className={selectedBeneficiaryId ? '' : 'text-gray-500'}>
                        {selectedBeneficiaryId
                          ? beneficiaries.find(b => b.id === selectedBeneficiaryId)?.name
                          : 'Select beneficiary'}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle>Select Beneficiary</SheetTitle>
                    <SheetDescription>
                      Choose from your saved beneficiaries or add a new one
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search beneficiaries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <ScrollArea className="h-[60vh]">
                      {recentBeneficiaries.length > 0 && (
                        <>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Clock className="h-4 w-4" />
                            <span>Recent</span>
                          </div>
                          <div className="space-y-2 mb-4">
                            {recentBeneficiaries.map((beneficiary) => (
                              <motion.div
                                key={beneficiary.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <Card
                                  className="p-3 cursor-pointer hover:shadow-md transition-all"
                                  onClick={() => handleBeneficiarySelect(beneficiary.id)}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="font-medium">{beneficiary.name}</div>
                                      <div className="text-sm text-gray-500">
                                        {beneficiary.bankName}
                                      </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  </div>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )}

                      {frequentBeneficiaries.length > 0 && (
                        <>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Star className="h-4 w-4" />
                            <span>Frequent</span>
                          </div>
                          <div className="space-y-2 mb-4">
                            {frequentBeneficiaries.map((beneficiary) => (
                              <motion.div
                                key={beneficiary.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <Card
                                  className="p-3 cursor-pointer hover:shadow-md transition-all"
                                  onClick={() => handleBeneficiarySelect(beneficiary.id)}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="font-medium">{beneficiary.name}</div>
                                      <div className="text-sm text-gray-500">
                                        {beneficiary.bankName}
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {beneficiary._count?.transactions || 0} transfers
                                    </div>
                                  </div>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        {filteredBeneficiaries.map((beneficiary) => (
                          <motion.div
                            key={beneficiary.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <Card
                              className="p-3 cursor-pointer hover:shadow-md transition-all"
                              onClick={() => handleBeneficiarySelect(beneficiary.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{beneficiary.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {beneficiary.bankName} • {beneficiary.accountNumber}
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-2xl font-semibold h-16 text-center"
                  step="0.01"
                  min="0"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </div>
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this for?"
                maxLength={50}
              />
            </div>

            {/* Transaction Preview */}
            <AnimatePresence>
              {preview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-medium">{formatCurrency(preview.amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Fee:</span>
                        <span className="font-medium">{formatCurrency(preview.fee)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(preview.total)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>Estimated time: {preview.estimatedTime}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Money
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}