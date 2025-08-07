'use client'

import { useState } from 'react'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'

export default function ContactPage() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-white pt-16 pb-4 px-4 sm:pt-20 sm:pb-6 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-black">Contact Us</h1>
              <p className="text-black/60 mt-2 text-sm sm:text-base">Get in touch with our support team</p>
            </div>
          </div>
        </div>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
