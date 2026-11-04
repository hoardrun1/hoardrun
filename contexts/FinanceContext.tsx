'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'

interface FinanceContextType {
  balance: number
  isLoading: boolean
  error: string | null
  depositFunds: (amount: number) => Promise<void>
  // Who handles card deposits: Stripe in the US, Paystack where that's set up instead
  paymentProvider: 'stripe' | 'paystack' | null
  withdrawFunds: (amount: number) => Promise<void>
  refreshBalance: () => Promise<void>
}

// Withdrawals go by ACH to a bank linked through Plaid (the Finance page picks the account).
// Moves between cash and savings live on the Savings page; investing lives on the markets, funds and Circles pages.

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshBalance = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getDashboard()
      if (response.data) {
        setBalance(response.data.balance || 0)
      } else {
        throw new Error(response.error || 'Failed to fetch balance')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance')
      // Remove toast for better performance - let components handle error display
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'paystack' | null>(null)
  useEffect(() => {
    if (!user) return
    apiClient.getPaymentProvider().then((response) => setPaymentProvider(response.data?.provider ?? null))
  }, [user])

  const depositFunds = useCallback(async (amount: number) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      if (paymentProvider === 'stripe') {
        // Stripe's hosted checkout; the money is added once Stripe confirms the payment
        const checkout = await apiClient.createStripeCheckout(amount, `${window.location.origin}/home`)
        if (checkout.error || !checkout.data?.url) throw new Error(checkout.error || 'Deposit failed')
        window.location.href = checkout.data.url
        return
      }

      const response = await apiClient.initializePayment({
        email: user.email,
        amount,
        currency: 'USD',
        callback_url: `${window.location.origin}/home`,
      })

      if (response.error || !response.data?.authorization_url) {
        throw new Error(response.error || 'Deposit failed')
      }

      // The balance only changes once Paystack confirms the payment
      window.location.href = response.data.authorization_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, paymentProvider])

  const withdrawFunds = useCallback(async (amount: number) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // To the first linked checking or savings account
      const accounts = await apiClient.getPlaidAccounts()
      const account = (accounts.data ?? []).find((a) => a.type === 'depository')
      if (!account) throw new Error('Link a bank on the Finance page to withdraw.')
      const response = await apiClient.withdrawToBank(account.account_id, amount)
      if (response.error) throw new Error(response.error)

      await refreshBalance()
      window.dispatchEvent(new Event('hoardrun:balance-changed'))

      toast({
        title: 'Withdrawal started',
        description: `On its way to ${response.data?.account ?? 'your bank'}, usually in 1–3 business days.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Withdrawal failed',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, toast, refreshBalance])

  // Stripe sends people back with ?stripe_session=…; the server checks it with Stripe and adds the money once
  useEffect(() => {
    if (!user) return
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('stripe_session')
    if (!sessionId) return
    const seen = `hr-verified-${sessionId}`
    try {
      if (sessionStorage.getItem(seen)) return
      sessionStorage.setItem(seen, '1')
    } catch {
      // Without storage a repeat check is harmless: the backend never credits a payment twice
    }
    params.delete('stripe_session')
    const rest = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`)

    apiClient.verifyStripeSession(sessionId).then((response) => {
      if (response.error || !response.data) {
        try { sessionStorage.removeItem(seen) } catch {}
        toast({
          title: "We couldn't confirm your payment",
          description: `${(response.error || 'Please try again').replace(/[.!]?$/, '.')} If money left your card, it's added as soon as Stripe confirms it.`,
          variant: 'destructive',
        })
        return
      }
      if (response.data.credited) {
        const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(response.data.amount ?? 0)
        toast({ title: 'Money added', description: `${amount} is now in your Hoardrun cash.` })
        window.dispatchEvent(new Event('hoardrun:balance-changed'))
        refreshBalance()
      } else {
        toast({ title: 'Payment not completed', description: `Stripe shows this payment as ${response.data.status}, so nothing was added.`, variant: 'destructive' })
      }
    })
  }, [user, toast, refreshBalance])

  // Paystack sends people back with ?reference=…; confirming it is what adds the money
  useEffect(() => {
    if (!user) return
    const params = new URLSearchParams(window.location.search)
    const reference = params.get('reference') || params.get('trxref')
    if (!reference) return
    const seen = `hr-verified-${reference}`
    try {
      if (sessionStorage.getItem(seen)) return
      sessionStorage.setItem(seen, '1')
    } catch {
      // Without storage a repeat check is harmless: the backend never credits a payment twice
    }
    params.delete('reference')
    params.delete('trxref')
    const rest = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`)

    apiClient.verifyPayment(reference).then((response) => {
      const payment = response.data?.transaction
      if (response.error || !payment) {
        try { sessionStorage.removeItem(seen) } catch {}
        toast({
          title: "We couldn't confirm your payment",
          description: `${(response.error || 'Please try again').replace(/[.!]?$/, '.')} If money left your card, it's added as soon as Paystack confirms it.`,
          variant: 'destructive',
        })
        return
      }
      if (payment.status === 'success') {
        const amount = new Intl.NumberFormat(undefined, { style: 'currency', currency: payment.currency || 'USD' }).format(payment.amount / 100)
        toast({ title: 'Money added', description: `${amount} is now in your Hoardrun cash.` })
        window.dispatchEvent(new Event('hoardrun:balance-changed'))
        refreshBalance()
      } else {
        toast({ title: 'Payment not completed', description: `Paystack shows this payment as ${payment.status}, so nothing was added.`, variant: 'destructive' })
      }
    })
  }, [user, toast, refreshBalance])

  return (
    <FinanceContext.Provider
      value={{
        balance,
        isLoading,
        error,
        depositFunds,
        paymentProvider,
        withdrawFunds,
        refreshBalance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
