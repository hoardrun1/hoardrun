"use client"

import { Calendar, Repeat, Shield, TrendingUp } from "lucide-react"
import { ShieldGraphic } from "@/components/app/home-graphics"
import { SavingsEmpty, SavingsEmptyButton } from "@/components/savings/savings-empty"

interface FixedDepositsTabProps {
  deposits: any[]
  onNewDeposit: () => void
  onBreak?: (deposit: any) => void
}

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
const day = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

const STATUS: Record<string, { label: string; tone: string }> = {
  active: { label: "Earning", tone: "56 189 248" },
  matured: { label: "Paid out", tone: "52 211 153" },
  broken: { label: "Closed early", tone: "142 142 147" },
}

/** Fixed deposits held on the server: locked cash earning a fixed rate until maturity. */
export function FixedDepositsTab({ deposits, onNewDeposit, onBreak }: FixedDepositsTabProps) {
  if (deposits.length === 0) {
    return (
      <SavingsEmpty
        graphic={<ShieldGraphic tone="sky" className="h-full w-full" />}
        title="No fixed deposits yet"
        text="Lock money away for a set term and earn a fixed rate."
        action={<SavingsEmptyButton onClick={onNewDeposit}><Shield className="h-4 w-4" strokeWidth={2.2} />Create fixed deposit</SavingsEmptyButton>}
      />
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {deposits.map((fd) => {
        const status = STATUS[fd.status] ?? STATUS.active
        const start = new Date(`${fd.startDate}T00:00:00`).getTime()
        const end = new Date(`${fd.maturityDate}T00:00:00`).getTime()
        const elapsed = fd.status === "active" ? Math.min(Math.max((Date.now() - start) / (end - start), 0), 1) : 1
        return (
          <article key={fd.id} className="hr-goal" style={{ ["--tone" as string]: status.tone }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12.5px] text-[#a1a1a6]">{fd.term} months at {fd.rate}%</p>
                <p className="hr-figure mt-0.5 text-[26px]">{usd(fd.amount)}</p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: `rgb(${status.tone} / 0.16)`, color: `rgb(${status.tone})` }}>
                {status.label}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${elapsed * 100}%`, background: `rgb(${status.tone})` }} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12.5px] text-[#a1a1a6]">
              <span className="inline-flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />+{usd(fd.interest)} interest</span>
              <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{day(fd.maturityDate)}</span>
              <span>At maturity: <span className="text-white">{usd(fd.maturityAmount)}</span></span>
              {fd.autoRenew && <span className="inline-flex items-center gap-1"><Repeat className="h-3.5 w-3.5" />Auto-renews</span>}
            </div>
            {fd.status === "active" && onBreak && (
              <button onClick={() => onBreak(fd)} className="hr-focus mt-4 h-9 w-full rounded-full border border-white/15 text-[13px]">
                Close early
              </button>
            )}
          </article>
        )
      })}
    </div>
  )
}
