'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Home, BarChart2, CreditCard, PieChart, Settings, ChevronRight, Lock, Eye, EyeOff, Shield, AlertCircle, Loader2, Wifi, DollarSign, TrendingUp, MoreVertical, Download, Copy, Trash2, Building2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DepositModal } from '@/components/deposit-modal'
import { useToast } from "@/components/ui/use-toast"
import { apiClient, type IssuedCard } from '@/lib/api-client'
import { GetHoardrunCardDialog, HoardrunCardDetailsDialog } from '@/components/cards/hoardrun-card'
import { PlaidLink } from '@/components/plaid/PlaidLink'
import { DebitCardSelectionModal } from '@/components/DebitCardSelectionModal'
import { CardManageDialog, type ManagedCard } from '@/components/cards/card-manage'

interface CardData {
  id: string
  type: 'physical' | 'virtual'
  lastFourDigits: string
  expiryDate: string
  cardholderName: string
  isLocked: boolean
  isContactless: boolean
  network: 'mastercard' | 'visa' | 'american_express' | 'discover'
  status: 'active' | 'inactive' | 'blocked' | 'locked' | 'frozen' | 'lost'
  onlinePayments: boolean
  isDefault: boolean
  perTransactionLimit: number | null
  monthlyLimit: number | null
  source: string
}

const mapPaymentMethodToCard = (paymentMethod: any): CardData | null => {
  if (!['credit_card', 'debit_card'].includes(paymentMethod.type)) {
    return null
  }

  const lastFourDigits = paymentMethod.card_number_masked?.slice(-4) || '0000'
  
  const expiryDate = paymentMethod.expiry_month && paymentMethod.expiry_year 
    ? `${paymentMethod.expiry_month.toString().padStart(2, '0')}/${paymentMethod.expiry_year.toString().slice(-2)}`
    : '00/00'

  const networkMap: Record<string, 'mastercard' | 'visa' | 'american_express' | 'discover'> = {
    'mastercard': 'mastercard',
    'visa': 'visa',
    'american_express': 'american_express',
    'discover': 'discover'
  }

  const isLocked = ['locked', 'frozen', 'blocked'].includes(paymentMethod.status)

  return {
    id: paymentMethod.id,
    type: paymentMethod.type === 'credit_card' ? 'physical' : 'virtual',
    lastFourDigits,
    expiryDate,
    cardholderName: paymentMethod.card_holder_name || 'Card Holder',
    isLocked,
    isContactless: paymentMethod.contactless ?? true,
    onlinePayments: paymentMethod.online_payments ?? true,
    isDefault: !!paymentMethod.is_default,
    perTransactionLimit: paymentMethod.per_transaction_limit ?? null,
    monthlyLimit: paymentMethod.monthly_limit ?? null,
    source: paymentMethod.source || 'manual',
    network: networkMap[paymentMethod.card_type] || 'visa',
    status: paymentMethod.status === 'active' ? 'active' : 
            paymentMethod.status === 'inactive' ? 'inactive' : 'blocked'
  }
}

