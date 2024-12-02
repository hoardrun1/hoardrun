'use client'

import { Plus, Home, BarChart2, CreditCard, PieChart, Settings, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { responsiveStyles as rs } from '@/styles/responsive-utilities'

export function CardsPageComponent() {
  return (
    <LayoutWrapper className="bg-gray-50">
      {/* Header */}
      <header className={`sticky top-0 z-10 bg-white border-b border-gray-200 ${rs.padding}`}>
        <div className={rs.container}>
          <div className={`${rs.flexBetween} py-2 sm:py-4`}>
            <h1 className={rs.heading2}>Cards</h1>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs sm:text-sm hidden sm:inline-flex"
            >
              Card settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={rs.section}>
        <div className={`${rs.container} ${rs.sectionInner}`}>
          {/* Add New Card Button */}
          <Button 
            className="w-full justify-center text-base sm:text-lg py-4 sm:py-6 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300" 
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Add new card
          </Button>

          {/* Cards Grid */}
          <div className="space-y-4 sm:space-y-6">
            {[
              { id: 1, color: 'bg-gradient-to-r from-gray-800 to-gray-900' },
              { id: 2, color: 'bg-gradient-to-r from-blue-600 to-blue-700' },
              { id: 3, color: 'bg-gradient-to-r from-indigo-800 to-indigo-900' }
            ].map((card) => (
              <Card key={card.id} className={`${card.color} text-white overflow-hidden transform transition-transform hover:scale-[1.02]`}>
                <CardContent className={`${rs.card} space-y-4`}>
                  <div className={rs.flexBetween}>
                    <span className="text-xs sm:text-sm font-medium opacity-80">Card {card.id}</span>
                    <span className="text-xs sm:text-sm opacity-80">Exp. 02/2030</span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-1 opacity-80">Available balance</h2>
                    <p className="text-2xl sm:text-3xl font-bold">Gh₵ 20,000.00</p>
                  </div>
                  <div className={`${rs.flexBetween} pt-4`}>
                    <span className="text-xs sm:text-sm opacity-80">GHC</span>
                    <span className="text-base sm:text-lg tracking-wider">•••• •••• •••• 9632</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Card Actions */}
          <div className="mt-6 sm:mt-8 space-y-4">
            <h2 className={rs.heading3}>Card actions</h2>
            <div className="space-y-2 sm:space-y-4">
              {[
                'View transaction history',
                'Manage card limits',
                'Security settings'
              ].map((action, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  className="w-full justify-between text-left text-gray-700 hover:text-gray-900 py-3 sm:py-4"
                >
                  <span className="text-sm sm:text-base">{action}</span>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 py-2 sm:py-3">
        <div className={rs.container}>
          <nav className={`grid grid-cols-5 gap-1 sm:gap-2`}>
            {[
              { icon: Home, label: 'Home', href: '/' },
              { icon: BarChart2, label: 'Finance', href: '/finance' },
              { icon: CreditCard, label: 'Cards', active: true },
              { icon: PieChart, label: 'Investment', href: '/investment' },
              { icon: Settings, label: 'Settings', href: '/settings' }
            ].map((item, index) => (
              item.href ? (
                <Link key={index} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className={`w-full flex flex-col items-center py-1 sm:py-2 h-auto ${
                      item.active ? 'text-blue-600' : 'text-gray-500'
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
                  className={`w-full flex flex-col items-center py-1 sm:py-2 h-auto ${
                    item.active ? 'text-blue-600' : 'text-gray-500'
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
  )
}