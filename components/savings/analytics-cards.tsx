import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PiggyBank, TrendingUp, Target, DollarSign } from "lucide-react"

interface AnalyticsCardsProps {
  analytics: {
    totalSavings: number
    monthlyGrowth: number
    nextMilestone: number
    projectedSavings: number
  }
  isLoading: boolean
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function AnalyticsCards({ analytics, isLoading }: AnalyticsCardsProps) {
  const cards = [
    { title: "Total Savings", value: analytics.totalSavings, icon: PiggyBank },
    { title: "Monthly Growth", value: analytics.monthlyGrowth, icon: TrendingUp },
    { title: "Next Milestone", value: analytics.nextMilestone, icon: Target },
    { title: "Projected Savings", value: analytics.projectedSavings, icon: DollarSign },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      {cards.map((item, idx) => (
        <Card key={idx} className="border-border/50 hover:shadow-sm transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-muted">
                <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground" />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">{item.title}</p>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <p className="text-base sm:text-lg md:text-xl font-bold tracking-tight">{formatCurrency(item.value)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
