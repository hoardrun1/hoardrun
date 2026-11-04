import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  Lock,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import { useFinance } from '@/contexts/FinanceContext'
import { apiClient, type PlaidAccount } from '@/lib/api-client'

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
  icon: LucideIcon
  tone: string
  fees: string
  processingTime: string
  minAmount: number
  maxAmount: number
  available: boolean
  popular?: boolean
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'visa',
    name: 'Visa Card',
    description: 'Deposit using your Visa debit or credit card',
    icon: CreditCard,
    tone: '47 107 255',
    fees: 'Shown at checkout',
    processingTime: 'Shown at checkout',
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
    tone: '251 113 133',
    fees: 'Shown at checkout',
    processingTime: 'Shown at checkout',
    minAmount: 5,
    maxAmount: 5000,
    available: true
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'By ACH from your linked bank account',
    icon: Building2,
    tone: '52 211 153',
    fees: 'Free',
    processingTime: '1–3 business days',
    minAmount: 1,
    maxAmount: 10000,
    available: true
  },
]

const PRESETS = [25, 50, 100, 250, 500]

const usd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

/** Revolut-style top up: the amount first, the way to pay beneath it, one button to the secure checkout. */
export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [currentStep, setCurrentStep] = useState<DepositStep>('amount')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('visa')
  const [choosingMethod, setChoosingMethod] = useState(false)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const router = useRouter()
  // Linked bank accounts, for Bank Transfer
  const [banks, setBanks] = useState<PlaidAccount[]>([])
  const [bankId, setBankId] = useState<string | null>(null)
  const [bankStarted, setBankStarted] = useState(false)

  useEffect(() => {
    if (!open) return
    apiClient.getPlaidAccounts().then((response) => {
      const usable = (response.data ?? []).filter((a) => a.type === 'depository')
      setBanks(usable)
      setBankId((current) => current && usable.some((a) => a.account_id === current) ? current : usable[0]?.account_id ?? null)
    })
  }, [open])

  // Use the finance context
  const financeContext = useFinance();
  const depositFunds = financeContext?.depositFunds;
  const balance = financeContext?.balance ?? 0
  const provider = financeContext?.paymentProvider
  const partner = provider === 'stripe' ? 'Stripe' : provider === 'paystack' ? 'Paystack' : 'our payment partner'

  const resetModal = () => {
    setCurrentStep('amount')
    setSelectedMethod('visa')
    setChoosingMethod(false)
    setAmount('')
    setIsLoading(false)
    setBankStarted(false)
  }

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setChoosingMethod(false)
  }

  // Digits and one decimal point, at most two places, like a money keypad
  const handleAmountChange = (value: string) => {
    const clean = value.replace(/[^0-9.]/g, '')
    if (!/^\d*(\.\d{0,2})?$/.test(clean)) return
    setAmount(clean)
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

    if (selectedMethod === 'bank') handleBankDeposit()
    else handleDeposit()
  }

  // ACH from the linked bank: the cash is added once the bank sends it
  const handleBankDeposit = async () => {
    if (!bankId) {
      handleClose()
      router.push('/finance')
      return
    }
    setIsLoading(true)
    const response = await apiClient.depositFromBank(bankId, Number(amount))
    setIsLoading(false)
    if (response.error) {
      toast({ title: "Couldn't start the transfer", description: response.error, variant: 'destructive' })
      return
    }
    setBankStarted(true)
    setCurrentStep('success')
    window.dispatchEvent(new Event('hoardrun:balance-changed'))
  }

  const handleDeposit = async () => {
    try {
      setCurrentStep('processing')
      setIsLoading(true)

      if (!depositFunds) {
        throw new Error('Deposits are not available')
      }

      await depositFunds(Number(amount))
    } catch (error) {
      console.error('Deposit failed:', error)
      toast({
        title: 'Deposit Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      })
      setCurrentStep('amount')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(resetModal, 300) // Reset after modal closes
  }

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod) ?? paymentMethods[0]
  const amountNum = Number(amount) || 0
  const outOfRange = amountNum > 0 && (amountNum < selectedMethodData.minAmount || amountNum > selectedMethodData.maxAmount)
  const byBank = selectedMethod === 'bank'
  const bank = banks.find((a) => a.account_id === bankId)
  const bankLabel = (a: PlaidAccount) => `${a.institution_name || a.name}${a.mask ? ` •••• ${a.mask}` : ''}`

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="hr-topup max-h-[92dvh] overflow-y-auto sm:max-w-[440px]">
        <AnimatePresence mode="wait">
          {currentStep !== 'processing' && currentStep !== 'success' && (
            <motion.div key="amount" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex flex-col">
              <DialogTitle className="hr-title !text-[32px]">Add money</DialogTitle>
              <DialogDescription className="mt-1 text-[14px] text-[#a1a1a6]">
                You have <span className="text-white">{usd(balance)}</span>
              </DialogDescription>

              {/* The amount, large, with the currency beside it */}
              <label htmlFor="amount" className="hr-topup-amount mt-6" data-invalid={outOfRange || undefined}>
                <span className="hr-topup-currency">$</span>
                <input
                  id="amount"
                  inputMode="decimal"
                  autoComplete="off"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  aria-label="Amount in US dollars"
                  className="hr-topup-input"
                  style={{ width: `${Math.max(1, amount.length || 1) + 0.4}ch` }}
                />
                <span className="hr-topup-chip">USD</span>
              </label>
              <p className={`mt-2 text-center text-[12.5px] ${outOfRange ? 'text-[#fb7185]' : 'text-[#8e8e93]'}`}>
                {usd(selectedMethodData.minAmount)} to {usd(selectedMethodData.maxAmount)} with {selectedMethodData.name}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className="hr-topup-preset hr-focus"
                    data-active={amountNum === preset || undefined}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              {/* Pay with: one row, opening the list of ways to pay */}
              <p className="mt-6 text-[13px] font-medium text-[#a1a1a6]">Pay with</p>
              <button type="button" onClick={() => setChoosingMethod(!choosingMethod)} aria-expanded={choosingMethod} className="hr-topup-method hr-focus mt-2">
                <span className="hr-topup-method-icon" style={{ ['--tone' as string]: selectedMethodData.tone }}>
                  <selectedMethodData.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="flex items-center gap-2 text-[15px] font-medium text-white">
                    {selectedMethodData.name}
                    {selectedMethodData.popular && <span className="hr-topup-badge">Popular</span>}
                  </span>
                  <span className="block truncate text-[12.5px] text-[#8e8e93]">{selectedMethodData.description}</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-[#8e8e93] transition-transform ${choosingMethod ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {choosingMethod && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <ul className="mt-2 space-y-1.5">
                      {paymentMethods.map((method) => (
                        <li key={method.id}>
                          <button
                            type="button"
                            disabled={!method.available}
                            onClick={() => method.available && handleMethodSelect(method.id)}
                            className="hr-topup-option hr-focus"
                            data-selected={method.id === selectedMethod || undefined}
                          >
                            <span className="hr-topup-method-icon" style={{ ['--tone' as string]: method.tone }}>
                              <method.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                            </span>
                            <span className="min-w-0 flex-1 text-left">
                              <span className="block text-[14px] font-medium text-white">{method.name}</span>
                              <span className="block text-[12px] text-[#8e8e93]">Fee: {method.fees} · {usd(method.minAmount)}–{usd(method.maxAmount)}</span>
                            </span>
                            {method.id === selectedMethod && <Check className="h-4 w-4 text-[#5aa9ff]" strokeWidth={2.6} />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bank Transfer: which linked account it comes from */}
              {byBank && !choosingMethod && banks.length > 1 && (
                <ul className="mt-2 space-y-1.5">
                  {banks.map((a) => (
                    <li key={a.account_id}>
                      <button type="button" onClick={() => setBankId(a.account_id)} aria-pressed={a.account_id === bankId} className="hr-topup-option hr-focus" data-selected={a.account_id === bankId || undefined}>
                        <span className="min-w-0 flex-1 text-left text-[14px] font-medium text-white">{bankLabel(a)}</span>
                        {a.account_id === bankId && <Check className="h-4 w-4 text-[#5aa9ff]" strokeWidth={2.6} />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={byBank && !bank ? () => { handleClose(); router.push('/finance') } : handleAmountNext}
                disabled={byBank && !bank ? false : !amount || Number(amount) <= 0 || isLoading}
                className="hr-topup-continue hr-focus mt-6"
              >
                {byBank ? <Building2 className="h-4 w-4" strokeWidth={2.2} /> : <Lock className="h-4 w-4" strokeWidth={2.2} />}
                {byBank ? (bank ? (isLoading ? 'Starting…' : 'Start bank transfer') : 'Link a bank first') : 'Continue to secure checkout'}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-[#8e8e93]">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                {byBank
                  ? bank
                    ? `From ${bankLabel(bank)} by ACH. It's added when your bank sends it, usually in 1–3 business days.`
                    : 'Link your bank on the Finance page, then add money from it here.'
                  : <>Card details are entered on {partner}&apos;s secure page</>}
              </p>
            </motion.div>
          )}

          {/* Processing: on the way to the checkout page */}
          {currentStep === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="space-y-5 py-10 text-center">
              <DialogTitle className="sr-only">Processing</DialogTitle>
              <div className="hr-topup-orbit mx-auto">
                <selectedMethodData.icon className="h-7 w-7 text-white" strokeWidth={2} />
              </div>
              <div className="space-y-1.5">
                <h3 className="hr-card-title text-[22px]">Opening secure checkout</h3>
                <p className="text-sm text-[#a1a1a6]">
                  {usd(amountNum)} with {selectedMethodData.name}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-[#8e8e93]">
                <Shield className="h-4 w-4" />
                <span>Secure transaction in progress</span>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {currentStep === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="space-y-5 py-10 text-center">
              <DialogTitle className="sr-only">Deposit successful</DialogTitle>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="hr-sent-orb mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Check className="h-8 w-8 text-[#065f46]" strokeWidth={2.6} />
              </motion.div>
              <div className="space-y-1.5">
                <h3 className="hr-card-title text-[22px]">{bankStarted ? 'Transfer started' : 'Deposit successful'}</h3>
                <p className="text-sm text-[#a1a1a6]">
                  {bankStarted
                    ? `${usd(amountNum)} is on its way from ${bank ? bankLabel(bank) : 'your bank'}. We'll let you know when it's in your cash.`
                    : `${usd(amountNum)} has been added to your account`}
                </p>
              </div>
              {bankStarted
                ? <button type="button" onClick={handleClose} className="hr-topup-continue hr-focus">Done</button>
                : <p className="text-xs text-[#8e8e93]">This window will close automatically in a few seconds</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
