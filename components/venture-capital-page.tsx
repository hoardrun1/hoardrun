'use client'

import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Check, Globe, MapPin, Minus, Plus, Search, Trash2, Wallet } from 'lucide-react'
import { CoinsGraphic, RocketGraphic } from '@/components/app/home-graphics'
import { Sheet, SheetHeader } from '@/components/investment-opportunities-page'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'

type Stage = 'pre-seed' | 'seed' | 'series-a' | 'growth'

interface Fund {
  id: string
  firm_name: string
  fund_name: string
  thesis: string
  about?: string | null
  sectors: string[]
  stage: Stage
  location?: string | null
  website?: string | null
  share_price: number
  total_shares: number
  min_shares: number
  shares_sold: number
  shares_left: number
  target_size: number
  amount_raised: number
  term_years: number
  management_fee: number
  carry: number
  closes_on?: string | null
  is_open: boolean
  created_at: string
  is_manager: boolean
  my_shares: number
}

interface Receipt {
  reference: string
  shares: number
  amount: number
  purchased_at: string
  fund: Fund
}

const STAGES: { value: Stage; label: string }[] = [
  { value: 'pre-seed', label: 'Pre-seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series-a', label: 'Series A' },
  { value: 'growth', label: 'Growth' },
]
const SECTORS = ['Fintech', 'AI', 'Health', 'Climate', 'Consumer', 'Logistics', 'Education', 'Enterprise', 'Agritech', 'Deep tech']

const money = (value: number, compact = false) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: compact ? 1 : 2, minimumFractionDigits: compact ? 0 : 2, notation: compact ? 'compact' : 'standard' }).format(value)
const stageLabel = (stage: Stage) => STAGES.find((item) => item.value === stage)?.label ?? stage
const percent = (value: number) => `${value < 1 ? value.toFixed(2) : value.toFixed(1)}%`
const errorText = (error: unknown) => (typeof error === 'string' ? error : 'Something went wrong. Please try again.')

// Pearl finishes for fund emblems: light, mid, deep, rim
const PEARLS = [
  ['#eef0ff', '#8cc8ff', '#123a8a', '#c7c8ff'],
  ['#e9fff6', '#6ee7b7', '#065f46', '#a7f3d0'],
  ['#e6f7ff', '#7dd3fc', '#075985', '#bae6fd'],
  ['#fffaeb', '#fcd34d', '#92400e', '#fde68a'],
  ['#fff1f3', '#fda4af', '#9f1239', '#fecdd3'],
  ['#faf5ff', '#d8b4fe', '#6b21a8', '#e9d5ff'],
]

/** A chrome emblem drawn from the fund's name, so every fund has its own mark. */
export function FundEmblem({ seed, size = 64 }: { seed: string; size?: number }) {
  const uid = useId().replace(/:/g, '')
  const shape = useMemo(() => {
    let hash = 2166136261
    for (let index = 0; index < seed.length; index++) hash = Math.imul(hash ^ seed.charCodeAt(index), 16777619)
    const next = () => {
      hash = Math.imul(hash ^ (hash >>> 15), 2246822507)
      hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
      return ((hash ^= hash >>> 16) >>> 0) / 4294967296
    }
    const orbits = Array.from({ length: 2 + Math.floor(next() * 2) }, (_, index) => ({
      rx: 30 - index * 6 - next() * 3,
      ry: 9 + next() * 9,
      tilt: Math.round(next() * 180),
      moon: next() * Math.PI * 2,
    }))
    return { orbits, glint: 20 + next() * 20, hue: Math.floor(next() * PEARLS.length) }
  }, [seed])
  const initials = seed.trim().split(/\s+/).filter((word) => /^[a-z]/i.test(word)).slice(0, 2).map((word) => word[0]).join('').toUpperCase()

  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className="shrink-0 drop-shadow-[0_10px_18px_rgba(0,0,0,0.75)]" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-disc`} cx="0.32" cy="0.26" r="0.9">
          {PEARLS[shape.hue].map((color, index) => <stop key={index} offset={[0, 0.38, 0.78, 1][index]} stopColor={color} />)}
        </radialGradient>
        <radialGradient id={`${uid}-core`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#3a3a3c" />
          <stop offset="1" stopColor="#0b0b0c" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill={`url(#${uid}-disc)`} />
      <circle cx="40" cy="40" r="37.3" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.8" />
      {shape.orbits.map((orbit, index) => {
        const x = 40 + orbit.rx * Math.cos(orbit.moon)
        const y = 40 + orbit.ry * Math.sin(orbit.moon)
        return (
          <g key={index} transform={`rotate(${orbit.tilt} 40 40)`}>
            <ellipse cx="40" cy="40" rx={orbit.rx} ry={orbit.ry} fill="none" stroke="#1c1c1e" strokeOpacity="0.8" strokeWidth="1.8" />
            <circle cx={x} cy={y} r={2.6 + index * 0.6} fill="#fff" stroke="#1c1c1e" strokeOpacity="0.5" strokeWidth="0.6" />
          </g>
        )
      })}
      <circle cx="40" cy="40" r="13" fill={`url(#${uid}-core)`} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" />
      <text x="40" y="44.5" textAnchor="middle" fill="#fff" style={{ font: '600 12px var(--font-display), sans-serif', letterSpacing: '-0.03em' }}>{initials}</text>
      <ellipse cx={shape.glint} cy="16" rx="10" ry="4" fill="#fff" opacity="0.5" transform={`rotate(-30 ${shape.glint} 16)`} />
    </svg>
  )
}

