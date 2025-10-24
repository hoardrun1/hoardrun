"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useToast } from "@/components/ui/use-toast"
import { useSavings } from "@/hooks/useSavings"
import { apiClient } from "@/lib/api-client"
import { PageHeader } from "@/components/savings/page-header"
import { AnalyticsCards } from "@/components/savings/analytics-cards"
import { SavingsTabs } from "@/components/savings/savings-tabs"
import { NewGoalDialog } from "@/components/savings/dialogs/new-goal-dialog"
import { FixedDepositDialog } from "@/components/savings/dialogs/fixed-deposit-dialog"
import { AutomatedSavingDialog } from "@/components/savings/dialogs/automated-saving-dialog"

export default function EnhancedSavingsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const {
    savingsGoals: createdGoals,
    isLoading: goalsLoading,
    error: goalsError,
    fetchSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
  } = useSavings()

  const [analytics, setAnalytics] = useState({
    totalSavings: 0,
    monthlyGrowth: 0,
    nextMilestone: 0,
    projectedSavings: 0,
    insights: [] as Array<{ title: string; description: string }>,
  })

  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false)
  const [isFixedDepositDialogOpen, setIsFixedDepositDialogOpen] = useState(false)
  const [isAutomatedSavingDialogOpen, setIsAutomatedSavingDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("active")

  const [fixedDeposits, setFixedDeposits] = useState<any[]>([])

  const [automatedSavings, setAutomatedSavings] = useState<any[]>([])

  const [newGoalForm, setNewGoalForm] = useState({
    name: "",
    targetAmount: "",
    monthlyContribution: "",
    category: "",
    deadline: null as Date | null,
    isAutoSave: true,
  })

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

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setAnalyticsLoading(true)
        setAnalyticsError(null)

        const [statsResponse, insightsResponse] = await Promise.all([
          apiClient.getSavingsStats(),
          apiClient.getSavingsInsights(),
        ])

        let insightsArray: Array<{ title: string; description: string }> = []
        const insightsData = insightsResponse.data?.data || insightsResponse.data

        if (insightsData && typeof insightsData === "object") {
          if (insightsData.recommendations && Array.isArray(insightsData.recommendations)) {
            insightsArray = insightsData.recommendations.map((rec: string, index: number) => ({
              title: `Recommendation ${index + 1}`,
              description: rec,
            }))
          }

          if (insightsData.current_savings_rate !== undefined && insightsData.recommended_savings_rate !== undefined) {
            insightsArray.push({
              title: "Savings Rate Analysis",
              description: `Your current savings rate is $${insightsData.current_savings_rate.toFixed(2)}/month. Consider increasing to $${insightsData.recommended_savings_rate.toFixed(2)}/month for better financial health.`,
            })
          }

          if (insightsData.savings_streak !== undefined) {
            insightsArray.push({
              title: "Savings Streak",
              description: `You've maintained a ${insightsData.savings_streak}-day savings streak. Keep it up!`,
            })
          }
        }

        const newAnalytics = {
          totalSavings: statsResponse.data?.total_savings || 0,
          monthlyGrowth: statsResponse.data?.monthly_growth || 0,
          nextMilestone: statsResponse.data?.next_milestone || 0,
          projectedSavings: statsResponse.data?.projected_savings || 0,
          insights: insightsArray,
        }

        setAnalytics(newAnalytics)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch savings analytics"
        setAnalyticsError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setAnalyticsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [toast])

  const handleCreateGoal = async () => {
    if (!newGoalForm.name || !newGoalForm.targetAmount || !newGoalForm.monthlyContribution) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    try {
      await createSavingsGoal({
        name: newGoalForm.name,
        targetAmount: Number.parseFloat(newGoalForm.targetAmount),
        monthlyContribution: Number.parseFloat(newGoalForm.monthlyContribution),
        category: newGoalForm.category || "General",
        deadline:
          newGoalForm.deadline instanceof Date
            ? newGoalForm.deadline.toISOString()
            : new Date(Date.now() + 31536000000).toISOString(),
        isAutoSave: newGoalForm.isAutoSave,
      })

      setIsNewGoalDialogOpen(false)
      setNewGoalForm({
        name: "",
        targetAmount: "",
        monthlyContribution: "",
        category: "",
        deadline: null,
        isAutoSave: true,
      })
      toast({ title: "Success", description: `Savings goal "${newGoalForm.name}" created successfully` })
    } catch (error) {
      toast({ title: "Error", description: "Failed to create savings goal", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <PageHeader
            onNewGoal={() => setIsNewGoalDialogOpen(true)}
            onFixedDeposit={() => setIsFixedDepositDialogOpen(true)}
            onAutoSave={() => setIsAutomatedSavingDialogOpen(true)}
          />

          <AnalyticsCards analytics={analytics} isLoading={analyticsLoading} />

          <SavingsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            createdGoals={createdGoals}
            fixedDeposits={fixedDeposits}
            automatedSavings={automatedSavings}
            setAutomatedSavings={setAutomatedSavings}
            onNewGoal={() => setIsNewGoalDialogOpen(true)}
            onFixedDeposit={() => setIsFixedDepositDialogOpen(true)}
            onAutoSave={() => setIsAutomatedSavingDialogOpen(true)}
            analytics={analytics}
          />
        </div>
      </div>

      <NewGoalDialog
        open={isNewGoalDialogOpen}
        onOpenChange={setIsNewGoalDialogOpen}
        form={newGoalForm}
        setForm={setNewGoalForm}
        onSubmit={handleCreateGoal}
      />

      <FixedDepositDialog
        open={isFixedDepositDialogOpen}
        onOpenChange={setIsFixedDepositDialogOpen}
        form={fixedDepositForm}
        setForm={setFixedDepositForm}
      />

      <AutomatedSavingDialog
        open={isAutomatedSavingDialogOpen}
        onOpenChange={setIsAutomatedSavingDialogOpen}
        form={automatedSavingForm}
        setForm={setAutomatedSavingForm}
      />
    </div>
  )
}
