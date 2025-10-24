"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoalsTab } from "./tabs/goals-tab"
import { FixedDepositsTab } from "./tabs/fixed-deposits-tab"
import { AutomatedTab } from "./tabs/automated-tab"
import { CompletedTab } from "./tabs/completed-tab"
import { InsightsTab } from "./tabs/insights-tab"

interface SavingsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  createdGoals: any[]
  fixedDeposits: any[]
  automatedSavings: any[]
  setAutomatedSavings: (savings: any[]) => void
  onNewGoal: () => void
  onFixedDeposit: () => void
  onAutoSave: () => void
  analytics: any
}

export function SavingsTabs({
  activeTab,
  onTabChange,
  createdGoals,
  fixedDeposits,
  automatedSavings,
  setAutomatedSavings,
  onNewGoal,
  onFixedDeposit,
  onAutoSave,
  analytics,
}: SavingsTabsProps) {
  const tabs = [
    { value: "active", label: "Goals", short: "Goals" },
    { value: "fixed-deposits", label: "FD", short: "FD" },
    { value: "automated", label: "Auto", short: "Auto" },
    { value: "completed", label: "Done", short: "Done" },
    { value: "insights", label: "Insights", short: "Tips" },
  ]

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-3 sm:space-y-4">
      <TabsList className="w-full h-auto p-0.5 sm:p-1 bg-muted grid grid-cols-5 gap-0.5 sm:gap-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.short}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="active" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
        <GoalsTab goals={createdGoals} onNewGoal={onNewGoal} />
      </TabsContent>

      <TabsContent value="fixed-deposits" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
        <FixedDepositsTab deposits={fixedDeposits} onNewDeposit={onFixedDeposit} />
      </TabsContent>

      <TabsContent value="automated" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
        <AutomatedTab savings={automatedSavings} setSavings={setAutomatedSavings} onNewSaving={onAutoSave} />
      </TabsContent>

      <TabsContent value="completed" className="mt-3 sm:mt-4">
        <CompletedTab />
      </TabsContent>

      <TabsContent value="insights" className="mt-3 sm:mt-4">
        <InsightsTab insights={analytics.insights} />
      </TabsContent>
    </Tabs>
  )
}
