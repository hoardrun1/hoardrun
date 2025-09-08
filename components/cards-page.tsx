'use client'

import { useState } from 'react'
import { Plus, Home, BarChart2, CreditCard, PieChart, Settings, ChevronRight, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'
import { responsiveStyles as rs } from '@/styles/responsive-utilities'
import { useToast } from "@/components/ui/use-toast"
import { MastercardClient } from '@/lib/mastercard-client'
import { COUNTRY_CODES, type CountryCode } from '@/lib/constants/country-codes';
import { SectionFooter } from '@/components/ui/section-footer'

interface CardData {
  id: string
  type: 'physical' | 'virtual'
  lastFourDigits: string
  expiryDate: string
  cardholderName: string
  isLocked: boolean
  isContactless: boolean
  network: 'mastercard' | 'visa'
  status: 'active' | 'inactive' | 'blocked'
}

export function CardsPageComponent() {
  const [cards, setCards] = useState<CardData[]>([
    {
      id: '1',
      type: 'physical',
      lastFourDigits: '4567',
      expiryDate: '12/25',
      cardholderName: 'John Doe',
      network: 'visa',
      status: 'active',
      isLocked: false,
      isContactless: true
    },
    {
      id: '2',
      type: 'virtual',
      lastFourDigits: '8901',
      expiryDate: '06/24',
      cardholderName: 'John Doe',
      network: 'mastercard',
      status: 'active',
      isLocked: true,
      isContactless: false
    }
  ])

  const [showCardDetails, setShowCardDetails] = useState<Record<string, boolean>>({})
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const { addToast } = useToast()

  const toggleCardLock = (cardId: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, isLocked: !card.isLocked } : card
    ))
  }

  const toggleCardDetails = (cardId: string) => {
    setShowCardDetails(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  const toggleContactless = (cardId: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, isContactless: !card.isContactless } : card
    ))
  }

  const handleIssueVirtualCard = async () => {
    try {
      const user = await fetch('/api/user/profile').then(res => res.json());
      const country = (user.country as CountryCode) || process.env.NEXT_PUBLIC_MASTERCARD_COUNTRY;

      if (!(country in COUNTRY_CODES)) {
        throw new Error('Invalid country configuration');
      }

      const mastercardClient = new MastercardClient({
        apiKey: process.env.NEXT_PUBLIC_MASTERCARD_API_KEY!,
        partnerId: process.env.NEXT_PUBLIC_MASTERCARD_PARTNER_ID!,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        clientId: process.env.MASTERCARD_CLIENT_ID!,
        orgName: process.env.MASTERCARD_ORG_NAME!,
        country: country,
      });

      // Implement virtual card issuance
      // Add to cards state
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to issue virtual card",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <LayoutWrapper className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-4 px-4 sm:pb-6 sm:px-6" showBreadcrumbs={false}>

      {/* Header */}
      <header className={`sticky top-14 sm:top-16 z-30 bg-background border-b border-border ${rs.padding}`}>
        <div className={rs.container}>
          <div className={`${rs.flexBetween} py-4`}>
            <div className="flex items-center gap-2">
              <h1 className={`${rs.heading2} text-foreground font-bold`}>Cards</h1>
              <span className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                {cards.length} Active
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-sm hidden sm:inline-flex"
              >
                <Settings className="h-4 w-4 mr-2" />
                Card settings
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="font-medium">
                    <Plus className="h-4 w-4 mr-2" /> New Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-bold">Request New Card</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Card className="cursor-pointer hover:border-primary transition-colors">
                      <CardContent className="flex items-center p-6">
                        <div className="mr-4">
                          <CreditCard className="h-8 w-8 text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Physical Card</h3>
                          <p className="text-sm text-muted-foreground">Get a physical card for in-person transactions</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:border-primary transition-colors">
                      <CardContent className="flex items-center p-6">
                        <div className="mr-4">
                          <Shield className="h-8 w-8 text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Virtual Card</h3>
                          <p className="text-sm text-muted-foreground">Create a virtual card for online purchases</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="font-medium">
                    <Plus className="mr-2 h-4 w-4" />
                    Issue Virtual Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-bold">Issue Virtual Card</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button
                      onClick={handleIssueVirtualCard}
                      className="w-full font-medium"
                    >
                      Confirm
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${rs.section} pb-24`}>
        <div className={`${rs.container} ${rs.sectionInner}`}>
          <div className="grid gap-6">
            <AnimatePresence>
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`overflow-hidden transition-all duration-300 border-2 ${
                    card.isLocked 
                      ? 'bg-secondary/50 border-muted'
                      : 'bg-card border-border hover:border-primary'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                            card.type === 'physical' 
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-secondary text-secondary-foreground border-secondary'
                          }`}>
                            <CreditCard className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-foreground">
                                {card.type === 'physical' ? 'Physical Card' : 'Virtual Card'}
                              </h3>
                              {card.isLocked && (
                                <span className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                                  Locked
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-muted-foreground font-medium">
                                •••• {card.lastFourDigits}
                              </span>
                              <button
                                onClick={() => toggleCardDetails(card.id)}
                                className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showCardDetails[card.id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={!card.isLocked}
                              onCheckedChange={() => toggleCardLock(card.id)}
                              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                            />
                            <span className="text-sm text-foreground font-medium">
                              {card.isLocked ? 'Unlock card' : 'Lock card'}
                            </span>
                          </div>
                          {card.type === 'physical' && (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={card.isContactless}
                                onCheckedChange={() => toggleContactless(card.id)}
                                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                              />
                              <span className="text-sm text-foreground font-medium">
                                Contactless
                              </span>
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-auto font-medium"
                          >
                            Manage
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showCardDetails[card.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground font-medium">Card Number</div>
                                <div className="font-bold text-foreground">•••• •••• •••• {card.lastFourDigits}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground font-medium">Expiry Date</div>
                                <div className="font-bold text-foreground">{card.expiryDate}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground font-medium">Cardholder Name</div>
                                <div className="font-bold text-foreground">{card.cardholderName}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground font-medium">CVV</div>
                                <div className="font-bold text-foreground">•••</div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <SectionFooter section="financial" activePage="/cards" />
    </LayoutWrapper>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
