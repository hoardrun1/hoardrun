"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Repeat, Shield, TrendingUp } from "lucide-react"
import { BarsGraphic, TargetGraphic, VaultGraphic } from "@/components/app/home-graphics"

interface AnalyticsCardsProps {
  analytics: {
    totalSavings: number
    monthlyGrowth: number
    nextMilestone: number
    projectedSavings: number
  }
  isLoading: boolean
  onNewGoal?: () => void
  onFixedDeposit?: () => void
  onAutoSave?: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

/** Monzo-pots style hero: the total, how it's growing, and the three ways to save, then the other figures as small tiles. */
export function AnalyticsCards({ analytics, isLoading, onNewGoal, onFixedDeposit, onAutoSave }: AnalyticsCardsProps) {
  const [whole, cents] = formatCurrency(analytics.totalSavings).split(".")
  const tiles = [
    { title: "Monthly growth", value: analytics.monthlyGrowth, Graphic: BarsGraphic, tone: "mint" as const },
    { title: "Next milestone", value: analytics.nextMilestone, Graphic: TargetGraphic, tone: "amber" as const },
    { title: "Projected savings", value: analytics.projectedSavings, Graphic: VaultGraphic, tone: "sky" as const },
  ]
  const actions = [
    { label: "New goal", icon: Plus, onClick: onNewGoal, tone: "mint", primary: true },
    { label: "Fixed deposit", icon: Shield, onClick: onFixedDeposit, tone: "sky" },
    { label: "Auto-save", icon: Repeat, onClick: onAutoSave, tone: "violet" },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <section className="hr-savings-hero">
        <VaultGraphic tone="mint" className="hr-savings-hero-art" />
        <div className="relative">
          <p className="text-[13px] text-[#a1a1a6]">Total savings</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-12 w-48" />
          ) : (
            <p className="hr-figure mt-1 text-[48px] leading-none sm:text-[56px]">
              {whole}<span className="text-[0.45em] text-[#a1a1a6]">.{cents}</span>
            </p>
          )}
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[rgb(52_211_153/0.14)] px-3 py-1 text-[12.5px] text-[#6ee7b7]">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.2} />
            {isLoading ? "…" : `${formatCurrency(analytics.monthlyGrowth)} this month`}
          </p>
        </div>
        <div className="relative mt-6 flex gap-3 sm:gap-5">
          {actions.map(({ label, icon: Icon, onClick, tone, primary }) => (
            <button key={label} onClick={onClick} className="hr-save-action hr-focus" data-tone={tone} data-primary={primary ? "true" : undefined}>
              <span className="hr-save-action-icon"><Icon className="h-5 w-5" strokeWidth={2.2} /></span>
              {label}
            </button>
          ))}
        </div>
      </section>

      <ul className="grid grid-cols-3 gap-3 lg:grid-cols-1">
        {tiles.map(({ title, value, Graphic, tone }) => (
          <li key={title} className="hr-save-tile" data-tone={tone}>
            <Graphic tone={tone} className="hr-save-tile-art" />
            <span className="relative block text-[12.5px] text-[#a1a1a6]">{title}</span>
            {isLoading ? <Skeleton className="relative mt-1 h-6 w-20" /> : <span className="hr-figure relative mt-0.5 block truncate text-[19px] sm:text-[22px]">{formatCurrency(value)}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
