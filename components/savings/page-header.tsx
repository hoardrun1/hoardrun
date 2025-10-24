"use client"

import { Button } from "@/components/ui/button"
import { Shield, Repeat, Plus } from "lucide-react"

interface PageHeaderProps {
  onNewGoal: () => void
  onFixedDeposit: () => void
  onAutoSave: () => void
}

export function PageHeader({ onNewGoal, onFixedDeposit, onAutoSave }: PageHeaderProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5 sm:space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Savings Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track and manage your savings goals, fixed deposits, and automated savings
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 bg-transparent"
            onClick={onFixedDeposit}
          >
            <Shield className="h-3.5 w-3.5 mr-1" />
            <span className="hidden xs:inline">FD</span>
            <span className="xs:hidden">FD</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 bg-transparent"
            onClick={onAutoSave}
          >
            <Repeat className="h-3.5 w-3.5 mr-1" />
            <span className="hidden xs:inline">Auto</span>
            <span className="xs:hidden">Auto</span>
          </Button>
          <Button size="sm" className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3" onClick={onNewGoal}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Goal
          </Button>
        </div>
      </div>
    </div>
  )
}
