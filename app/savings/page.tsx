'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SavingsHeader } from '@/components/savings/savings-header'
import { SavingsOverview } from '@/components/savings/savings-overview'
import { SavingsGoalsList } from '@/components/savings/savings-goals-list'
import { SavingsInsights } from '@/components/savings/savings-insights'
import { NewGoalDialog } from '@/components/savings/new-goal-dialog'
import { QuickActionsPanel } from '@/components/savings/quick-actions'
import { SavingsAnalytics } from '@/components/savings/savings-analytics'
import { useSession } from 'next-auth/react'
import { useSavings } from '@/hooks/useSavings'
import { useToast } from '@/components/ui/use-toast'

export default function SavingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const {
    savingsGoals,
    isLoading,
    error,
    analytics,
    fetchSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal
  } = useSavings()

  const [activeView, setActiveView] = useState('overview')
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)

  useEffect(() => {
    if (session?.user) {
      fetchSavingsGoals()
    }
  }, [session])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <SavingsHeader 
        totalSavings={analytics?.totalSavings}
        monthlyGrowth={analytics?.monthlyGrowth}
        onNewGoal={() => setIsNewGoalDialogOpen(true)}
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <QuickActionsPanel 
              onAction={(action) => handleQuickAction(action)}
              recentActivities={analytics?.recentActivities}
            />
          </motion.div>

          <SavingsOverview 
            analytics={analytics}
            className="mt-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <SavingsGoalsList 
                goals={savingsGoals}
                isLoading={isLoading}
                error={error}
                onGoalSelect={setSelectedGoal}
                onGoalUpdate={updateSavingsGoal}
                onGoalDelete={deleteSavingsGoal}
              />
            </div>
            
            <div className="lg:col-span-1">
              <SavingsInsights 
                insights={analytics?.insights}
                recommendations={analytics?.recommendations}
              />
            </div>
          </div>

          <SavingsAnalytics 
            data={analytics}
            className="mt-8"
          />
        </AnimatePresence>
      </main>

      <NewGoalDialog 
        open={isNewGoalDialogOpen}
        onOpenChange={setIsNewGoalDialogOpen}
        onSubmit={createSavingsGoal}
      />
    </div>
  )
} 
