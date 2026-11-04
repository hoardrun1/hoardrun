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
  onNewGoal: () => void
  onAddMoney: (goal: any) => void
  onEditGoal: (goal: any) => void
  onBreakDeposit: (deposit: any) => void
  onTogglePlan: (plan: any) => void
  onDeletePlan: (plan: any) => void
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
  onNewGoal,
  onAddMoney,
  onEditGoal,
  onBreakDeposit,
  onTogglePlan,
  onDeletePlan,
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
      <TabsList className="w-full">
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
        <GoalsTab goals={createdGoals.filter((g) => !g.isCompleted)} onNewGoal={onNewGoal} onAddMoney={onAddMoney} onEdit={onEditGoal} />
      </TabsContent>

      <TabsContent value="fixed-deposits" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
        <FixedDepositsTab deposits={fixedDeposits} onNewDeposit={onFixedDeposit} onBreak={onBreakDeposit} />
      </TabsContent>

      <TabsContent value="automated" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
        <AutomatedTab plans={automatedSavings} onNewSaving={onAutoSave} onToggle={onTogglePlan} onDelete={onDeletePlan} />
      </TabsContent>

      <TabsContent value="completed" className="mt-3 sm:mt-4">
        <CompletedTab goals={createdGoals.filter((g) => g.isCompleted)} onAddMoney={onAddMoney} onEdit={onEditGoal} />
      </TabsContent>

      <TabsContent value="insights" className="mt-3 sm:mt-4">
        <InsightsTab insights={analytics.insights} />
      </TabsContent>
    </Tabs>
  )
}
