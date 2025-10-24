"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Plus } from "lucide-react"

interface NewGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: any
  setForm: (form: any) => void
  onSubmit: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function NewGoalDialog({ open, onOpenChange, form, setForm, onSubmit }: NewGoalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="text-lg sm:text-xl">Create Savings Goal</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Set up a new savings goal with regular contributions
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="goal-name" className="text-xs sm:text-sm font-medium">
              Goal Name
            </Label>
            <Input
              id="goal-name"
              placeholder="e.g., Emergency Fund"
              className="h-9 sm:h-10 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-target" className="text-xs sm:text-sm font-medium">
                Target Amount
              </Label>
              <Input
                id="goal-target"
                type="number"
                placeholder="10000"
                className="h-9 sm:h-10 text-sm"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-monthly" className="text-xs sm:text-sm font-medium">
                Monthly
              </Label>
              <Input
                id="goal-monthly"
                type="number"
                placeholder="500"
                className="h-9 sm:h-10 text-sm"
                value={form.monthlyContribution}
                onChange={(e) => setForm({ ...form, monthlyContribution: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-medium">Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger className="h-9 sm:h-10 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Retirement">Retirement</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Vehicle">Vehicle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-deadline" className="text-xs sm:text-sm font-medium">
                Target Date
              </Label>
              <Input
                id="goal-deadline"
                type="date"
                className="h-9 sm:h-10 text-sm"
                value={form.deadline ? form.deadline.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deadline: e.target.value ? new Date(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>

          {form.targetAmount && form.monthlyContribution && (
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-foreground/10">
                  <TrendingUp className="h-3.5 w-3.5 text-foreground" />
                </div>
                <p className="text-xs sm:text-sm font-semibold">Timeline</p>
              </div>
              {(() => {
                const target = Number.parseFloat(form.targetAmount) || 0
                const monthly = Number.parseFloat(form.monthlyContribution) || 0

                if (target > 0 && monthly > 0) {
                  const monthsToGoal = Math.ceil(target / monthly)
                  const yearsToGoal = (monthsToGoal / 12).toFixed(1)

                  return (
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target:</span>
                        <span className="font-semibold">{formatCurrency(target)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly:</span>
                        <span className="font-semibold">{formatCurrency(monthly)}</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-bold">
                          {monthsToGoal}mo ({yearsToGoal}y)
                        </span>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          )}

          <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-muted/50 border border-border/50">
            <Switch
              id="goal-autosave"
              checked={form.isAutoSave}
              onCheckedChange={(checked) => setForm({ ...form, isAutoSave: checked })}
            />
            <div className="flex-1">
              <Label htmlFor="goal-autosave" className="text-xs sm:text-sm font-medium cursor-pointer">
                Auto-Save
              </Label>
              <p className="text-xs text-muted-foreground">Auto transfer monthly</p>
            </div>
          </div>

          <Button onClick={onSubmit} className="w-full h-9 sm:h-10 text-sm font-semibold">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
