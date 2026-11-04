"use client"

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react"
import { animate } from "framer-motion"
import type { Tone } from "@/components/app/home-graphics"
import type { LucideIcon } from "lucide-react"

/** Counts up to a figure once it is on screen; the final text is always the exact value. */
export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: 0.9,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (latest) => setShown(latest),
    })
    from.current = value
    return () => controls.stop()
  }, [value])
  return <>{format(shown === value ? value : shown)}</>
}

export const usd = (n: number, digits = 2) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)

type HeroProps = {
  title: string
  subtitle?: string
  tone: Tone
  graphic?: ComponentType<{ className?: string; tone?: Tone }>
  /** A live picture in place of the chrome object, such as a progress ring */
  art?: ReactNode
  /** Optional headline figure under the title, Dime-insights style */
  figure?: ReactNode
  figureLabel?: string
  actions?: ReactNode
  children?: ReactNode
}

/** A page's opening panel: title, the one figure that matters and the page's actions, beside its chrome object. */
export function PageHero({ title, subtitle, tone, graphic: Graphic, art, figure, figureLabel, actions, children }: HeroProps) {
  return (
    <section className="hr-hero hr-rise" data-tone={tone}>
      {art ?? (Graphic && <Graphic tone={tone} className="hr-hero-art" />)}
      <div className="relative">
        <h1 className="hr-title">{title}</h1>
        {subtitle && <p className="hr-sub mt-1.5 max-w-[30ch] sm:max-w-none">{subtitle}</p>}
        {figure !== undefined && (
          <div className="mt-4">
            {figureLabel && <p className="text-[12.5px] text-[#a1a1a6]">{figureLabel}</p>}
            <p className="hr-figure mt-0.5 text-[40px] leading-none sm:text-[48px]">{figure}</p>
          </div>
        )}
        {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
        {children}
      </div>
    </section>
  )
}

export type Stat = {
  label: string
  value: ReactNode
  note?: string
  tone: Tone
  icon: LucideIcon
}

/** Spent against budget as a ring, Copilot-style; the arc grows in when the page opens. */
export function ProgressRing({ value, label, tone = "amber", caption = "used" }: { value: number; label: string; tone?: Tone; caption?: string }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const share = Math.min(Math.max(value, 0), 100) / 100
  const over = value > 100
  return (
    <svg viewBox="0 0 140 140" className="hr-hero-art hr-ring" data-tone={over ? "coral" : tone} role="img" aria-label={label}>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
      <circle cx="70" cy="70" r={radius} fill="none" stroke="rgb(var(--tone))" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${circumference * share} ${circumference}`} transform="rotate(-90 70 70)" className="hr-ring-arc" style={{ ["--len" as string]: `${circumference}` }} />
      <text x="70" y="68" textAnchor="middle" fill="#fff" style={{ font: "600 24px var(--font-display), sans-serif" }}>{Math.round(value)}%</text>
      <text x="70" y="88" textAnchor="middle" fill="#8e8e93" style={{ font: "500 11px var(--font-text), sans-serif" }}>{caption}</text>
    </svg>
  )
}

/** Small tinted chips in place of tall cards: the icon square, a label and the figure. */
export function StatPills({ items }: { items: Stat[] }) {
  return (
    <ul className="hr-stats hr-rise" style={{ animationDelay: "60ms" }}>
      {items.map(({ label, value, note, tone, icon: Icon }) => (
        <li key={label} className="hr-stat" data-tone={tone}>
          <span className="hr-stat-icon"><Icon className="h-[18px] w-[18px]" strokeWidth={2.2} /></span>
          <span className="min-w-0">
            <span className="block truncate text-[12px] text-[#a1a1a6]">{label}</span>
            <span className="hr-figure block truncate text-[19px] leading-tight">{value}</span>
            {note && <span className="block truncate text-[11px] text-[#6e6e73]">{note}</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Header action as a pill; primary is white, the rest are glass. */
export function HeroAction({ onClick, children, primary, disabled }: { onClick?: () => void; children: ReactNode; primary?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="hr-hero-action hr-focus disabled:opacity-60" data-primary={primary ? "true" : undefined}>
      {children}
    </button>
  )
}
