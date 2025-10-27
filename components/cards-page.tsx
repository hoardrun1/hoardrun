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
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { DepositModal } from '@/components/deposit-modal'
import { useToast } from "@/components/ui/use-toast"
import { MastercardClient } from '@/lib/mastercard-client'
import { COUNTRY_CODES, type CountryCode } from '@/lib/constants/country-codes'
import { SectionFooter } from '@/components/ui/section-footer'
import { apiClient } from '@/lib/api-client'
import { PlaidLink } from '@/components/plaid/PlaidLink'
import { DebitCardSelectionModal } from '@/components/DebitCardSelectionModal'

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
    isContactless: true,
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
  const { addToast } = useToast()

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
      setCards(cards.map(card =>
        card.id === cardId ? { ...card, isContactless: !card.isContactless } : card
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

  const handleIssueVirtualCard = async () => {
    try {
      const userResponse = await apiClient.getProfile()
      
      if (userResponse.error) {
        throw new Error(userResponse.error)
      }

      const user = userResponse.data
      const country = ((user as any)?.country as CountryCode) || process.env.NEXT_PUBLIC_MASTERCARD_COUNTRY

      if (!(country in COUNTRY_CODES)) {
        throw new Error('Invalid country configuration')
      }

      const mastercardClient = new MastercardClient({
        apiKey: process.env.NEXT_PUBLIC_MASTERCARD_API_KEY!,
        partnerId: process.env.NEXT_PUBLIC_MASTERCARD_PARTNER_ID!,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        clientId: process.env.MASTERCARD_CLIENT_ID!,
        orgName: process.env.MASTERCARD_ORG_NAME!,
        country: country,
      })
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to issue virtual card",
        variant: "destructive",
      })
    }
  }

  const getNetworkGradient = (network: string) => {
    switch (network) {
      case 'mastercard':
        return 'from-orange-500 via-red-500 to-pink-500'
      case 'visa':
        return 'from-blue-600 via-blue-700 to-indigo-700'
      case 'american_express':
        return 'from-blue-400 via-cyan-500 to-teal-500'
      case 'discover':
        return 'from-orange-400 via-amber-500 to-yellow-500'
      default:
        return 'from-purple-500 via-purple-600 to-indigo-600'
    }
  }

  return (
    <React.Fragment>
      <LayoutWrapper className="min-h-screen pb-4 px-3 sm:px-4 lg:px-6" showBreadcrumbs={false}>

      {/* Floating Header */}
      <header className="sticky top-14 sm:top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4 gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl text-foreground font-bold truncate">Cards</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full shadow-sm">
                    {loading ? '...' : `${cards.filter(card => card.status === 'active').length} Active`}
                  </span>
                  <span className="hidden sm:inline text-xs text-muted-foreground">
                    {loading ? '...' : `${cards.length} Total`}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden lg:inline-flex text-sm hover:bg-accent transition-all"
                onClick={() => router.push('/cards/settings')}
              >
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="font-medium shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-primary/90">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">New Card</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-bold text-xl">Request New Card</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 py-4">
                    <Card
                      className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
                      onClick={() => setIsDebitCardModalOpen(true)}
                    >
                      <CardContent className="flex items-center p-4 sm:p-6">
                        <div className="mr-4 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                          <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">Add Debit Card</h3>
                          <p className="text-sm text-muted-foreground">Enter your debit card details to add it</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="relative">
              <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 animate-spin text-primary" />
              <div className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/20 animate-ping" />
            </div>
            <span className="mt-4 text-base sm:text-lg text-muted-foreground font-medium">Loading your cards...</span>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 sm:py-24"
          >
            <div className="p-4 sm:p-6 rounded-full bg-destructive/10 mb-4 sm:mb-6">
              <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-destructive" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 text-center px-4">Failed to load cards</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center px-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="shadow-md hover:shadow-lg transition-all"
            >
              Try Again
            </Button>
          </motion.div>
        ) : cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 sm:py-24"
          >
            <div className="p-6 sm:p-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
              <CreditCard className="h-16 w-16 sm:h-20 sm:w-20 text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 text-center px-4">No cards found</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center px-4 max-w-md">You don't have any cards yet. Add your first card to get started.</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-4 w-4 mr-2" /> Add Card
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-bold text-xl">Add New Card</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <Card
                    className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
                    onClick={() => setIsDebitCardModalOpen(true)}
                  >
                    <CardContent className="flex items-center p-4 sm:p-6">
                      <div className="mr-4 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                        <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">Link Debit Card</h3>
                        <p className="text-sm text-muted-foreground">Connect your bank account to add debit cards</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {cards.map((card, index) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  layout: { duration: 0.3 }
                }}
              >
                <Card className={`overflow-hidden transition-all duration-300 border-2 shadow-md hover:shadow-xl ${
                  card.isLocked 
                    ? 'bg-secondary/30 border-muted/50'
                    : 'bg-card border-border hover:border-primary/50'
                }`}>
                  <CardContent className="p-4 sm:p-6">
                    {/* Card Visual Representation */}
                    <div className="mb-4 sm:mb-6">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`relative h-48 sm:h-56 rounded-2xl bg-gradient-to-br ${getNetworkGradient(card.network)} p-5 sm:p-6 text-white shadow-2xl overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
                        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full -mr-24 -mt-24" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-black/10 rounded-full -ml-16 -mb-16" />
                        
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-xs sm:text-sm opacity-80 mb-1 font-medium">
                                {card.type === 'physical' ? 'Physical Card' : 'Virtual Card'}
                              </div>
                              {card.isContactless && card.type === 'physical' && (
                                <div className="flex items-center gap-1 text-xs opacity-90">
                                  <Wifi className="h-3 w-3 rotate-90" />
                                  <span className="font-medium">Contactless</span>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xl sm:text-2xl font-bold uppercase tracking-wider">
                                {card.network}
                              </div>
                              {card.isLocked && (
                                <div className="mt-1 px-2 py-0.5 bg-black/30 rounded-full flex items-center gap-1 text-xs backdrop-blur-sm">
                                  <Lock className="h-3 w-3" />
                                  <span className="font-semibold">Locked</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                              <div className="text-2xl sm:text-3xl font-bold tracking-[0.2em]">
                                •••• {card.lastFourDigits}
                              </div>
                              <button
                                onClick={() => toggleCardDetails(card.id)}
                                className="p-1.5 sm:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
                              >
                                {showCardDetails[card.id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            
                            <div className="flex items-end justify-between">
                              <div>
                                <div className="text-xs opacity-70 mb-0.5 font-medium">Cardholder</div>
                                <div className="text-sm sm:text-base font-semibold uppercase tracking-wide">
                                  {card.cardholderName}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs opacity-70 mb-0.5 font-medium">Expires</div>
                                <div className="text-sm sm:text-base font-semibold tracking-wider">
                                  {card.expiryDate}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Card Details Expansion */}
                    <AnimatePresence>
                      {showCardDetails[card.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mb-4 sm:mb-6 overflow-hidden"
                        >
                          <div className="p-4 sm:p-5 rounded-xl bg-secondary/30 border border-border">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground font-medium">Card Number</div>
                                <div className="font-bold text-foreground text-sm sm:text-base">•••• •••• •••• {card.lastFourDigits}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground font-medium">Expiry Date</div>
                                <div className="font-bold text-foreground text-sm sm:text-base">{card.expiryDate}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground font-medium">Cardholder</div>
                                <div className="font-bold text-foreground text-sm sm:text-base truncate">{card.cardholderName}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground font-medium">CVV</div>
                                <div className="font-bold text-foreground text-sm sm:text-base">•••</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Card Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                      <div className="flex flex-col sm:flex-row flex-1 gap-3 sm:gap-4">
                        <div className="flex items-center justify-between sm:justify-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border flex-1">
                          <span className="text-sm text-foreground font-medium whitespace-nowrap">
                            {card.isLocked ? 'Unlock card' : 'Lock card'}
                          </span>
                          <Switch
                            checked={!card.isLocked}
                            onCheckedChange={() => toggleCardLock(card.id)}
                            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                          />
                        </div>
                        
                        {card.type === 'physical' && (
                          <div className="flex items-center justify-between sm:justify-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border flex-1">
                            <span className="text-sm text-foreground font-medium whitespace-nowrap">
                              Contactless
                            </span>
                            <Switch
                              checked={card.isContactless}
                              onCheckedChange={() => toggleContactless(card.id)}
                              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                            />
                          </div>
                        )}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="font-medium shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Card
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="font-bold text-xl">Manage Card</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-3 py-4">
                            <Card className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group">
                              <CardContent className="flex items-center p-4 sm:p-6">
                                <div className="mr-4 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 group-hover:from-blue-500/20 group-hover:to-blue-500/10 transition-all">
                                  <BarChart2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground">View Transactions</h3>
                                  <p className="text-sm text-muted-foreground">See recent card activity</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group">
                              <CardContent className="flex items-center p-4 sm:p-6">
                                <div className="mr-4 p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 group-hover:from-green-500/20 group-hover:to-green-500/10 transition-all">
                                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground">Set Spending Limits</h3>
                                  <p className="text-sm text-muted-foreground">Control your spending</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group">
                              <CardContent className="flex items-center p-4 sm:p-6">
                                <div className="mr-4 p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 group-hover:from-red-500/20 group-hover:to-red-500/10 transition-all">
                                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground">Security Settings</h3>
                                  <p className="text-sm text-muted-foreground">Manage card security</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group">
                              <CardContent className="flex items-center p-4 sm:p-6">
                                <div className="mr-4 p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 group-hover:from-purple-500/20 group-hover:to-purple-500/10 transition-all">
                                  <Download className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground">Download Statement</h3>
                                  <p className="text-sm text-muted-foreground">Get card statement</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <SectionFooter section="financial" activePage="/cards" />

      <DepositModal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
      />

      <DebitCardSelectionModal
        open={isDebitCardModalOpen}
        onOpenChange={setIsDebitCardModalOpen}
        onSuccess={() => {
          // Refresh the cards list after adding new debit cards
          fetchPaymentMethods()
        }}
      />
      </LayoutWrapper>
    </React.Fragment>
  )
}
