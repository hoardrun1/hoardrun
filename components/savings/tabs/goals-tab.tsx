"use client"

import { Calendar, Plus, Repeat } from "lucide-react"
import { TargetGraphic } from "@/components/app/home-graphics"
import { SavingsEmpty, SavingsEmptyButton } from "@/components/savings/savings-empty"

interface GoalsTabProps {
  goals: any[]
  onNewGoal: () => void
  onAddMoney?: (goal: any) => void
  onEdit?: (goal: any) => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const TONES = ["52 211 153", "77 148 255", "56 189 248", "251 191 36", "251 113 133", "147 197 253"]

/** Progress as a ring, like a pot filling up. */
function GoalRing({ progress, tone }: { progress: number; tone: string }) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const share = Math.min(Math.max(progress, 0), 100) / 100
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0" aria-hidden="true">
      <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
      <circle cx="32" cy="32" r={radius} fill="none" stroke={`rgb(${tone})`} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${circumference * share} ${circumference}`} transform="rotate(-90 32 32)" style={{ filter: `drop-shadow(0 0 6px rgb(${tone} / 0.6))` }} />
      <text x="32" y="36" textAnchor="middle" fill="#fff" style={{ font: "600 12px var(--font-display), sans-serif" }}>{Math.round(share * 100)}%</text>
    </svg>
  )
}

export function GoalsTab({ goals, onNewGoal, onAddMoney, onEdit }: GoalsTabProps) {
  if (goals.length === 0) {
    return (
      <SavingsEmpty
        graphic={<TargetGraphic tone="mint" className="h-full w-full" />}
        title="No savings goals yet"
        text="Set a target, pick a monthly amount and watch it fill up."
        action={<SavingsEmptyButton onClick={onNewGoal}><Plus className="h-4 w-4" strokeWidth={2.4} />Create goal</SavingsEmptyButton>}
      />
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal, index) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100
        const remaining = goal.targetAmount - goal.currentAmount
        const monthsLeft = goal.monthlyContribution > 0 ? Math.ceil(Math.max(remaining, 0) / goal.monthlyContribution) : null
        const tone = TONES[index % TONES.length]

        return (
          <article key={goal.id} className="hr-goal" style={{ ["--tone" as string]: tone }}>
            <div className="flex items-start gap-3">
              <GoalRing progress={progress} tone={tone} />
              <div className="min-w-0 flex-1">
                <h3 className="hr-card-title truncate text-[18px]">{goal.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px]">
                  <span className="rounded-full px-2 py-0.5" style={{ background: `rgb(${tone} / 0.16)`, color: `rgb(${tone})` }}>{goal.category}</span>
                  <span className="text-[#8e8e93]">{formatCurrency(goal.monthlyContribution)}/mo</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-[#a1a1a6]">
              <span className="hr-figure text-[22px] text-white">{formatCurrency(goal.currentAmount)}</span> of {formatCurrency(goal.targetAmount)}
            </p>
            <div className="mt-3 flex items-center justify-between text-[12.5px] text-[#a1a1a6]">
              <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              <span>{goal.isCompleted ? "Reached" : monthsLeft === null ? "No monthly plan" : `${monthsLeft}mo left`}</span>
              {goal.isAutoSave && <span className="inline-flex items-center gap-1" style={{ color: `rgb(${tone})` }}><Repeat className="h-3.5 w-3.5" />Auto</span>}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => onAddMoney?.(goal)} className="hr-focus h-9 flex-1 rounded-full bg-white text-[13px] font-medium text-black">{goal.isCompleted ? "Manage money" : "Add"}</button>
              <button onClick={() => onEdit?.(goal)} className="hr-focus h-9 rounded-full border border-white/15 px-4 text-[13px]">Edit</button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
