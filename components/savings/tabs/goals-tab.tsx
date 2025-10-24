"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PiggyBank, Calendar, Repeat, Plus } from "lucide-react"

interface GoalsTabProps {
  goals: any[]
  onNewGoal: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function GoalsTab({ goals, onNewGoal }: GoalsTabProps) {
  if (goals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <div className="rounded-full bg-muted p-3 sm:p-4 mb-3 sm:mb-4">
            <PiggyBank className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold mb-1">No Savings Goals Yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4 max-w-xs">
            Create your first savings goal to start tracking progress
          </p>
          <Button onClick={onNewGoal} size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Goal
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100
        const remaining = goal.targetAmount - goal.currentAmount
        const monthsLeft = Math.ceil(remaining / goal.monthlyContribution)

        return (
          <Card key={goal.id} className="border-border/50 hover:shadow-sm transition-shadow overflow-hidden">
            <div className="h-1 bg-foreground/20" />
            <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base line-clamp-1">{goal.name}</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1 mt-0.5 flex-wrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-muted text-xs font-medium">
                        {goal.category}
                      </span>
                      <span>{formatCurrency(goal.monthlyContribution)}/mo</span>
                    </CardDescription>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs sm:text-sm font-bold">{formatCurrency(goal.currentAmount)}</div>
                    <div className="text-xs text-muted-foreground">of {formatCurrency(goal.targetAmount)}</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3 space-y-2 sm:space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-1.5 sm:h-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 sm:p-3 rounded-lg bg-muted/50 border border-border/50 text-xs">
                <div>
                  <p className="text-muted-foreground flex items-center gap-0.5 mb-0.5">
                    <Calendar className="h-3 w-3" />
                    Target
                  </p>
                  <p className="font-medium">
                    {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Time Left</p>
                  <p className="font-medium">{monthsLeft}mo</p>
                </div>
              </div>

              {goal.isAutoSave && (
                <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-lg bg-muted/50 border border-border/50 text-xs">
                  <Repeat className="h-3 w-3 flex-shrink-0" />
                  <span className="font-medium">Auto-save enabled</span>
                </div>
              )}

              <div className="flex gap-1.5 pt-1">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-7 sm:h-8 bg-transparent">
                  Add
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
