"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Repeat } from "lucide-react"

interface AutomatedTabProps {
  savings: any[]
  setSavings: (savings: any[]) => void
  onNewSaving: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function AutomatedTab({ savings, setSavings, onNewSaving }: AutomatedTabProps) {
  if (savings.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <div className="rounded-full bg-muted p-3 sm:p-4 mb-3 sm:mb-4">
            <Repeat className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold mb-1">No Automated Savings Yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4 max-w-xs">
            Set up automatic transfers to build savings consistently
          </p>
          <Button onClick={onNewSaving} size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
            <Repeat className="h-3.5 w-3.5 mr-1" />
            Create Auto Save
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3">
      {savings.map((saving) => {
        let monthlyAmount = 0
        if (saving.frequency === "DAILY") monthlyAmount = saving.amount * 30
        else if (saving.frequency === "WEEKLY") monthlyAmount = saving.amount * 4.33
        else monthlyAmount = saving.amount

        return (
          <Card key={saving.id} className="border-border/50 hover:shadow-sm transition-shadow overflow-hidden">
            <div className={`h-1 ${saving.isActive ? "bg-foreground/30" : "bg-muted"}`} />
            <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1 flex-1 min-w-0">
                  <CardTitle className="text-sm sm:text-base line-clamp-1 flex items-center gap-1.5">
                    <Repeat
                      className={`h-3.5 w-3.5 flex-shrink-0 ${saving.isActive ? "text-foreground" : "text-muted-foreground"}`}
                    />
                    {saving.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {formatCurrency(saving.amount)} • {saving.frequency.toLowerCase()}
                  </CardDescription>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs sm:text-sm font-bold">{formatCurrency(saving.totalSaved)}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3 space-y-2 sm:space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground mb-0.5">Next Transfer</p>
                  <p className="font-medium">
                    {saving.nextDeduction.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground mb-0.5">Status</p>
                  <p
                    className={`font-semibold text-xs ${saving.isActive ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {saving.isActive ? "Active" : "Paused"}
                  </p>
                </div>
              </div>

              <div className="p-2 sm:p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-xs text-muted-foreground mb-0.5">Monthly</p>
                <p className="text-sm sm:text-base font-bold">{formatCurrency(monthlyAmount)}</p>
              </div>

              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-7 sm:h-8 bg-transparent"
                  onClick={() => {
                    setSavings(savings.map((s) => (s.id === saving.id ? { ...s, isActive: !s.isActive } : s)))
                  }}
                >
                  {saving.isActive ? "Pause" : "Resume"}
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-7 sm:h-8">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