export function CardsPageComponent() {
  const router = useRouter()
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCardDetails, setShowCardDetails] = useState<Record<string, boolean>>({})
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [isDebitCardModalOpen, setIsDebitCardModalOpen] = useState(false)
  const [manageId, setManageId] = useState<string | null>(null)
  // The open Manage sheet follows the list, so its switches show what was just saved
  const managed = cards.find(c => c.id === manageId) ?? null
  const { addToast } = useToast()
  // Hoardrun cards: virtual Visa cards issued by Stripe that spend from Hoardrun cash
  const [issued, setIssued] = useState<IssuedCard[]>([])
  const [hasBillingAddress, setHasBillingAddress] = useState(false)
  const [issuing, setIssuing] = useState<{ configured: boolean; publishable_key: string | null; monthly_limit: number }>({ configured: false, publishable_key: null, monthly_limit: 2000 })
  const [getCardOpen, setGetCardOpen] = useState(false)
  const [detailsCard, setDetailsCard] = useState<IssuedCard | null>(null)

  const fetchIssued = async () => {
    const [config, list] = await Promise.all([apiClient.getIssuingConfig(), apiClient.getIssuedCards()])
    if (config.data) setIssuing(config.data)
    if (list.data) {
      setIssued(list.data.cards)
      setHasBillingAddress(list.data.has_billing_address)
    }
  }

  useEffect(() => {
    fetchIssued()
  }, [])

  const openGetCard = () => {
    if (!issuing.configured) {
      addToast({ title: "Hoardrun cards", description: "Hoardrun cards aren't set up yet." })
      return
    }
    setGetCardOpen(true)
  }

  const toggleIssuedFreeze = async (card: IssuedCard) => {
    const response = await apiClient.setIssuedCardFrozen(card.id, card.status === 'active')
    if (response.error || !response.data) {
      addToast({ title: "Couldn't update the card", description: response.error || 'Please try again.', variant: 'destructive' })
      return
    }
    setIssued((list) => list.map((c) => (c.id === card.id ? response.data! : c)))
    addToast({ title: response.data.status === 'frozen' ? 'Card frozen' : 'Card unfrozen', description: response.data.status === 'frozen' ? 'Payments with it are declined until you unfreeze it.' : 'It works again.' })
  }

  const cancelIssued = async (card: IssuedCard) => {
    if (!window.confirm(`Cancel the card ending ${card.last4}? This can't be undone; purchases already approved still go through.`)) return
    const response = await apiClient.cancelIssuedCard(card.id)
    if (response.error) {
      addToast({ title: "Couldn't cancel the card", description: response.error, variant: 'destructive' })
      return
    }
    setIssued((list) => list.filter((c) => c.id !== card.id))
    addToast({ title: 'Card cancelled', description: `The card ending ${card.last4} no longer works.` })
  }

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getPaymentMethods()

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const paymentMethods = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.data || []

        const cardData = (paymentMethods as any[])
          .map((paymentMethod: any) => mapPaymentMethodToCard(paymentMethod))
          .filter((card): card is CardData => card !== null)

        setCards(cardData)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payment methods'
      setError(errorMessage)
      addToast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [addToast])

  const toggleCardLock = async (cardId: string) => {
    try {
      const card = cards.find(c => c.id === cardId)
      if (!card) return

      const newStatus = card.isLocked ? 'active' : 'locked'
      
      const response = await apiClient.updatePaymentMethod(cardId, {
        status: newStatus as any
      })

      if (response.error) {
        throw new Error(response.error)
      }

      setCards(cards.map(c =>
        c.id === cardId ? { ...c, isLocked: !c.isLocked, status: newStatus as any } : c
      ))

      addToast({
        title: "Success",
        description: `Card ${card.isLocked ? 'unlocked' : 'locked'} successfully`,
        variant: "default",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update card status'
      addToast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const toggleCardDetails = (cardId: string) => {
    setShowCardDetails(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  const toggleContactless = async (cardId: string) => {
    try {
      const card = cards.find(c => c.id === cardId)
      if (!card) return
      const response = await apiClient.updatePaymentMethod(cardId, { contactless: !card.isContactless })
      if (response.error) throw new Error(response.error)
      setCards(cards.map(c =>
        c.id === cardId ? { ...c, isContactless: !c.isContactless } : c
      ))

      addToast({
        title: "Success",
        description: "Contactless setting updated",
        variant: "default",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update contactless setting'
      addToast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const activeCount = cards.filter(card => card.status === 'active').length + issued.filter(card => card.status === 'active').length
  const totalCount = cards.length + issued.length

  const addCardDialog = (trigger: React.ReactNode, title: string, description: string) => (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <button onClick={openGetCard} className="hr-card-option hr-focus">
            <span className="hr-card-option-art" aria-hidden="true"><CardFace network="visa" mini /></span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block font-semibold text-foreground">Get a Hoardrun card</span>
              <span className="block text-sm text-muted-foreground">A virtual Visa that spends from your Hoardrun cash</span>
            </span>
            <ChevronRight className="h-4 w-4 text-[#8e8e93]" />
          </button>
          <button onClick={() => setIsDebitCardModalOpen(true)} className="hr-card-option hr-focus">
            <span className="hr-card-option-art" aria-hidden="true"><CardFace network="visa" mini /></span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block font-semibold text-foreground">Add Debit Card</span>
              <span className="block text-sm text-muted-foreground">{description}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-[#8e8e93]" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="hr-title">Cards</h1>
          <div className="mt-2 flex items-center gap-2 text-[13px]">
            <span className="hr-card-count">{loading ? '…' : `${activeCount} active`}</span>
            <span className="text-[#8e8e93]">{loading ? '' : `${totalCount} total`}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/cards/settings')} className="hr-pill hr-focus" aria-label="Card settings">
            <Settings className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Settings</span>
          </button>
          {addCardDialog(
            <button className="hr-pill hr-focus" data-primary="true"><Plus className="h-4 w-4" strokeWidth={2.4} />New card</button>,
            'Request New Card',
            'Enter your debit card details to add it'
          )}
        </div>
      </div>

      {issued.length > 0 && (
        <section aria-label="Hoardrun cards" className="space-y-3">
          <h2 className="hr-card-title text-[20px]">Hoardrun cards</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {issued.map((card) => (
              <div key={card.id} className="hr-wallet-item">
                <CardFace
                  network="visa"
                  type="virtual"
                  lastFour={card.last4}
                  holder="Hoardrun"
                  expiry={card.exp_month && card.exp_year ? `${String(card.exp_month).padStart(2, '0')}/${String(card.exp_year).slice(-2)}` : '••/••'}
                  locked={card.status === 'frozen'}
                />
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button onClick={() => toggleIssuedFreeze(card)} className="hr-card-action hr-focus" data-on={card.status === 'frozen'}>
                    <span className="hr-card-action-icon" data-tone="coral"><Lock className="h-[18px] w-[18px]" strokeWidth={2} /></span>
                    {card.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                  </button>
                  <button onClick={() => setDetailsCard(card)} className="hr-card-action hr-focus">
                    <span className="hr-card-action-icon" data-tone="sky"><Eye className="h-[18px] w-[18px]" strokeWidth={2} /></span>
                    Details
                  </button>
                  <button onClick={() => cancelIssued(card)} className="hr-card-action hr-focus">
                    <span className="hr-card-action-icon" data-tone="iris"><Trash2 className="h-[18px] w-[18px]" strokeWidth={2} /></span>
                    Cancel
                  </button>
                </div>
                {card.monthly_limit != null && (
                  <p className="mt-2 text-center text-[12.5px] text-[#8e8e93]">Spends from your Hoardrun cash · up to ${card.monthly_limit.toLocaleString('en-US')} a month</p>
                )}
              </div>
            ))}
          </div>
          {cards.length > 0 && <h2 className="hr-card-title pt-2 text-[20px]">Saved cards</h2>}
        </section>
      )}

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {[0, 1].map((key) => <div key={key} className="hr-skeleton aspect-[1.586] !rounded-[24px]" />)}
        </div>
      ) : error ? (
        <div className="hr-promo">
          <div className="relative">
            <h2 className="hr-card-title text-[22px]">Failed to load cards</h2>
            <p className="hr-sub mt-1.5">{error}</p>
            <button onClick={() => window.location.reload()} className="hr-focus mt-4 inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-black">Try again</button>
          </div>
        </div>
      ) : cards.length === 0 && issued.length > 0 ? null : cards.length === 0 ? (
        <section className="hr-wallet-empty">
          <div className="hr-wallet-stack" aria-hidden="true">
            {(['discover', 'mastercard', 'visa'] as const).map((network, index) => (
              <motion.div
                key={network}
                className="hr-wallet-stack-card"
                style={{ zIndex: index }}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                animate={{ opacity: 1, y: index * -26, rotate: (index - 1) * -7, x: (index - 1) * 18 }}
                transition={{ type: 'spring', stiffness: 120, damping: 16, delay: index * 0.08 }}
              >
                <CardFace network={network} />
              </motion.div>
            ))}
          </div>
          <div className="relative text-center lg:text-left">
            <h2 className="hr-card-title text-[26px] sm:text-[30px]">No cards yet</h2>
            <p className="hr-sub mx-auto mt-2 max-w-sm lg:mx-0">Get a Hoardrun card to spend your cash anywhere Visa works, or add a debit card. Freeze either in a tap.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {[{ icon: Lock, label: 'Lock in a tap' }, { icon: Wifi, label: 'Contactless control' }, { icon: Eye, label: 'Details on demand' }].map(({ icon: Icon, label }) => (
                <span key={label} className="hr-feature-chip"><Icon className="h-3.5 w-3.5" strokeWidth={2} />{label}</span>
              ))}
            </div>
            <div className="mt-5">
              {addCardDialog(
                <button className="hr-focus inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-black"><Plus className="h-4 w-4" strokeWidth={2.4} />Add card</button>,
                'Add New Card',
                'Connect your bank account to add debit cards'
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {cards.map((card, index) => (
              <motion.section
                key={card.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="hr-wallet-item"
              >
                <motion.div whileHover={{ rotateX: 4, rotateY: -6, y: -4 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }} style={{ transformPerspective: 900 }}>
                  <CardFace
                    network={card.network}
                    type={card.type}
                    lastFour={card.lastFourDigits}
                    holder={card.cardholderName}
                    expiry={card.expiryDate}
                    locked={card.isLocked}
                    contactless={card.isContactless}
                  />
                </motion.div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button onClick={() => toggleCardLock(card.id)} className="hr-card-action hr-focus" data-on={card.isLocked}>
                    <span className="hr-card-action-icon" data-tone="coral"><Lock className="h-[18px] w-[18px]" strokeWidth={2} /></span>
                    {card.isLocked ? 'Unlock' : 'Lock'}
                  </button>
                  <button onClick={() => toggleCardDetails(card.id)} className="hr-card-action hr-focus" data-on={!!showCardDetails[card.id]}>
                    <span className="hr-card-action-icon" data-tone="sky">{showCardDetails[card.id] ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={2} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={2} />}</span>
                    {showCardDetails[card.id] ? 'Hide' : 'Details'}
                  </button>
                  <button onClick={() => setManageId(card.id)} className="hr-card-action hr-focus">
                    <span className="hr-card-action-icon" data-tone="iris"><Settings className="h-[18px] w-[18px]" strokeWidth={2} /></span>
                    Manage
                  </button>
                </div>

                <AnimatePresence>
                  {showCardDetails[card.id] && (
                    <motion.dl
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-[13px] sm:grid-cols-4"
                    >
                      <div><dt className="text-[#8e8e93]">Card number</dt><dd className="mt-0.5 font-medium tabular-nums">•••• {card.lastFourDigits}</dd></div>
                      <div><dt className="text-[#8e8e93]">Expiry</dt><dd className="mt-0.5 font-medium tabular-nums">{card.expiryDate}</dd></div>
                      <div><dt className="text-[#8e8e93]">Cardholder</dt><dd className="mt-0.5 truncate font-medium">{card.cardholderName}</dd></div>
                      <div><dt className="text-[#8e8e93]">CVV</dt><dd className="mt-0.5 font-medium">•••</dd></div>
                    </motion.dl>
                  )}
                </AnimatePresence>

                {card.type === 'physical' && (
                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-[14px]"><Wifi className="h-4 w-4 rotate-90 text-[#7dd3fc]" strokeWidth={2} />Contactless</span>
                    <Switch checked={card.isContactless} onCheckedChange={() => toggleContactless(card.id)} />
                  </div>
                )}
              </motion.section>
            ))}
          </AnimatePresence>
        </div>
      )}

      <DepositModal open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen} />
      <GetHoardrunCardDialog
        open={getCardOpen}
        onOpenChange={setGetCardOpen}
        needsAddress={!hasBillingAddress}
        monthlyLimit={issuing.monthly_limit}
        onCreated={() => fetchIssued()}
      />
      <HoardrunCardDetailsDialog card={detailsCard} publishableKey={issuing.publishable_key} onOpenChange={(open) => { if (!open) setDetailsCard(null) }} />
      <CardManageDialog card={managed as ManagedCard | null} onClose={() => setManageId(null)} onChanged={fetchPaymentMethods} />
      <DebitCardSelectionModal
        open={isDebitCardModalOpen}
        onOpenChange={setIsDebitCardModalOpen}
        onSuccess={() => {
          // Refresh the cards list after adding new debit cards
          fetchPaymentMethods()
        }}
      />
    </div>
  )
}

const CARD_FINISH: Record<CardData['network'], { className: string; label: string }> = {
  visa: { className: 'hr-cardface-visa', label: 'VISA' },
  mastercard: { className: 'hr-cardface-mastercard', label: 'mastercard' },
  american_express: { className: 'hr-cardface-amex', label: 'AMEX' },
  discover: { className: 'hr-cardface-discover', label: 'DISCOVER' },
}

/** A card drawn like the real thing: tinted glass, a chip, sheen and the network mark. */
function CardFace({ network, type = 'virtual', lastFour = '0000', holder = 'Hoardrun', expiry = '••/••', locked = false, contactless = false, mini = false }: {
  network: CardData['network']; type?: CardData['type']; lastFour?: string; holder?: string; expiry?: string; locked?: boolean; contactless?: boolean; mini?: boolean
}) {
  const finish = CARD_FINISH[network] ?? CARD_FINISH.visa
  return (
    <div className={`hr-cardface ${finish.className} ${mini ? 'hr-cardface-mini' : ''}`} data-locked={locked}>
      <span className="hr-cardface-sheen" aria-hidden="true" />
      <span className="hr-cardface-orb" aria-hidden="true" />
      {!mini && (
        <div className="relative z-[1] flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/75">{type === 'physical' ? 'Physical' : 'Virtual'}</p>
              {contactless && type === 'physical' && <Wifi className="mt-1.5 h-4 w-4 rotate-90 text-white/85" strokeWidth={2} />}
            </div>
            {locked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold backdrop-blur"><Lock className="h-3 w-3" />Locked</span>
            ) : (
              <span className="text-[13px] font-semibold text-white/80">Hoardrun</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 44 34" className="h-8 w-11" aria-hidden="true">
              <defs>
                <linearGradient id={`chip-${network}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fff7d6" /><stop offset="0.5" stopColor="#e6c36a" /><stop offset="1" stopColor="#a37b1e" />
                </linearGradient>
              </defs>
              <rect x="1" y="1" width="42" height="32" rx="7" fill={`url(#chip-${network})`} />
              <path d="M1 12h12M1 22h12M31 12h12M31 22h12M13 1v32M31 1v32M13 17h18" stroke="#7a5a12" strokeOpacity="0.55" fill="none" />
            </svg>
            <p className="hr-figure text-[22px] tracking-[0.12em] sm:text-[24px]">•••• {lastFour}</p>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-white/60">Cardholder</p>
              <p className="truncate text-[14px] font-semibold uppercase tracking-wide">{holder}</p>
            </div>
            <div className="text-right">
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-white/60">Expires</p>
              <p className="text-[14px] font-semibold tabular-nums">{expiry}</p>
            </div>
            <p className={`hr-cardface-mark ${network === 'mastercard' ? 'hr-cardface-mark-mc' : ''}`}>
              {network === 'mastercard' ? <><span /><span /></> : finish.label}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
