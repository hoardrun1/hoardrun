"use client"

import { useEffect, useRef } from "react"
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Zap } from "lucide-react"
import { LogoMark } from "./graphics"

const CHART =
  "M0 74 C 22 70, 34 58, 54 60 S 84 72, 104 50 S 138 44, 158 32 S 198 30, 236 8"

const ACTIVITY = [
  { name: "Salary", detail: "Today, 09:41", amount: "+$4,200.00", icon: ArrowDownLeft, positive: true },
  { name: "Savings goal", detail: "Automatic", amount: "−$350.00", icon: PiggyBank, positive: false },
  { name: "Transfer to Ama", detail: "Yesterday", amount: "−$120.00", icon: ArrowUpRight, positive: false },
]

function Phone() {
  return (
    <div className="relative h-[560px] w-[272px] rounded-[46px] bg-gradient-to-br from-[#d1d1d6] via-[#48484a] to-[#8e8e93] p-[2px] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.95),0_0_90px_-10px_rgba(255,255,255,0.28)]">
      <div className="h-full w-full overflow-hidden rounded-[44px] bg-black p-[8px]">
        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#000] text-white">
          <div className="absolute left-1/2 top-2.5 h-6 w-20 -translate-x-1/2 rounded-full bg-[#1c1c1e]" />
          <div className="flex items-center justify-between px-5 pt-3 text-[11px] font-medium">
            <span>9:41</span>
            <span className="h-2.5 w-5 rounded-[3px] border border-current" />
          </div>

          <div className="px-5 pt-7">
            <p className="text-[11px] text-[#a1a1a6]">Total balance</p>
            <p className="mt-1 text-[32px] font-semibold leading-none tabular-nums tracking-tight">$48,250.00</p>
            <p className="mt-2 text-[11px] font-medium text-[#d1d1d6]">↑ 12.4% this year</p>
          </div>

          <svg viewBox="0 0 236 92" className="mt-3 w-full" aria-hidden="true">
            <defs>
              <linearGradient id="lp-phone-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${CHART} V92 H0 Z`} fill="url(#lp-phone-area)" />
            <path d={CHART} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.7))" }} />
            <circle cx="234" cy="9" r="3.5" fill="#ffffff" />
          </svg>

          <div className="mx-4 mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-medium">
            {["Send", "Save", "Invest"].map((label, i) => (
              <div key={label} className={`rounded-full py-2 ${i === 0 ? "bg-white text-black" : "bg-[#1c1c1e] text-white"}`}>
                {label}
              </div>
            ))}
          </div>

          <div className="mx-4 mt-3 rounded-2xl bg-[#1c1c1e] px-3 py-1">
            {ACTIVITY.map(({ name, detail, amount, icon: Icon, positive }) => (
              <div key={name} className="flex items-center gap-2.5 border-b border-white/10 py-2.5 last:border-0">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#2c2c2e] text-white">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-medium">{name}</span>
                  <span className="block text-[9px] text-[#a1a1a6]">{detail}</span>
                </span>
                <span className={`text-[11px] font-medium tabular-nums ${positive ? "text-white" : "text-[#a1a1a6]"}`}>{amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DebitCard({ name, showBrand = true }: { name?: string; showBrand?: boolean }) {
  return (
    <div className="relative aspect-[1.586] w-[370px] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#3a3a3c] via-[#0a0a0b] to-[#2c2c2e] shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_-1px_0_rgba(0,0,0,0.7)_inset,0_50px_80px_-15px_rgba(0,0,0,0.95),0_0_60px_-14px_rgba(255,255,255,0.35)]">
      <svg viewBox="0 0 370 233" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <ellipse
            key={i}
            cx="330"
            cy="30"
            rx={40 + i * 17}
            ry={22 + i * 11}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.3 - i * 0.01}
            strokeWidth="0.6"
            transform={`rotate(${i * 2} 330 30)`}
          />
        ))}
      </svg>
      <div className="lp-card-sheen absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          {showBrand ? (
            <span className="flex items-center gap-2 text-sm font-medium tracking-wide text-white">
              <LogoMark className="h-6" />
              Hoardrun
            </span>
          ) : <span />}
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#a1a1a6]">Debit</span>
        </div>
        <div className="h-9 w-12 rounded-md bg-gradient-to-br from-[#f5f5f7] via-[#aeaeb2] to-[#636366] shadow-inner">
          <div className="grid h-full grid-cols-3 grid-rows-3 gap-px p-1 opacity-50">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="rounded-[1px] border border-black/40" />
            ))}
          </div>
        </div>
        <div className="flex items-end justify-between text-white">
          <div>
            <p className="text-[15px] tabular-nums tracking-[0.16em]">•••• •••• •••• 4821</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#a1a1a6]">{name || "Your name"}</p>
          </div>
          <p className="text-[11px] tabular-nums text-[#a1a1a6]">09/30</p>
        </div>
      </div>
    </div>
  )
}

function GoalChip() {
  const progress = 0.72
  const circumference = 2 * Math.PI * 18
  return (
    <div className="flex w-[190px] items-center gap-3 rounded-2xl border border-white/15 bg-[#1c1c1e]/90 backdrop-blur-xl p-3 shadow-2xl">
      <svg viewBox="0 0 44 44" className="h-11 w-11 flex-none -rotate-90" aria-hidden="true">
        <circle cx="22" cy="22" r="18" fill="none" stroke="#3a3a3c" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <div>
        <p className="text-[11px] text-[#a1a1a6]">Savings goal</p>
        <p className="text-base font-medium tabular-nums text-white">72%</p>
      </div>
    </div>
  )
}

function TransferChip() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[#1c1c1e]/90 backdrop-blur-xl py-3 pl-3 pr-5 shadow-2xl">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffffff] text-[#1d1d1f]">
        <Zap className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-medium tabular-nums text-white">+$2,400.00</p>
        <p className="text-[11px] tabular-nums text-[#a1a1a6]">Received in 84 ms</p>
      </div>
    </div>
  )
}

/** Illustrative product mockup: the card, phone and chips respond to the pointer. */
export function ProductStage({ showBrand = true }: { showBrand?: boolean }) {
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = stage.current
    if (!el || !window.matchMedia("(hover: hover)").matches) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--rx", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3))
        el.style.setProperty("--ry", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3))
      })
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
    }
  }, [])

  return (
    <div
      ref={stage}
      role="img"
      aria-label="Hoardrun mobile app showing an account balance, next to a Hoardrun debit card"
      className="lp-stage relative mx-auto h-[385px] w-[350px] sm:h-[527px] sm:w-[480px] lg:h-[620px] lg:w-[565px]"
    >
      <div className="absolute left-1/2 top-0 h-[620px] w-[565px] origin-top -translate-x-1/2 scale-[0.62] sm:scale-[0.85] lg:scale-100">
        <div className="lp-tilt relative h-full w-full">
          <div className="lp-float-a absolute right-[60px] top-0" style={{ transform: "translateZ(30px)" }}>
            <Phone />
          </div>
          <div className="lp-float-b absolute bottom-[34px] left-0" style={{ transform: "translateZ(90px) rotateZ(-7deg)" }}>
            <DebitCard showBrand={showBrand} />
          </div>
          <div className="lp-float-c absolute left-[46px] top-[84px]" style={{ transform: "translateZ(120px)" }}>
            <TransferChip />
          </div>
          <div className="lp-float-a absolute right-0 top-[300px]" style={{ transform: "translateZ(140px)" }}>
            <GoalChip />
          </div>
        </div>
      </div>
    </div>
  )
}
