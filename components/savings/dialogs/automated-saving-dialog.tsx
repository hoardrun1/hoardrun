"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Repeat } from "lucide-react"

interface AutomatedSavingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: any
  setForm: (form: any) => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function AutomatedSavingDialog({ open, onOpenChange, form, setForm }: AutomatedSavingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="text-lg sm:text-xl">Create Auto Save</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Set up regular automatic transfers to your savings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="as-name" className="text-xs sm:text-sm font-medium">
              Name
            </Label>
            <Input
              id="as-name"
              placeholder="e.g., Emergency Fund"
              className="h-9 sm:h-10 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="as-amount" className="text-xs sm:text-sm font-medium">
                Amount
              </Label>
              <Input
                id="as-amount"
                type="number"
                placeholder="50"
                className="h-9 sm:h-10 text-sm"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-medium">Frequency</Label>
              <Select
                value={form.frequency}
                onValueChange={(value: "DAILY" | "WEEKLY" | "MONTHLY") => setForm({ ...form, frequency: value })}
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.amount && (
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-foreground/10">
                  <TrendingUp className="h-3.5 w-3.5 text-foreground" />
                </div>
                <p className="text-xs sm:text-sm font-semibold">Projection</p>
              </div>
              {(() => {
                const amount = Number.parseFloat(form.amount) || 0
                const frequency = form.frequency
                let monthlyAmount = 0

                if (frequency === "DAILY") monthlyAmount = amount * 30
                else if (frequency === "WEEKLY") monthlyAmount = amount * 4.33
                else monthlyAmount = amount

                const yearlyAmount = monthlyAmount * 12

                return (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly:</span>
                      <span className="font-semibold">{formatCurrency(monthlyAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yearly:</span>
                      <span className="font-semibold">{formatCurrency(yearlyAmount)}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between">
                      <span className="font-medium">In 5 Years:</span>
                      <span className="font-bold">{formatCurrency(yearlyAmount * 5)}</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          <Button className="w-full h-9 sm:h-10 text-sm font-semibold">
            <Repeat className="h-3.5 w-3.5 mr-1.5" />
            Create Auto Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
