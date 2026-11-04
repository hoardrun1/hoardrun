'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Check, Copy, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'

interface MobileProvider {
  provider: string
  name: string
  currency: string
}

const CARD_CURRENCIES = ['USD', 'GHS', 'NGN', 'KES', 'ZAR']

export function ReceiveMoneyPageComponent() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [providers, setProviders] = useState<MobileProvider[]>([])
  const [providerId, setProviderId] = useState('')
  const [mobileAmount, setMobileAmount] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)

  const [cardAmount, setCardAmount] = useState('')
  const [cardCurrency, setCardCurrency] = useState(CARD_CURRENCIES[0])
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const [paymentLink, setPaymentLink] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    apiClient.getMobileMoneyProviders().then((response) => {
      setProviders(response.data?.data?.providers ?? [])
    })
  }, [])

  const provider = providers.find((item) => item.provider === providerId)

  const requestMobileMoney = async (event: FormEvent) => {
    event.preventDefault()
    if (!provider) return

    setIsRequesting(true)
    const response = await apiClient.requestMobileMoney({
      provider: provider.provider,
      sender_phone: senderPhone,
      amount: parseFloat(mobileAmount),
      currency: provider.currency,
    })
    setIsRequesting(false)

    if (response.error) {
      toast({ title: "Request not sent", description: response.error, variant: "destructive" })
      return
    }

    setMobileAmount('')
    setSenderPhone('')
    toast({ title: "Request sent", description: `They'll get a prompt on ${provider.name} to approve it.` })
  }

  const createPaymentLink = async (event: FormEvent) => {
    event.preventDefault()
    if (!user?.email) return

    setIsCreatingLink(true)
    setPaymentLink('')
    setCopied(false)
    const response = await apiClient.initializePayment({
      email: user.email,
      amount: parseFloat(cardAmount),
      currency: cardCurrency,
    })
    setIsCreatingLink(false)

    if (response.error || !response.data?.authorization_url) {
      toast({ title: "Link not created", description: response.error || "Please try again in a moment.", variant: "destructive" })
      return
    }

    setPaymentLink(response.data.authorization_url)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(paymentLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <header>
        <h1 className="hr-title">Receive money</h1>
        <p className="mt-1 text-sm text-[#a1a1a6] sm:text-base">Ask someone to pay you by mobile money or card.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={requestMobileMoney} className="hr-panel space-y-4 p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Mobile money</h2>
            <p className="mt-1 text-sm text-[#a1a1a6]">They get a prompt on their phone to approve the payment.</p>
          </div>

          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={providerId} onValueChange={setProviderId}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choose a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((item) => (
                  <SelectItem key={item.provider} value={item.provider}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sender-phone">Their phone number</Label>
            <Input id="sender-phone" type="tel" value={senderPhone} onChange={(event) => setSenderPhone(event.target.value)} required className="h-12" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile-amount">Amount{provider ? ` (${provider.currency})` : ''}</Label>
            <Input id="mobile-amount" type="number" inputMode="decimal" min="0" step="any" value={mobileAmount} onChange={(event) => setMobileAmount(event.target.value)} required className="h-12" />
          </div>

          <Button type="submit" disabled={!provider || isRequesting} className="h-12 w-full rounded-full">
            {isRequesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send request
          </Button>
        </form>

        <form onSubmit={createPaymentLink} className="hr-panel space-y-4 p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Card payment link</h2>
            <p className="mt-1 text-sm text-[#a1a1a6]">Share the link and they can pay on a secure Paystack page.</p>
          </div>

          <div className="flex gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="card-amount">Amount</Label>
              <Input id="card-amount" type="number" inputMode="decimal" min="0" step="any" value={cardAmount} onChange={(event) => setCardAmount(event.target.value)} required className="h-12" />
            </div>
            <div className="w-28 space-y-2">
              <Label>Currency</Label>
              <Select value={cardCurrency} onValueChange={setCardCurrency}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARD_CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={isCreatingLink} className="h-12 w-full rounded-full">
            {isCreatingLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create link
          </Button>

          {paymentLink && (
            <div className="flex items-center gap-2">
              <Input value={paymentLink} readOnly aria-label="Payment link" className="h-12" />
              <button type="button" onClick={copyLink} aria-label="Copy link" className="hr-icon-btn hr-focus shrink-0">
                {copied ? <Check className="h-[18px] w-[18px]" /> : <Copy className="h-[18px] w-[18px]" />}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
