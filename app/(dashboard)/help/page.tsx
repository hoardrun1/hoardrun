'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

import { DepositModal } from '@/components/deposit-modal'
import { SectionFooter } from '@/components/ui/section-footer'

export default function HelpPage() {
  const { theme } = useTheme()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-background pt-16 pb-32 px-4 sm:pt-20 sm:pb-32 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Help Center</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">Find answers to common questions and get the help you need</p>
            </div>
          </div>
        </div>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
        
        <SectionFooter section="support" activePage="/help" />
    </div>
  )
}
