"use client"

import { Calendar, Pause, Play, Repeat, Trash2 } from "lucide-react"
import { BarsGraphic } from "@/components/app/home-graphics"
import { SavingsEmpty, SavingsEmptyButton } from "@/components/savings/savings-empty"

interface AutomatedTabProps {
  plans: any[]
  onNewSaving: () => void
  onToggle?: (plan: any) => void
  onDelete?: (plan: any) => void
}

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
const PER_MONTH: Record<string, number> = { DAILY: 30, WEEKLY: 4.33, MONTHLY: 1 }

/** Auto-save plans held on the server. Each run moves the amount from cash into the plan. */
export function AutomatedTab({ plans, onNewSaving, onToggle, onDelete }: AutomatedTabProps) {
  if (plans.length === 0) {
    return (
      <SavingsEmpty
        graphic={<BarsGraphic tone="violet" className="h-full w-full" />}
        title="No automatic saving yet"
        text="Move a set amount into savings every day, week or month."
        action={<SavingsEmptyButton onClick={onNewSaving}><Repeat className="h-4 w-4" strokeWidth={2.2} />Set up auto-save</SavingsEmptyButton>}
      />
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const tone = plan.isActive ? "147 197 253" : "142 142 147"
        return (
          <article key={plan.id} className="hr-goal" style={{ ["--tone" as string]: tone }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="hr-card-title truncate text-[18px]">{plan.name}</h3>
                <p className="mt-0.5 text-[12.5px] text-[#a1a1a6]">
                  {usd(plan.amount)} {plan.frequency.toLowerCase()} · about {usd(plan.amount * PER_MONTH[plan.frequency])}/mo
                </p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: `rgb(${tone} / 0.16)`, color: `rgb(${tone})` }}>
                {plan.isActive ? "Active" : "Paused"}
              </span>
            </div>
            <p className="mt-4 text-[13px] text-[#a1a1a6]">
              <span className="hr-figure text-[22px] text-white">{usd(plan.savedTotal)}</span> saved in {plan.runs} run{plan.runs === 1 ? "" : "s"}
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-[12.5px] text-[#a1a1a6]">
              <Calendar className="h-3.5 w-3.5" />
              {plan.isActive ? `Next: ${new Date(`${plan.nextRun}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "Paused"}
            </p>
            {plan.lastStatus && <p className="mt-1 text-[12px] text-[#6e6e73]">{plan.lastStatus}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={() => onToggle?.(plan)} className="hr-focus inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-white text-[13px] font-medium text-black">
                {plan.isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {plan.isActive ? "Pause" : "Resume"}
              </button>
              <button onClick={() => onDelete?.(plan)} aria-label={`Stop ${plan.name}`} className="hr-focus inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-4 text-[13px]">
                <Trash2 className="h-3.5 w-3.5" />Stop
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
