"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Shield } from "lucide-react"

interface FixedDepositDialogProps {
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

const getInterestRate = (termInMonths: number) => {
  if (termInMonths >= 60) return 5.5
  if (termInMonths >= 36) return 5.0
  if (termInMonths >= 24) return 4.8
  if (termInMonths >= 12) return 4.5
  if (termInMonths >= 6) return 4.0
  return 3.5
}

const calculateFixedDepositInterest = (amount: number, term: number, rate = 4.5) => {
  const interest = (amount * rate * (term / 12)) / 100
  const maturityAmount = amount + interest
  return { interest, maturityAmount, rate }
}

export function FixedDepositDialog({ open, onOpenChange, form, setForm }: FixedDepositDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="text-lg sm:text-xl">Create Fixed Deposit</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Lock in your savings for guaranteed returns
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="fd-amount" className="text-xs sm:text-sm font-medium">
              Amount
            </Label>
            <Input
              id="fd-amount"
              type="number"
              placeholder="Minimum $1,000"
              className="h-9 sm:h-10 text-sm"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Min: $1,000</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium">Term</Label>
            <Select value={form.term} onValueChange={(value) => setForm({ ...form, term: value })}>
              <SelectTrigger className="h-9 sm:h-10 text-sm">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Months (4.0%)</SelectItem>
                <SelectItem value="12">1 Year (4.5%)</SelectItem>
                <SelectItem value="24">2 Years (4.8%)</SelectItem>
                <SelectItem value="36">3 Years (5.0%)</SelectItem>
                <SelectItem value="60">5 Years (5.5%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.amount && (
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-foreground/10">
                  <DollarSign className="h-3.5 w-3.5 text-foreground" />
                </div>
                <p className="text-xs sm:text-sm font-semibold">Interest</p>
              </div>
              {(() => {
                const amount = Number.parseFloat(form.amount) || 0
                const termInMonths = Number.parseInt(form.term) || 12
                const rate = getInterestRate(termInMonths)
                const { interest, maturityAmount } = calculateFixedDepositInterest(amount, termInMonths, rate)

                return (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Principal:</span>
                      <span className="font-semibold">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="font-semibold">{rate}% APY</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest:</span>
                      <span className="font-semibold">{formatCurrency(interest)}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between">
                      <span className="font-medium">Maturity:</span>
                      <span className="font-bold">{formatCurrency(maturityAmount)}</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs sm:text-sm font-medium">Options</p>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="roundup" className="text-xs sm:text-sm font-medium cursor-pointer">
                  Roundup
                </Label>
                <p className="text-xs text-muted-foreground">Round up transactions</p>
              </div>
              <Switch
                id="roundup"
                checked={form.roundupEnabled}
                onCheckedChange={(checked) => setForm({ ...form, roundupEnabled: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoRenew" className="text-xs sm:text-sm font-medium cursor-pointer">
                  Auto-renew
                </Label>
                <p className="text-xs text-muted-foreground">Renew at maturity</p>
              </div>
              <Switch
                id="autoRenew"
                checked={form.autoRenew}
                onCheckedChange={(checked) => setForm({ ...form, autoRenew: checked })}
              />
            </div>
          </div>

          <Button className="w-full h-9 sm:h-10 text-sm font-semibold">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Create FD
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
