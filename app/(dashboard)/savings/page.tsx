"use client"

import { useCallback, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useSavings, type SavingsGoal } from "@/hooks/useSavings"
import { useFinance } from "@/contexts/FinanceContext"
import { apiClient } from "@/lib/api-client"
import { PageHeader } from "@/components/savings/page-header"
import { AnalyticsCards } from "@/components/savings/analytics-cards"
import { SavingsTabs } from "@/components/savings/savings-tabs"
import { NewGoalDialog } from "@/components/savings/dialogs/new-goal-dialog"
import { FixedDepositDialog } from "@/components/savings/dialogs/fixed-deposit-dialog"
import { AutomatedSavingDialog } from "@/components/savings/dialogs/automated-saving-dialog"
import { GoalMoneyDialog } from "@/components/savings/dialogs/goal-money-dialog"

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
const errorText = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong. Try again.")
const EMPTY_GOAL = { name: "", targetAmount: "", monthlyContribution: "", category: "", deadline: null as Date | null, isAutoSave: true }

export default function EnhancedSavingsPage() {
  const { toast } = useToast()
  const finance = useFinance()
  const {
    savingsGoals: createdGoals,
    fetchSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    moveGoalMoney,
  } = useSavings()

  const [analytics, setAnalytics] = useState({
    totalSavings: 0,
    monthlyGrowth: 0,
    nextMilestone: 0,
    projectedSavings: 0,
    insights: [] as Array<{ title: string; description: string }>,
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false)
  const [isFixedDepositDialogOpen, setIsFixedDepositDialogOpen] = useState(false)
  const [isAutomatedSavingDialogOpen, setIsAutomatedSavingDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const [submitting, setSubmitting] = useState(false)

  const [fixedDeposits, setFixedDeposits] = useState<any[]>([])
  const [automatedSavings, setAutomatedSavings] = useState<any[]>([])
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [moneyGoal, setMoneyGoal] = useState<SavingsGoal | null>(null)

  const [newGoalForm, setNewGoalForm] = useState(EMPTY_GOAL)
  const [fixedDepositForm, setFixedDepositForm] = useState({
    amount: "",
    term: "12",
    customTerm: "",
    termType: "months",
    roundupEnabled: false,
    autoRenew: false,
  })
  const [automatedSavingForm, setAutomatedSavingForm] = useState({
    name: "",
    amount: "",
    frequency: "MONTHLY" as "DAILY" | "WEEKLY" | "MONTHLY",
    startDate: new Date(),
  })

  // Totals and tips come from the server, which counts goals, deposits and auto-save together
  const refreshStats = useCallback(async () => {
    const [statsResponse, insightsResponse] = await Promise.all([apiClient.getSavingsStats(), apiClient.getSavingsInsights()])
    const tips: string[] = insightsResponse.data?.recommendations ?? []
    setAnalytics({
      totalSavings: statsResponse.data?.total_savings || 0,
      monthlyGrowth: statsResponse.data?.monthly_growth || 0,
      nextMilestone: statsResponse.data?.next_milestone || 0,
      projectedSavings: statsResponse.data?.projected_savings || 0,
      insights: tips.map((tip, index) => ({ title: `Tip ${index + 1}`, description: tip })),
    })
    setAnalyticsLoading(false)
  }, [])

  const loadDeposits = useCallback(async () => {
    const response = await apiClient.getFixedDeposits()
    if (Array.isArray(response.data)) setFixedDeposits(response.data)
  }, [])

  const loadPlans = useCallback(async () => {
    const response = await apiClient.getAutoSavePlans()
    if (Array.isArray(response.data)) setAutomatedSavings(response.data)
  }, [])

  // Every money move changes cash, savings totals and the lists, so refresh them together
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchSavingsGoals(), loadDeposits(), loadPlans(), refreshStats(), finance?.refreshBalance?.()])
  }, [fetchSavingsGoals, loadDeposits, loadPlans, refreshStats, finance])

  useEffect(() => {
    refreshAll().catch(() => setAnalyticsLoading(false))
    // Load once; actions refresh afterwards
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openNewGoal = () => {
    setEditingGoal(null)
    setNewGoalForm(EMPTY_GOAL)
    setIsNewGoalDialogOpen(true)
  }

  const openEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setNewGoalForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      monthlyContribution: String(goal.monthlyContribution),
      category: goal.category,
      deadline: new Date(`${goal.deadline}T00:00:00`),
      isAutoSave: goal.isAutoSave,
    })
    setIsNewGoalDialogOpen(true)
  }

  const handleSaveGoal = async () => {
    if (!newGoalForm.name || !newGoalForm.targetAmount || !newGoalForm.monthlyContribution) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    const data = {
      name: newGoalForm.name,
      targetAmount: Number.parseFloat(newGoalForm.targetAmount),
      monthlyContribution: Number.parseFloat(newGoalForm.monthlyContribution),
      category: newGoalForm.category || "General",
      deadline: newGoalForm.deadline instanceof Date ? newGoalForm.deadline.toISOString().slice(0, 10) : undefined,
      isAutoSave: newGoalForm.isAutoSave,
    }
    setSubmitting(true)
    try {
      if (editingGoal) {
        await updateSavingsGoal(editingGoal.id, data)
        toast({ title: "Goal updated", description: `"${data.name}" is saved.` })
      } else {
        await createSavingsGoal(data)
        toast({ title: "Goal created", description: `"${data.name}" is ready. Add money any time.` })
      }
      setIsNewGoalDialogOpen(false)
      setNewGoalForm(EMPTY_GOAL)
      setEditingGoal(null)
      await refreshStats()
    } catch (err) {
      toast({ title: "Couldn't save the goal", description: errorText(err), variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteGoal = async () => {
    if (!editingGoal) return
    const held = editingGoal.currentAmount
    if (!window.confirm(held > 0 ? `Delete "${editingGoal.name}"? ${usd(held)} will move back to your cash.` : `Delete "${editingGoal.name}"?`)) return
    setSubmitting(true)
    try {
      await deleteSavingsGoal(editingGoal.id)
      setIsNewGoalDialogOpen(false)
      setEditingGoal(null)
      toast({ title: "Goal deleted", description: held > 0 ? `${usd(held)} is back in your cash.` : "It's gone from your goals." })
      await refreshAll()
    } catch (err) {
      toast({ title: "Couldn't delete the goal", description: errorText(err), variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoalMoney = async (direction: "contribute" | "withdraw", amount: number) => {
    if (!moneyGoal) return
    try {
      const goal = await moveGoalMoney(moneyGoal.id, direction, amount)
      setMoneyGoal(null)
      toast({
        title: direction === "contribute" ? `${usd(amount)} added to ${goal.name}` : `${usd(amount)} moved to cash`,
        description: goal.isCompleted && direction === "contribute" ? "Goal reached. Well done." : `${usd(goal.currentAmount)} of ${usd(goal.targetAmount)} saved.`,
      })
      await refreshAll()
    } catch (err) {
      toast({ title: "Couldn't move the money", description: errorText(err), variant: "destructive" })
    }
  }

  const handleCreateDeposit = async () => {
    const amount = Number.parseFloat(fixedDepositForm.amount)
    if (!amount || amount <= 0) {
      toast({ title: "Enter an amount", description: "How much do you want to lock away?", variant: "destructive" })
      return
    }
    setSubmitting(true)
    const response = await apiClient.createFixedDeposit({
      amount,
      termMonths: Number.parseInt(fixedDepositForm.term) || 12,
      autoRenew: fixedDepositForm.autoRenew,
      roundupEnabled: fixedDepositForm.roundupEnabled,
    })
    setSubmitting(false)
    if (response.error) {
      toast({ title: "Couldn't open the deposit", description: response.error, variant: "destructive" })
      return
    }
    setIsFixedDepositDialogOpen(false)
    setFixedDepositForm({ ...fixedDepositForm, amount: "" })
    setActiveTab("fixed-deposits")
    toast({ title: "Fixed deposit opened", description: `${usd(amount)} earns ${response.data.rate}% until ${new Date(`${response.data.maturityDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.` })
    await refreshAll()
  }

  const handleBreakDeposit = async (deposit: any) => {
    if (!window.confirm(`Close this deposit early? ${usd(deposit.amount)} goes back to your cash, without the ${usd(deposit.interest)} interest.`)) return
    const response = await apiClient.breakFixedDeposit(deposit.id)
    if (response.error) {
      toast({ title: "Couldn't close the deposit", description: response.error, variant: "destructive" })
      return
    }
    toast({ title: "Deposit closed", description: `${usd(deposit.amount)} is back in your cash.` })
    await refreshAll()
  }

  const handleCreatePlan = async () => {
    const amount = Number.parseFloat(automatedSavingForm.amount)
    if (!automatedSavingForm.name.trim() || !amount || amount <= 0) {
      toast({ title: "Add a name and amount", description: "Both are needed to set up auto-save.", variant: "destructive" })
      return
    }
    setSubmitting(true)
    const start = automatedSavingForm.startDate instanceof Date ? automatedSavingForm.startDate : new Date()
    const response = await apiClient.createAutoSavePlan({
      name: automatedSavingForm.name.trim(),
      amount,
      frequency: automatedSavingForm.frequency,
      startDate: new Date(Math.max(start.getTime(), Date.now())).toISOString().slice(0, 10),
    })
    setSubmitting(false)
    if (response.error) {
      toast({ title: "Couldn't set up auto-save", description: response.error, variant: "destructive" })
      return
    }
    setIsAutomatedSavingDialogOpen(false)
    setAutomatedSavingForm({ name: "", amount: "", frequency: "MONTHLY", startDate: new Date() })
    setActiveTab("automated")
    toast({ title: "Auto-save is on", description: response.data.lastStatus || `First run on ${response.data.nextRun}.` })
    await refreshAll()
  }

  const handleTogglePlan = async (plan: any) => {
    const response = await apiClient.setAutoSavePlanActive(plan.id, !plan.isActive)
    if (response.error) {
      toast({ title: "Couldn't update auto-save", description: response.error, variant: "destructive" })
      return
    }
    toast({ title: plan.isActive ? "Auto-save paused" : "Auto-save resumed", description: plan.isActive ? "No money moves until you resume." : "It runs again from today." })
    await refreshAll()
  }

  const handleDeletePlan = async (plan: any) => {
    if (!window.confirm(plan.savedTotal > 0 ? `Stop "${plan.name}"? The ${usd(plan.savedTotal)} it saved goes back to your cash.` : `Stop "${plan.name}"?`)) return
    const response = await apiClient.deleteAutoSavePlan(plan.id)
    if (response.error) {
      toast({ title: "Couldn't stop auto-save", description: response.error, variant: "destructive" })
      return
    }
    toast({ title: "Auto-save stopped", description: plan.savedTotal > 0 ? `${usd(plan.savedTotal)} is back in your cash.` : "Nothing more will be moved." })
    await refreshAll()
  }

  return (
    <div>
      <div>
        <div className="space-y-5 sm:space-y-6">
          <PageHeader
            onNewGoal={openNewGoal}
            onFixedDeposit={() => setIsFixedDepositDialogOpen(true)}
            onAutoSave={() => setIsAutomatedSavingDialogOpen(true)}
          />

          <AnalyticsCards
            analytics={analytics}
            isLoading={analyticsLoading}
            onNewGoal={openNewGoal}
            onFixedDeposit={() => setIsFixedDepositDialogOpen(true)}
            onAutoSave={() => setIsAutomatedSavingDialogOpen(true)}
          />

          <SavingsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            createdGoals={createdGoals}
            fixedDeposits={fixedDeposits}
            automatedSavings={automatedSavings}
            onNewGoal={openNewGoal}
            onAddMoney={setMoneyGoal}
            onEditGoal={openEditGoal}
            onBreakDeposit={handleBreakDeposit}
            onTogglePlan={handleTogglePlan}
            onDeletePlan={handleDeletePlan}
            onFixedDeposit={() => setIsFixedDepositDialogOpen(true)}
            onAutoSave={() => setIsAutomatedSavingDialogOpen(true)}
            analytics={analytics}
          />
        </div>
      </div>

      <NewGoalDialog
        open={isNewGoalDialogOpen}
        onOpenChange={(open) => { setIsNewGoalDialogOpen(open); if (!open) setEditingGoal(null) }}
        form={newGoalForm}
        setForm={setNewGoalForm}
        onSubmit={handleSaveGoal}
        mode={editingGoal ? "edit" : "create"}
        onDelete={editingGoal ? handleDeleteGoal : undefined}
        submitting={submitting}
      />

      <GoalMoneyDialog goal={moneyGoal} onOpenChange={(open) => !open && setMoneyGoal(null)} onSubmit={handleGoalMoney} />

      <FixedDepositDialog
        open={isFixedDepositDialogOpen}
        onOpenChange={setIsFixedDepositDialogOpen}
        form={fixedDepositForm}
        setForm={setFixedDepositForm}
        onSubmit={handleCreateDeposit}
        submitting={submitting}
      />

      <AutomatedSavingDialog
        open={isAutomatedSavingDialogOpen}
        onOpenChange={setIsAutomatedSavingDialogOpen}
        form={automatedSavingForm}
        setForm={setAutomatedSavingForm}
        onSubmit={handleCreatePlan}
        submitting={submitting}
      />
    </div>
  )
}
