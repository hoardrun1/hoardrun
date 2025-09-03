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
      <header className={`sticky top-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 ${rs.padding}`}>
        <div className={rs.container}>
          <div className={`${rs.flexBetween} py-4`}>
            <div className="flex items-center gap-2">
              <h1 className={`${rs.heading2} text-black dark:text-white font-bold`}>Cards</h1>
              <span className="px-3 py-1 text-xs font-semibold bg-black text-white dark:bg-white dark:text-black rounded-full">
                {cards.length} Active
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-sm hidden sm:inline-flex border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                <Settings className="h-4 w-4 mr-2" />
                Card settings
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black font-medium">
                    <Plus className="h-4 w-4 mr-2" /> New Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-black dark:text-white font-bold">Request New Card</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Card className="cursor-pointer hover:border-black dark:hover:border-white transition-colors border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <CardContent className="flex items-center p-6">
                        <div className="mr-4">
                          <CreditCard className="h-8 w-8 text-black dark:text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-black dark:text-white">Physical Card</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Get a physical card for in-person transactions</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:border-black dark:hover:border-white transition-colors border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <CardContent className="flex items-center p-6">
                        <div className="mr-4">
                          <Shield className="h-8 w-8 text-black dark:text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-black dark:text-white">Virtual Card</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Create a virtual card for online purchases</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gray-800 hover:bg-gray-700 text-white dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-black font-medium">
                    <Plus className="mr-2 h-4 w-4" />
                    Issue Virtual Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-black dark:text-white font-bold">Issue Virtual Card</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button
                      onClick={handleIssueVirtualCard}
                      className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black font-medium"
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
                      ? 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700' 
                      : 'bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                            card.type === 'physical' 
                              ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                              : 'bg-gray-800 text-white border-gray-800 dark:bg-gray-200 dark:text-black dark:border-gray-200'
                          }`}>
                            <CreditCard className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-black dark:text-white">
                                {card.type === 'physical' ? 'Physical Card' : 'Virtual Card'}
                              </h3>
                              {card.isLocked && (
                                <span className="px-3 py-1 text-xs font-bold bg-black text-white dark:bg-white dark:text-black rounded-full">
                                  Locked
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                •••• {card.lastFourDigits}
                              </span>
                              <button
                                onClick={() => toggleCardDetails(card.id)}
                                className="ml-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
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
                              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300 dark:data-[state=checked]:bg-white dark:data-[state=unchecked]:bg-gray-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                              {card.isLocked ? 'Unlock card' : 'Lock card'}
                            </span>
                          </div>
                          {card.type === 'physical' && (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={card.isContactless}
                                onCheckedChange={() => toggleContactless(card.id)}
                                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300 dark:data-[state=checked]:bg-white dark:data-[state=unchecked]:bg-gray-600"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                Contactless
                              </span>
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-auto border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-black dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:border-white font-medium"
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
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Card Number</div>
                                <div className="font-bold text-black dark:text-white">•••• •••• •••• {card.lastFourDigits}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Expiry Date</div>
                                <div className="font-bold text-black dark:text-white">{card.expiryDate}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Cardholder Name</div>
                                <div className="font-bold text-black dark:text-white">{card.cardholderName}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">CVV</div>
                                <div className="font-bold text-black dark:text-white">•••</div>
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

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-2">
        <div className={rs.container}>
          <nav className={`grid grid-cols-5 gap-1 sm:gap-2`}>
            {[
              { icon: Home, label: 'Home', href: '/home' },
              { icon: BarChart2, label: 'Finance', href: '/finance' },
              { icon: CreditCard, label: 'Cards', active: true, href: '/cards' },
              { icon: PieChart, label: 'Investment', href: '/investment' },
              { icon: Settings, label: 'Settings', href: '/settings' }
            ].map((item, index) => (
              item.href ? (
                <Link key={index} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full flex flex-col items-center py-1 sm:py-2 h-auto transition-colors ${
                      item.active
                        ? 'text-black dark:text-white font-bold bg-gray-100 dark:bg-gray-900'
                        : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-[10px] sm:text-xs mt-1">{item.label}</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full flex flex-col items-center py-1 sm:py-2 h-auto transition-colors ${
                    item.active
                      ? 'text-black dark:text-white font-bold bg-gray-100 dark:bg-gray-900'
                      : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-[10px] sm:text-xs mt-1">{item.label}</span>
                </Button>
              )
            ))}
          </nav>
        </div>
      </footer>
    </LayoutWrapper>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
