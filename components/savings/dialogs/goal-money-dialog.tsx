"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useFinance } from "@/contexts/FinanceContext"

type Direction = "contribute" | "withdraw"

interface GoalMoneyDialogProps {
  goal: { id: string; name: string; currentAmount: number; targetAmount: number } | null
  onOpenChange: (open: boolean) => void
  onSubmit: (direction: Direction, amount: number) => Promise<void>
}

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

/** Add cash to a goal, or move some of it back to cash. Same sheet as Add money. */
export function GoalMoneyDialog({ goal, onOpenChange, onSubmit }: GoalMoneyDialogProps) {
  const finance = useFinance()
  const [direction, setDirection] = useState<Direction>("contribute")
  const [amount, setAmount] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (goal) {
      setDirection("contribute")
      setAmount("")
    }
  }, [goal])

  if (!goal) return null
  const value = Number(amount) || 0
  const left = Math.max(goal.targetAmount - goal.currentAmount, 0)
  const limit = direction === "contribute" ? finance?.balance ?? 0 : goal.currentAmount
  const tooMuch = value > limit
  const presets = direction === "contribute" ? [25, 50, 100, left].filter((n, i, all) => n > 0 && all.indexOf(n) === i) : [goal.currentAmount].filter((n) => n > 0)

  const submit = async () => {
    if (!value || tooMuch || saving) return
    setSaving(true)
    try {
      await onSubmit(direction, value)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!goal} onOpenChange={onOpenChange}>
      <DialogContent className="hr-topup max-h-[92dvh] overflow-y-auto sm:max-w-[440px]">
        <DialogTitle className="hr-title !text-[28px]">{goal.name}</DialogTitle>
        <DialogDescription className="text-[14px] text-[#a1a1a6]">
          {usd(goal.currentAmount)} saved of {usd(goal.targetAmount)}
        </DialogDescription>

        <div className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-[#1c1c1f] p-1" role="group" aria-label="Direction">
          {(["contribute", "withdraw"] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={direction === d}
              onClick={() => { setDirection(d); setAmount("") }}
              className={`h-9 rounded-full text-[14px] font-medium transition-colors ${direction === d ? "bg-[#2f6bff] text-white" : "text-[#a1a1a6]"}`}
            >
              {d === "contribute" ? "Add to goal" : "Move to cash"}
            </button>
          ))}
        </div>

        <label htmlFor="goal-amount" className="hr-topup-amount mt-5" data-invalid={tooMuch || undefined}>
          <span className="hr-topup-currency">$</span>
          <input
            id="goal-amount"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onChange={(e) => {
              const clean = e.target.value.replace(/[^0-9.]/g, "")
              if (/^\d*(\.\d{0,2})?$/.test(clean)) setAmount(clean)
            }}
            placeholder="0"
            aria-label="Amount in US dollars"
            className="hr-topup-input"
            style={{ width: `${Math.max(1, amount.length || 1) + 0.4}ch` }}
          />
        </label>
        <p className={`text-center text-[12.5px] ${tooMuch ? "text-[#fb7185]" : "text-[#8e8e93]"}`}>
          {direction === "contribute" ? `From your cash: ${usd(finance?.balance ?? 0)} available` : `This goal holds ${usd(goal.currentAmount)}`}
        </p>

        {presets.length > 0 && (
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            {presets.map((preset) => (
              <button key={preset} type="button" onClick={() => setAmount(preset.toFixed(2).replace(/\.00$/, ""))} className="hr-topup-preset hr-focus" data-active={value === preset || undefined}>
                {direction === "withdraw" ? "All" : preset === left ? "The rest" : `$${preset}`}
              </button>
            ))}
          </div>
        )}

        <button type="button" onClick={submit} disabled={!value || tooMuch || saving} className="hr-topup-continue hr-focus mt-4">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {direction === "contribute" ? `Add ${value ? usd(value) : "money"}` : `Move ${value ? usd(value) : "money"} to cash`}
        </button>
      </DialogContent>
    </Dialog>
  )
}