/** Shares sold as liquid filling a glass capsule. */
function FillCapsule({ sold, total }: { sold: number; total: number }) {
  const share = total > 0 ? sold / total : 0
  return (
    <div className="hr-capsule" role="img" aria-label={`${Math.round(share * 100)}% of shares sold`}>
      <motion.div className="hr-capsule-fill" initial={{ width: 0 }} animate={{ width: `${Math.max(share * 100, sold > 0 ? 3 : 0)}%` }} transition={{ type: 'spring', stiffness: 80, damping: 20 }} />
    </div>
  )
}

function FundCard({ fund, onOpen }: { fund: Fund; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="hr-company hr-focus text-left">
      <span className="hr-company-glow" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3">
        <FundEmblem seed={fund.fund_name} />
        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] text-[#c7c7cc]">{stageLabel(fund.stage)}</span>
          {fund.my_shares > 0 && <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-black">You own {fund.my_shares.toLocaleString()}</span>}
          {fund.is_manager && <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] text-[#c7c7cc]">Your fund</span>}
        </div>
      </div>
      <p className="relative mt-4 text-[12px] font-medium uppercase tracking-[0.08em] text-[#8e8e93]">{fund.firm_name}</p>
      <h3 className="hr-card-title relative mt-0.5 truncate text-[21px]">{fund.fund_name}</h3>
      <p className="relative mt-2 line-clamp-2 text-[14px] leading-snug text-[#d1d1d6]">{fund.thesis}</p>
      <div className="relative mt-3 flex flex-wrap gap-1.5">
        {fund.sectors.map((sector) => <span key={sector} className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[11.5px] text-[#d1d1d6]">{sector}</span>)}
      </div>
      <dl className="relative mt-5 grid grid-cols-3 gap-3">
        <div><dt className="text-[12px] text-[#8e8e93]">Per share</dt><dd className="hr-figure text-[18px]">{money(fund.share_price, fund.share_price >= 1000)}</dd></div>
        <div><dt className="text-[12px] text-[#8e8e93]">Fund size</dt><dd className="hr-figure text-[18px]">{money(fund.target_size, true)}</dd></div>
        <div><dt className="text-[12px] text-[#8e8e93]">Term</dt><dd className="hr-figure text-[18px]">{fund.term_years} yrs</dd></div>
      </dl>
      <div className="relative mt-5">
        <FillCapsule sold={fund.shares_sold} total={fund.total_shares} />
        <div className="mt-2 flex justify-between text-[12px] tabular-nums text-[#8e8e93]">
          <span><span className="text-white">{fund.shares_left.toLocaleString()}</span> of {fund.total_shares.toLocaleString()} shares left</span>
          <span>{fund.is_open ? (fund.closes_on ? `Closes ${new Date(fund.closes_on).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Open') : 'Closed'}</span>
        </div>
      </div>
    </button>
  )
}

function Certificate({ receipt, holder }: { receipt: Receipt; holder: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 40, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      className="hr-certificate"
      style={{ transformPerspective: 900 }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8e8e93]">Share certificate</span>
        <span className="text-[11px] tabular-nums text-[#8e8e93]">{receipt.reference}</span>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <FundEmblem seed={receipt.fund.fund_name} size={72} />
        <div className="min-w-0">
          <p className="text-[12px] text-[#8e8e93]">{receipt.fund.firm_name}</p>
          <p className="hr-card-title truncate text-[22px]">{receipt.fund.fund_name}</p>
        </div>
      </div>
      <p className="mt-5 text-[13px] text-[#a1a1a6]">This confirms that</p>
      <p className="hr-card-title text-[20px]">{holder}</p>
      <p className="mt-1 text-[13px] text-[#a1a1a6]">holds</p>
      <p className="hr-figure text-[44px] leading-none">{receipt.shares.toLocaleString()} <span className="text-[18px] text-[#a1a1a6]">shares</span></p>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-[13px]">
        <div><p className="text-[#8e8e93]">Paid</p><p className="font-medium tabular-nums">{money(receipt.amount)}</p></div>
        <div><p className="text-[#8e8e93]">Date</p><p className="font-medium">{new Date(receipt.purchased_at).toLocaleDateString()}</p></div>
      </div>
    </motion.div>
  )
}

function BuyPanel({ fund, cash, onBought }: { fund: Fund; cash: number; onBought: (receipt: Receipt, cash: number) => void }) {
  const { addToast } = useToast()
  const affordable = Math.floor(cash / fund.share_price)
  const ceiling = Math.max(fund.min_shares, Math.min(fund.shares_left, Math.max(affordable, fund.min_shares)))
  const [shares, setShares] = useState(fund.min_shares)
  const [reviewing, setReviewing] = useState(false)
  const [buying, setBuying] = useState(false)
  const cost = shares * fund.share_price
  const tooMuch = cost > cash + 0.001
  const ownership = ((shares + fund.my_shares) / fund.total_shares) * 100
  const presets = Array.from(new Set([fund.min_shares, fund.min_shares * 5, fund.min_shares * 10, affordable].filter((value) => value >= fund.min_shares && value <= fund.shares_left))).slice(0, 4)

  const setCount = (value: number) => {
    setReviewing(false)
    setShares(Math.min(Math.max(Math.round(value) || fund.min_shares, fund.min_shares), fund.shares_left))
  }

  const buy = async () => {
    setBuying(true)
    const response = await apiClient.buyFundShares(fund.id, shares)
    setBuying(false)
    if (response.error || !response.data?.data) {
      addToast({ title: "Couldn't buy shares", description: errorText(response.error), variant: 'destructive' })
      setReviewing(false)
      return
    }
    const result = response.data.data
    onBought({ reference: result.reference, shares: result.shares, amount: result.amount, purchased_at: result.purchased_at, fund: result.fund }, result.cash_available)
  }

  return (
    <div className="space-y-3">
      <div className="hr-trade-row">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-[#8e8e93]">You get</span>
          <span className="text-[12px] text-[#8e8e93]">{percent(ownership)} of the fund</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <button type="button" onClick={() => setCount(shares - 1)} disabled={shares <= fund.min_shares} className="hr-round hr-focus disabled:opacity-40" aria-label="One share fewer"><Minus className="h-4 w-4" strokeWidth={2.2} /></button>
          <label className="min-w-0 flex-1 text-center">
            <span className="sr-only">Number of shares</span>
            <input type="number" inputMode="numeric" min={fund.min_shares} max={fund.shares_left} value={shares} onChange={(event) => setCount(Number(event.target.value))} className="hr-figure hr-share-input w-full text-center outline-none" />
            <span className="block text-[12px] text-[#8e8e93]">shares at {money(fund.share_price)}</span>
          </label>
          <button type="button" onClick={() => setCount(shares + 1)} disabled={shares >= fund.shares_left} className="hr-round hr-focus disabled:opacity-40" aria-label="One share more"><Plus className="h-4 w-4" strokeWidth={2.2} /></button>
        </div>
        <input type="range" min={fund.min_shares} max={ceiling} value={Math.min(shares, ceiling)} onChange={(event) => setCount(Number(event.target.value))} className="hr-range mt-4 w-full" aria-label="Choose how many shares" />
        {presets.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {presets.map((value) => (
              <button key={value} type="button" onClick={() => setCount(value)} className="hr-focus rounded-full border border-white/12 px-3 py-1 text-[12px] text-[#d1d1d6] hover:border-white/30" data-active={value === shares}>
                {value === affordable && value !== fund.min_shares ? `Max ${value.toLocaleString()}` : value.toLocaleString()}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hr-trade-row" data-warn={tooMuch}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-[#8e8e93]">You pay</span>
          <span className={`text-[12px] ${tooMuch ? 'text-[#ff9f95]' : 'text-[#8e8e93]'}`}>{tooMuch ? 'More than your cash' : 'From Hoardrun cash'}</span>
        </div>
        <div className="mt-1 flex items-end justify-between gap-3">
          <span className="hr-figure text-[32px] leading-tight">{money(cost)}</span>
          <span className="inline-flex items-center gap-1.5 pb-1 text-[12px] text-[#8e8e93]"><Wallet className="h-3.5 w-3.5" strokeWidth={2} />{money(cash)}</span>
        </div>
      </div>

      {tooMuch ? (
        <p className="text-center text-[13px] text-[#a1a1a6]">Add money to your Hoardrun account to buy {shares === fund.min_shares ? 'these shares' : 'this many shares'}.</p>
      ) : (
        <p className="text-center text-[12px] text-[#8e8e93]">{fund.management_fee}% yearly fee · {fund.carry}% of profits to the manager · locked for {fund.term_years} years</p>
      )}

      {reviewing ? (
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <button onClick={() => setReviewing(false)} className="hr-focus h-12 rounded-full border border-white/15 px-5 text-[15px]">Edit</button>
          <button onClick={buy} disabled={buying} className="hr-focus h-12 rounded-full bg-white text-[15px] font-medium text-black disabled:opacity-60">
            {buying ? 'Buying…' : `Confirm · ${money(cost)}`}
          </button>
        </div>
      ) : (
        <button onClick={() => setReviewing(true)} disabled={tooMuch} className="hr-focus h-12 w-full rounded-full bg-white text-[15px] font-medium text-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#8e8e93]">
          Review {shares.toLocaleString()} {shares === 1 ? 'share' : 'shares'}
        </button>
      )}
    </div>
  )
}

function FundDetails({ fund, cash, holder, onBought, onRemove, removing }: { fund: Fund; cash: number; holder: string; onBought: (receipt: Receipt, cash: number) => void; onRemove: () => void; removing: boolean }) {
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const facts = [
    { label: 'Price per share', value: money(fund.share_price) },
    { label: 'Fund size', value: money(fund.target_size) },
    { label: 'Shares left', value: `${fund.shares_left.toLocaleString()} of ${fund.total_shares.toLocaleString()}` },
    { label: 'Smallest purchase', value: `${fund.min_shares.toLocaleString()} ${fund.min_shares === 1 ? 'share' : 'shares'}` },
    { label: 'Stage', value: stageLabel(fund.stage) },
    { label: 'Term', value: `${fund.term_years} years` },
    { label: 'Fees', value: `${fund.management_fee}% a year · ${fund.carry}% carry` },
    { label: 'Closes', value: fund.closes_on ? new Date(fund.closes_on).toLocaleDateString() : 'When sold out' },
  ]

  if (receipt) {
    return (
      <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8">
        <Certificate receipt={receipt} holder={holder} />
        <p className="text-center text-[13px] text-[#a1a1a6]">{money(receipt.amount)} has left your Hoardrun cash. You now hold {receipt.fund.my_shares.toLocaleString()} shares in this fund.</p>
        <button onClick={() => setReceipt(null)} className="hr-focus h-12 w-full rounded-full border border-white/15 text-[15px]">Back to fund</button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-8">
      <div className="flex items-center gap-4">
        <FundEmblem seed={fund.fund_name} size={76} />
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8e8e93]">{fund.firm_name}</p>
          <p className="hr-card-title text-[26px]">{fund.fund_name}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[#8e8e93]">
            {fund.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" strokeWidth={1.8} />{fund.location}</span>}
            {fund.website && (
              <a href={fund.website} target="_blank" rel="noopener noreferrer" className="hr-focus inline-flex items-center gap-1 rounded text-[#c7c7cc] hover:text-white">
                <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />{fund.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}<ArrowUpRight className="h-3 w-3" strokeWidth={2} />
              </a>
            )}
          </div>
        </div>
      </div>
      <p className="mt-5 text-[16px] leading-snug">{fund.thesis}</p>
      {fund.about && <p className="hr-sub mt-3 whitespace-pre-line !text-[#aeaeb2]">{fund.about}</p>}

      <div className="mt-5">
        <FillCapsule sold={fund.shares_sold} total={fund.total_shares} />
        <p className="mt-2 text-[12px] tabular-nums text-[#8e8e93]"><span className="text-white">{money(fund.amount_raised, true)}</span> raised of {money(fund.target_size, true)}</p>
      </div>

      <div className="mt-6">
        {fund.is_manager ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] text-[#a1a1a6]">This is your fund. Investors buy shares here; you can't buy into a fund you manage.</p>
        ) : !fund.is_open ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] text-[#a1a1a6]">This fund isn't selling shares any more.</p>
        ) : (
          <BuyPanel key={fund.id + fund.shares_left} fund={fund} cash={cash} onBought={(next, nextCash) => { setReceipt(next); onBought(next, nextCash) }} />
        )}
      </div>

      <dl className="mt-6 divide-y divide-white/[0.07] rounded-[20px] border border-white/[0.08]">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-[14px] text-[#8e8e93]">{fact.label}</dt>
            <dd className="text-right text-[14.5px] font-medium tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[12px] leading-relaxed text-[#8e8e93]">
        The fund's details come from its manager and haven't been checked by Hoardrun. Venture funds are high risk: you could lose everything you put in, and you can't sell your shares before the term ends.
      </p>
      {fund.is_manager && fund.shares_sold === 0 && (
        <button onClick={onRemove} disabled={removing} className="hr-focus mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 text-[14px] text-[#c7c7cc] hover:text-white disabled:opacity-50">
          <Trash2 className="h-4 w-4" strokeWidth={1.8} />{removing ? 'Removing…' : 'Remove fund'}
        </button>
      )}
    </div>
  )
}

const EMPTY_FORM = {
  firm_name: '', fund_name: '', thesis: '', about: '', location: '', website: '',
  share_price: '100', total_shares: '', min_shares: '1', term_years: '8', management_fee: '2', carry: '20', closes_on: '',
}

function RegisterFundForm({ onCreated }: { onCreated: (fund: Fund) => void }) {
  const { addToast } = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [sectors, setSectors] = useState<string[]>([])
  const [stage, setStage] = useState<Stage>('seed')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const set = (key: keyof typeof EMPTY_FORM) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const size = (Number(form.share_price) || 0) * (Number(form.total_shares) || 0)

  const toggleSector = (sector: string) =>
    setSectors((current) => (current.includes(sector) ? current.filter((item) => item !== sector) : current.length < 3 ? [...current, sector] : current))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!sectors.length) {
      setError('Pick at least one sector')
      return
    }
    setError(null)
    setSaving(true)
    const body: Record<string, unknown> = {
      ...form, sectors, stage,
      total_shares: Number(form.total_shares), min_shares: Number(form.min_shares), term_years: Number(form.term_years),
    }
    Object.keys(body).forEach((key) => body[key] === '' && delete body[key])
    const response = await apiClient.createVentureFund(body)
    setSaving(false)
    if (response.error || !response.data?.data) {
      setError(errorText(response.error))
      return
    }
    addToast({ title: 'Fund registered', description: `${response.data.data.fund_name} is open for investors.` })
    onCreated(response.data.data)
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-6">
        <div className="flex items-center gap-4 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-4">
          <FundEmblem seed={form.fund_name || 'New Fund'} size={56} />
          <p className="text-[13px] leading-snug text-[#a1a1a6]">Your fund's emblem is drawn from its name. Split the fund into equal shares and investors buy as many as they like.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Firm</span><input required minLength={2} maxLength={80} value={form.firm_name} onChange={set('firm_name')} className="hr-field" placeholder="Harbor Ventures" /></label>
          <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Fund name</span><input required minLength={2} maxLength={80} value={form.fund_name} onChange={set('fund_name')} className="hr-field" placeholder="Seed Fund I" /></label>
        </div>
        <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">What the fund backs</span><input required minLength={10} maxLength={160} value={form.thesis} onChange={set('thesis')} className="hr-field" placeholder="Seed rounds in African fintech and logistics" /></label>
        <div>
          <span className="mb-1.5 flex justify-between text-[13px] font-medium text-[#c7c7cc]">Sectors <span className="font-normal text-[#8e8e93]">Up to 3</span></span>
          <div className="flex flex-wrap gap-1.5">
            {SECTORS.map((sector) => (
              <button key={sector} type="button" role="checkbox" aria-checked={sectors.includes(sector)} onClick={() => toggleSector(sector)} className="hr-chip hr-focus !min-h-9 !rounded-full !px-3 !text-[13px]">{sector}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Stage</span>
          <div className="hr-choice" role="radiogroup" aria-label="Stage">
            {STAGES.map((item) => <button key={item.value} type="button" role="radio" aria-checked={stage === item.value} onClick={() => setStage(item.value)} className="hr-focus">{item.label}</button>)}
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div className="grid grid-cols-3 gap-3">
          <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Price / share</span><input required type="number" min={1} step="0.01" value={form.share_price} onChange={set('share_price')} className="hr-field" /></label>
          <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Shares</span><input required type="number" min={10} step={1} value={form.total_shares} onChange={set('total_shares')} className="hr-field" placeholder="10000" /></label>
          <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Min buy</span><input required type="number" min={1} step={1} value={form.min_shares} onChange={set('min_shares')} className="hr-field" /></label>
        </div>
        <div className="hr-metric !flex-row items-baseline justify-between">
          <span className="text-[13px] text-[#8e8e93]">Fund size</span>
          <span className="hr-figure text-[26px]">{size ? money(size, size >= 100000) : '—'}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Term (yrs)</span><input required type="number" min={1} max={15} value={form.term_years} onChange={set('term_years')} className="hr-field" /></label>
          <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Fee %</span><input required type="number" min={0} max={5} step="0.1" value={form.management_fee} onChange={set('management_fee')} className="hr-field" /></label>
          <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Carry %</span><input required type="number" min={0} max={40} step="0.5" value={form.carry} onChange={set('carry')} className="hr-field" /></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Closes (optional)</span><input type="date" min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} value={form.closes_on} onChange={set('closes_on')} className="hr-field" /></label>
          <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Location</span><input maxLength={80} value={form.location} onChange={set('location')} className="hr-field" placeholder="Lagos, Nigeria" /></label>
        </div>
        <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Website (optional)</span><input maxLength={200} value={form.website} onChange={set('website')} className="hr-field" placeholder="harbor.vc" /></label>
        <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">About (optional)</span><textarea maxLength={4000} rows={3} value={form.about} onChange={set('about')} className="hr-field !h-auto resize-none py-3" placeholder="Track record, team, how you pick companies" /></label>
        {error && <p role="alert" className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-[14px]">{error}</p>}
      </div>
      <div className="border-t border-white/[0.08] px-5 py-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <button type="submit" disabled={saving} className="hr-focus h-12 w-full rounded-full bg-white text-[15px] font-medium text-black disabled:opacity-60">{saving ? 'Registering…' : 'Register fund'}</button>
      </div>
    </form>
  )
}

export function VentureCapitalPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [funds, setFunds] = useState<Fund[]>([])
  const [cash, setCash] = useState(0)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [removing, setRemoving] = useState(false)
  const selected = funds.find((fund) => fund.id === selectedId) ?? null

  const load = useCallback(async (search: string) => {
    const response = await apiClient.getVentureFunds(search.trim() || undefined)
    if (response.error || !response.data) setFailed(true)
    else {
      setFailed(false)
      setFunds(response.data.data ?? [])
      setCash(Number(response.data.cash_available) || 0)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => load(query), query ? 250 : 0)
    return () => window.clearTimeout(timer)
  }, [load, query])

  const holdings = funds.filter((fund) => fund.my_shares > 0)
  const holdingsValue = holdings.reduce((sum, fund) => sum + fund.my_shares * fund.share_price, 0)

  const onBought = (receipt: Receipt, nextCash: number) => {
    setCash(nextCash)
    setFunds((current) => current.map((fund) => (fund.id === receipt.fund.id ? receipt.fund : fund)))
  }

  const remove = async () => {
    if (!selected) return
    setRemoving(true)
    const response = await apiClient.deleteVentureFund(selected.id)
    setRemoving(false)
    if (response.error) {
      addToast({ title: "Couldn't remove fund", description: errorText(response.error), variant: 'destructive' })
      return
    }
    setFunds((current) => current.filter((fund) => fund.id !== selected.id))
    setSelectedId(null)
    addToast({ title: 'Fund removed', description: `${selected.fund_name} is no longer listed.` })
  }

  return (
    <motion.div className="space-y-5 sm:space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
      <div>
        <Link href="/investment" className="hr-focus -ml-1 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[14px] text-[#a1a1a6] hover:text-white">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />Investments
        </Link>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="hr-title">Venture capital</h1>
            <p className="hr-sub mt-2">Buy shares in venture funds. Each fund backs a basket of startups, like an index for early-stage companies.</p>
          </div>
          <button onClick={() => setRegistering(true)} className="hr-focus hidden h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-medium text-black sm:inline-flex">
            <Plus className="h-4 w-4" strokeWidth={2.4} />Register a fund
          </button>
        </div>
      </div>

      <section className="hr-vc-hero">
        <div className="relative z-[1] min-w-0">
          <p className="text-[13px] text-[#a1a1a6]">{holdings.length ? 'Your venture shares' : 'Hoardrun cash to invest'}</p>
          <p className="hr-figure mt-1 text-[40px] leading-none sm:text-[48px]">{money(holdings.length ? holdingsValue : cash)}</p>
          <p className="mt-2 text-[13px] text-[#a1a1a6]">
            {holdings.length ? `${holdings.reduce((sum, fund) => sum + fund.my_shares, 0).toLocaleString()} shares across ${holdings.length} ${holdings.length === 1 ? 'fund' : 'funds'} · ${money(cash)} cash` : 'Shares are paid for from your Hoardrun cash.'}
          </p>
        </div>
        <div className="hr-vc-orbit" aria-hidden="true">
          {(holdings.length ? holdings : funds).slice(0, 3).map((fund, index) => (
            <span key={fund.id} className="hr-vc-orbit-item" style={{ ['--i' as string]: index }}><FundEmblem seed={fund.fund_name} size={index === 0 ? 72 : 52} /></span>
          ))}
          {!funds.length && <CoinsGraphic className="h-28 w-28" />}
        </div>
      </section>

      <div className="flex gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search funds</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" strokeWidth={2} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search funds or firms" className="hr-field !h-11 !rounded-full !pl-10" />
        </label>
        <button onClick={() => setRegistering(true)} className="hr-round hr-focus !h-11 !w-11 sm:!hidden" aria-label="Register a fund"><Plus className="h-5 w-5" strokeWidth={2} /></button>
      </div>

      {failed ? (
        <div role="alert" className="hr-panel px-5 py-4 text-sm">We couldn't load funds. Please try again in a moment.</div>
      ) : loading ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((key) => <li key={key} className="hr-skeleton h-[340px] !rounded-[24px]" />)}</ul>
      ) : funds.length === 0 ? (
        <section className="hr-promo !min-h-[240px]">
          <RocketGraphic className="hr-promo-art" />
          <div className="relative max-w-[62%] sm:max-w-[68%]">
            <h2 className="hr-card-title text-[24px] sm:text-[28px]">{query ? 'No matches' : 'No venture funds yet'}</h2>
            <p className="hr-sub mt-2 !text-[#aeaeb2]">{query ? `No fund matches “${query.trim()}”.` : 'Funds appear here once a venture firm registers one. Run a fund? Open it to investors in a few minutes.'}</p>
            {!query && (
              <button onClick={() => setRegistering(true)} className="hr-focus mt-5 inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-medium text-black">
                <Plus className="h-4 w-4" strokeWidth={2.4} />Register a fund
              </button>
            )}
          </div>
        </section>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {funds.map((fund) => <li key={fund.id} className="min-w-0"><FundCard fund={fund} onOpen={() => setSelectedId(fund.id)} /></li>)}
        </ul>
      )}

      <Sheet open={!!selected} onClose={() => setSelectedId(null)} label="Fund">
        <SheetHeader title="Fund" onClose={() => setSelectedId(null)} />
        {selected && <FundDetails key={selected.id} fund={selected} cash={cash} holder={user?.name || user?.email || 'You'} onBought={onBought} onRemove={remove} removing={removing} />}
      </Sheet>

      <Sheet open={registering} onClose={() => setRegistering(false)} label="Register a fund">
        <SheetHeader title="Register a fund" onClose={() => setRegistering(false)} />
        <RegisterFundForm onCreated={(fund) => { setRegistering(false); setQuery(''); setFunds((current) => [fund, ...current]) }} />
      </Sheet>
    </motion.div>
  )
}
