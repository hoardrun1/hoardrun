import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  ArrowLeft,
  Check,
  AlertCircle,
  Shield,
  Zap,
  Globe
} from 'lucide-react'
import { useFinance } from '@/contexts/FinanceContext'

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PaymentMethod = 'wallet' | 'visa' | 'mastercard' | 'stripe' | 'bank' | 'paypal'
type DepositStep = 'method' | 'amount' | 'details' | 'processing' | 'success'

interface PaymentMethodOption {
  id: PaymentMethod
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  fees: string
  processingTime: string
  minAmount: number
  maxAmount: number
  available: boolean
  popular?: boolean
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'wallet',
    name: 'Digital Wallet',
    description: 'Instant transfer from your connected wallet',
    icon: Wallet,
    fees: 'Free',
    processingTime: 'Instant',
    minAmount: 1,
    maxAmount: 10000,
    available: true,
    popular: true
  },
  {
    id: 'visa',
    name: 'Visa Card',
    description: 'Deposit using your Visa debit or credit card',
    icon: CreditCard,
    fees: '2.9% + $0.30',
    processingTime: '1-3 minutes',
    minAmount: 5,
    maxAmount: 5000,
    available: true,
    popular: true
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    description: 'Deposit using your Mastercard debit or credit card',
    icon: CreditCard,
    fees: '2.9% + $0.30',
    processingTime: '1-3 minutes',
    minAmount: 5,
    maxAmount: 5000,
    available: true
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Secure payment processing via Stripe',
    icon: Zap,
    fees: '2.9% + $0.30',
    processingTime: 'Instant',
    minAmount: 1,
    maxAmount: 25000,
    available: true
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Direct transfer from your bank account',
    icon: Building2,
    fees: 'Free',
    processingTime: '1-3 business days',
    minAmount: 10,
    maxAmount: 50000,
    available: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Deposit using your PayPal account',
    icon: Globe,
    fees: '3.4% + $0.30',
    processingTime: 'Instant',
    minAmount: 1,
    maxAmount: 10000,
    available: false
  }
]

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [currentStep, setCurrentStep] = useState<DepositStep>('method')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking'
  })

  const { toast } = useToast()

  // Use the finance context
  const financeContext = useFinance();
  const depositFunds = financeContext?.depositFunds;

  const resetModal = () => {
    setCurrentStep('method')
    setSelectedMethod(null)
    setAmount('')
    setCardDetails({ number: '', expiry: '', cvv: '', name: '' })
    setBankDetails({ accountNumber: '', routingNumber: '', accountType: 'checking' })
    setIsLoading(false)
  }

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setCurrentStep('amount')
  }

  const handleAmountNext = () => {
    if (!amount || Number(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      })
      return
    }

    const method = paymentMethods.find(m => m.id === selectedMethod)
    if (method) {
      const amountNum = Number(amount)
      if (amountNum < method.minAmount || amountNum > method.maxAmount) {
        toast({
          title: 'Amount Out of Range',
          description: `Amount must be between $${method.minAmount} and $${method.maxAmount}`,
          variant: 'destructive'
        })
        return
      }
    }

    if (selectedMethod === 'wallet') {
      handleDeposit()
    } else {
      setCurrentStep('details')
    }
  }

  const handleDeposit = async () => {
    try {
      setCurrentStep('processing')
      setIsLoading(true)

      // Simulate different processing times based on method
      const method = paymentMethods.find(m => m.id === selectedMethod)
      const delay = selectedMethod === 'bank' ? 3000 : 2000

      await new Promise(resolve => setTimeout(resolve, delay))
      
      if (depositFunds) {
        await depositFunds(Number(amount))
      } else {
        // If no deposit function available, just simulate success
        console.log(`Deposit of $${amount} completed via ${selectedMethod}`)
      }

      setCurrentStep('success')

      toast({
        title: 'Deposit Successful',
        description: `$${amount} has been deposited to your account`,
      })

      // Auto close after success
      setTimeout(() => {
        onOpenChange(false)
        resetModal()
      }, 2000)

    } catch (error) {
      console.error('Deposit failed:', error)
      toast({
        title: 'Deposit Failed',
        description: 'There was an error processing your deposit. Please try again.',
        variant: 'destructive'
      })
      setCurrentStep('details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(resetModal, 300) // Reset after modal closes
  }

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            {currentStep !== 'method' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (currentStep === 'amount') setCurrentStep('method')
                  else if (currentStep === 'details') setCurrentStep('amount')
                }}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-lg sm:text-xl">
              {currentStep === 'method' && 'Choose Payment Method'}
              {currentStep === 'amount' && 'Enter Amount'}
              {currentStep === 'details' && 'Payment Details'}
              {currentStep === 'processing' && 'Processing...'}
              {currentStep === 'success' && 'Success!'}
            </DialogTitle>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2">
            {['method', 'amount', 'details'].map((step, index) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  currentStep === step ||
                  (['amount', 'details', 'processing', 'success'].includes(currentStep) && step === 'method') ||
                  (['details', 'processing', 'success'].includes(currentStep) && step === 'amount') ||
                  (['processing', 'success'].includes(currentStep) && step === 'details')
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Payment Method Selection */}
          {currentStep === 'method' && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !method.available ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => method.available && handleMethodSelect(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <method.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{method.name}</h3>
                            {method.popular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                            {!method.available && (
                              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{method.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Fee: {method.fees}</span>
                            <span>•</span>
                            <span>{method.processingTime}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 rounded-full border-2 border-muted" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Amount Entry */}
          {currentStep === 'amount' && selectedMethodData && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <selectedMethodData.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">{selectedMethodData.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="block">Fee</span>
                      <span className="font-medium text-foreground">{selectedMethodData.fees}</span>
                    </div>
                    <div>
                      <span className="block">Processing Time</span>
                      <span className="font-medium text-foreground">{selectedMethodData.processingTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount (${selectedMethodData.minAmount} - ${selectedMethodData.maxAmount.toLocaleString()})
                  </Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-8 text-lg font-medium"
                      min={selectedMethodData.minAmount}
                      max={selectedMethodData.maxAmount}
                    />
                  </div>
                </div>

                {amount && Number(amount) > 0 && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Amount</span>
                          <span>${Number(amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fee</span>
                          <span>{selectedMethodData.fees === 'Free' ? 'Free' : `~$${(Number(amount) * 0.029 + 0.30).toFixed(2)}`}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>${selectedMethodData.fees === 'Free' ? Number(amount).toFixed(2) : (Number(amount) + Number(amount) * 0.029 + 0.30).toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handleAmountNext}
                  disabled={!amount || Number(amount) <= 0}
                  className="w-full"
                  size="lg"
                >
                  {selectedMethod === 'wallet' ? 'Deposit Now' : 'Continue'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment Details */}
          {currentStep === 'details' && selectedMethodData && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <selectedMethodData.icon className="h-5 w-5 text-primary" />
                      <div>
                        <span className="font-medium text-sm">{selectedMethodData.name}</span>
                        <p className="text-xs text-muted-foreground">Depositing ${amount}</p>
                      </div>
                    </div>
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Card Details Form */}
              {(selectedMethod === 'visa' || selectedMethod === 'mastercard' || selectedMethod === 'stripe') && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName" className="text-sm font-medium">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-sm font-medium">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="1234 5678 9012 3456"
                      className="mt-2"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-sm font-medium">Expiry Date</Label>
                      <Input
                        id="expiry"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                        placeholder="MM/YY"
                        className="mt-2"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                      <Input
                        id="cvv"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="123"
                        className="mt-2"
                        maxLength={4}
                        type="password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details Form */}
              {selectedMethod === 'bank' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="accountNumber" className="text-sm font-medium">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="1234567890"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="routingNumber" className="text-sm font-medium">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      value={bankDetails.routingNumber}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
                      placeholder="021000021"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">
                  Your payment information is encrypted and secure
                </span>
              </div>

              <Button
                onClick={handleDeposit}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Deposit $${amount}`
                )}
              </Button>
            </motion.div>
          )}

          {/* Step 4: Processing */}
          {currentStep === 'processing' && selectedMethodData && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6 py-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto"
                />
                <selectedMethodData.icon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Processing Your Deposit</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we process your ${amount} deposit via {selectedMethodData.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  This usually takes {selectedMethodData.processingTime.toLowerCase()}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure transaction in progress</span>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {currentStep === 'success' && selectedMethodData && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6 py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <Check className="h-8 w-8 text-green-600" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-600">Deposit Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  ${amount} has been successfully deposited to your account
                </p>
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <div className="flex items-center gap-2">
                      <selectedMethodData.icon className="h-4 w-4" />
                      <span>{selectedMethodData.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">${amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Completed
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground">
                This window will close automatically in a few seconds
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
