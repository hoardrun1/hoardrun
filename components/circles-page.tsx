'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Bitcoin, Briefcase, Building2, Check, Clock3, Crown, Gem, Landmark, LineChart, Minus, PieChart, Plus,
  Rocket, ShieldCheck, Sparkles, UserPlus, Users, Vote, Wallet, X,
  type LucideIcon,
} from 'lucide-react'
import { OrbsGraphic } from '@/components/app/home-graphics'
import { Sheet, SheetHeader } from '@/components/investment-opportunities-page'
import { FundEmblem } from '@/components/venture-capital-page'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'

interface Member { name: string; is_you: boolean; is_admin?: boolean; contributed: number; invested?: number; share: number }
interface JoinRequest { id: string; name: string; note?: string | null; requested_at: string }
interface Holding { fund_id: string; fund_name: string; firm_name: string; shares: number; amount: number; my_shares: number; my_value: number }
interface Proposal {
  id: string; kind: 'asset' | 'fund'; asset_type: string; asset_label: string; title: string; amount_per_member: number | null
  fund_id?: string | null; fund_name?: string | null; firm_name?: string; shares?: number | null; amount: number; note?: string | null
  status: 'open' | 'passed' | 'rejected' | 'failed'; outcome?: string | null; proposed_by: string
  yes_count: number; no_count: number; member_count: number; votes_needed: number
  voters: { yes: string[]; no: string[] }; my_vote: 'yes' | 'no' | null; my_paid: number; created_at: string
}
interface Circle {
  id: string; name: string; purpose: string; focus?: string | null; focus_label?: string | null; max_members?: number | null; is_full?: boolean
  min_contribution: number; pool_balance: number; total_contributed: number; invested: number; member_count: number; votes_needed?: number
  my_status?: 'member' | 'pending' | null; is_member: boolean; is_creator: boolean; is_admin?: boolean; pending_count?: number
  my_contribution: number; my_share: number; my_invested?: number; open_proposals: number; members: Member[]
  requests?: JoinRequest[]; holdings?: Holding[]; proposals?: Proposal[]; cash_available?: number
}
interface Fund { id: string; fund_name: string; firm_name: string; share_price: number; shares_left: number; min_shares: number; is_open: boolean }

/** What a circle can invest in together, matching the server's list. */
const ASSETS: { value: string; label: string; icon: LucideIcon; tone: string }[] = [
  { value: 'private_equity', label: 'Private equity', icon: Briefcase, tone: '#8b5cf6' },
  { value: 'real_estate', label: 'Real estate', icon: Building2, tone: '#38bdf8' },
  { value: 'fixed_income', label: 'Fixed income', icon: Landmark, tone: '#34d399' },
  { value: 'etfs', label: 'ETFs', icon: PieChart, tone: '#4d94ff' },
  { value: 'stocks', label: 'Stocks', icon: LineChart, tone: '#60a5fa' },
  { value: 'crypto', label: 'Crypto', icon: Bitcoin, tone: '#fbbf24' },
  { value: 'startups', label: 'Startups', icon: Rocket, tone: '#fb7185' },
  { value: 'venture_fund', label: 'Venture fund', icon: Gem, tone: '#a78bfa' },
  { value: 'other', label: 'Other', icon: Sparkles, tone: '#a1a1a6' },
]
const asset = (value?: string | null) => ASSETS.find((item) => item.value === value) ?? ASSETS[ASSETS.length - 1]

const money = (value: number, compact = false) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: compact ? 1 : 2, minimumFractionDigits: compact ? 0 : 2, notation: compact ? 'compact' : 'standard' }).format(value)
const pct = (value: number) => `${(value * 100).toFixed(value > 0 && value < 0.1 ? 1 : 0)}%`
const errorText = (error: unknown) => (typeof error === 'string' ? error : 'Something went wrong. Please try again.')
const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
const needed = (count: number) => Math.max(Math.floor(count / 2) + 1, 2)

/** Members orbit the circle; the person viewing is outlined. */
function Constellation({ members, size = 120, center }: { members: Member[]; size?: number; center?: string }) {
  const uid = useId().replace(/:/g, '')
  const shown = members.slice(0, 8)
  const radius = 38
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="shrink-0 overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-core`} cx="0.34" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#f2f8ff" />
          <stop offset="0.45" stopColor="#9cc9ff" />
          <stop offset="0.85" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#93c5fd" />
        </radialGradient>
        <radialGradient id={`${uid}-node`} cx="0.34" cy="0.28" r="0.9">
          <stop offset="0" stopColor="#eef2ff" />
          <stop offset="0.6" stopColor="#9cc9ff" />
          <stop offset="1" stopColor="#1e3a8a" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#fff" strokeOpacity="0.14" strokeDasharray="2 4" />
      <circle cx="60" cy="60" r={radius + 14} fill="none" stroke="#fff" strokeOpacity="0.06" />
      {shown.map((_, index) => {
        const angle = (index / Math.max(shown.length, 1)) * Math.PI * 2 - (Math.PI * 3) / 4
        return <line key={`l${index}`} x1="60" y1="60" x2={60 + radius * Math.cos(angle)} y2={60 + radius * Math.sin(angle)} stroke="#fff" strokeOpacity={0.14} strokeWidth={1} />
      })}
      <circle cx="60" cy="60" r="20" fill={`url(#${uid}-core)`} />
      <circle cx="60" cy="60" r="19.4" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.8" />
      {center && <text x="60" y="64" textAnchor="middle" fill="#0b0b0c" style={{ font: '600 10.5px var(--font-display), sans-serif', letterSpacing: '-0.03em' }}>{center}</text>}
      {shown.map((member, index) => {
        const angle = (index / Math.max(shown.length, 1)) * Math.PI * 2 - (Math.PI * 3) / 4
        const x = 60 + radius * Math.cos(angle)
        const y = 60 + radius * Math.sin(angle)
        const r = 10
        return (
          <g key={index}>
            <circle cx={x} cy={y} r={r} fill={`url(#${uid}-node)`} stroke={member.is_you ? '#fff' : '#000'} strokeWidth={member.is_you ? 1.6 : 0.8} />
            <text x={x} y={y + 2.6} textAnchor="middle" fill="#0b0b0c" style={{ font: '600 6.5px var(--font-display), sans-serif' }}>{member.is_you ? 'You' : initials(member.name)}</text>
          </g>
        )
      })}
    </svg>
  )
}

function AssetBadge({ value, label, size = 'sm' }: { value?: string | null; label?: string | null; size?: 'sm' | 'lg' }) {
  const item = asset(value)
  const Icon = item.icon
  return (
    <span className={`hr-asset-badge ${size === 'lg' ? 'is-lg' : ''}`} style={{ ['--tone' as string]: item.tone }}>
      <Icon className={size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'} strokeWidth={2.2} />
      {size === 'sm' && (label ?? item.label)}
    </span>
  )
}

/** One dot per member: blue for yes, red for no. The marker shows how many yes votes it needs. */
function VoteDots({ proposal }: { proposal: Proposal }) {
  const total = Math.max(proposal.member_count, 1)
  const dots = Array.from({ length: Math.min(total, 24) }, (_, index) =>
    index < proposal.yes_count ? 'yes' : index >= total - proposal.no_count ? 'no' : 'none',
  )
  return (
    <div>
      <div className="hr-vote-dots" role="img" aria-label={`${proposal.yes_count} yes and ${proposal.no_count} no out of ${total} members. It needs ${proposal.votes_needed} yes votes.`}>
        {dots.map((state, index) => (
          <motion.span key={index} data-state={state} data-line={index === proposal.votes_needed - 1 ? 'true' : undefined}
            initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.03, type: 'spring', stiffness: 260, damping: 18 }} />
        ))}
        {total > 24 && <span className="text-[11px] text-[#8e8e93]">+{total - 24}</span>}
      </div>
      <p className="mt-2 text-[12px] text-[#a1a1a6]">
        <span className="font-semibold text-white">{proposal.yes_count} of {proposal.votes_needed}</span> yes votes needed · {proposal.member_count} {proposal.member_count === 1 ? 'member' : 'members'}
      </p>
    </div>
  )
}

const STATUS: Record<Proposal['status'], string> = { open: 'Voting', passed: 'Invested', rejected: 'Voted down', failed: "Couldn't go ahead" }

function ProposalCard({ proposal, canVote, onVote, busy }: { proposal: Proposal; canVote: boolean; onVote: (choice: 'yes' | 'no') => void; busy: boolean }) {
  const isAsset = proposal.kind === 'asset'
  return (
    <li className="hr-proposal" data-status={proposal.status}>
      <div className="flex items-start gap-3">
        {isAsset ? <AssetBadge value={proposal.asset_type} size="lg" /> : <FundEmblem seed={proposal.fund_name ?? proposal.title} size={44} />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-[15px] font-medium">{isAsset ? proposal.title : `Buy ${(proposal.shares ?? 0).toLocaleString()} shares of ${proposal.fund_name}`}</p>
            <span className="hr-status-chip shrink-0" data-status={proposal.status}>{STATUS[proposal.status]}</span>
          </div>
          <p className="text-[12.5px] text-[#8e8e93]">
            {proposal.asset_label} · {isAsset ? `${money(proposal.amount_per_member ?? 0)} from each person who votes yes` : `${money(proposal.amount)} from the pool`}
          </p>
          <p className="text-[12px] text-[#6e6e73]">Proposed by {proposal.proposed_by}</p>
        </div>
      </div>
      {proposal.note && <p className="mt-3 text-[13.5px] leading-snug text-[#c7c7cc]">“{proposal.note}”</p>}
      <div className="mt-4"><VoteDots proposal={proposal} /></div>
      <div className="mt-2 grid grid-cols-2 gap-3 text-[12px]">
        <div><span className="font-medium text-[#9fd0ff]">Yes · {proposal.yes_count}</span><span className="block truncate text-[#8e8e93]">{proposal.voters.yes.join(', ') || 'No votes yet'}</span></div>
        <div className="text-right"><span className="font-medium text-[#ff9f95]">No · {proposal.no_count}</span><span className="block truncate text-[#8e8e93]">{proposal.voters.no.join(', ') || 'No votes yet'}</span></div>
      </div>
      {proposal.status !== 'open' && proposal.outcome && <p className="mt-3 text-[12.5px] text-[#a1a1a6]">{proposal.outcome}{proposal.my_paid > 0 ? ` · you put in ${money(proposal.my_paid)}` : ''}</p>}
      {proposal.status === 'open' && canVote && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => onVote('yes')} disabled={busy} className="hr-vote-btn hr-focus" data-picked={proposal.my_vote === 'yes'}>
              <Check className="h-4 w-4" strokeWidth={2.4} />I agree
            </button>
            <button onClick={() => onVote('no')} disabled={busy} className="hr-vote-btn hr-focus" data-picked={proposal.my_vote === 'no'}>
              <X className="h-4 w-4" strokeWidth={2.4} />No
            </button>
          </div>
          {isAsset && <p className="mt-2 text-[11.5px] text-[#8e8e93]">If it passes, {money(proposal.amount_per_member ?? 0)} is taken from your Hoardrun cash only if you agreed.</p>}
        </>
      )}
    </li>
  )
}

/** Propose an investment type with an amount each person puts in. */
function ProposeAssetForm({ circle, onDone }: { circle: Circle; onDone: (next: Circle) => void }) {
  const { addToast } = useToast()
  const [type, setType] = useState(circle.focus && circle.focus !== 'venture_fund' ? circle.focus : 'private_equity')
  const [title, setTitle] = useState('')
  const [each, setEach] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const amount = Number(each) || 0
  const cash = circle.cash_available ?? 0
  const people = circle.member_count
  const need = needed(people)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    const response = await apiClient.proposeCircleInvestment(circle.id, { kind: 'asset', asset_type: type, title: title.trim(), amount_per_member: amount, note: note.trim() || undefined })
    setSaving(false)
    if (response.error || !response.data?.data) {
      addToast({ title: "Couldn't propose", description: errorText(response.error), variant: 'destructive' })
      return
    }
    addToast({ title: 'Proposal sent', description: `Your vote counts as yes. It goes ahead once ${need} of ${people} members agree.` })
    onDone(response.data.data as Circle)
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[13px] font-medium text-[#c7c7cc]">Type of investment</p>
      <div className="hr-asset-grid" role="radiogroup" aria-label="Type of investment">
        {ASSETS.filter((item) => item.value !== 'venture_fund').map((item) => {
          const Icon = item.icon
          return (
            <button key={item.value} type="button" role="radio" aria-checked={type === item.value} onClick={() => setType(item.value)} className="hr-focus" style={{ ['--tone' as string]: item.tone }}>
              <Icon className="h-4 w-4" strokeWidth={2.2} />{item.label}
            </button>
          )
        })}
      </div>
      <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">What exactly?</span><input required minLength={3} maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} className="hr-field" placeholder={type === 'real_estate' ? 'Two-bed rental flat in East Legon' : 'Name the investment'} /></label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Each person puts in (USD)</span>
        <input required type="number" inputMode="decimal" min={1} step="0.01" value={each} onChange={(event) => setEach(event.target.value)} className="hr-field" placeholder="250" />
      </label>
      {amount > 0 && (
        <p className={`text-[12.5px] ${amount > cash ? 'text-[#ff9f95]' : 'text-[#8e8e93]'}`}>
          {amount > cash ? `More than your Hoardrun cash (${money(cash)})` : `If all ${people} agree: ${money(amount * people)} in total. Only the people who say yes pay.`}
        </p>
      )}
      <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} className="hr-field" placeholder="Why the circle should do this (optional)" />
      <button type="submit" disabled={saving || amount < 1 || amount > cash || title.trim().length < 3} className="hr-focus h-12 w-full rounded-full bg-white text-[15px] font-medium text-black disabled:bg-white/10 disabled:text-[#8e8e93]">
        {saving ? 'Sending…' : 'Send to the circle for a vote'}
      </button>
    </form>
  )
}

/** Buy venture fund shares with the circle's pooled cash. */
function ProposeFundForm({ circle, onDone }: { circle: Circle; onDone: (next: Circle) => void }) {
  const { addToast } = useToast()
  const [funds, setFunds] = useState<Fund[] | null>(null)
  const [fundId, setFundId] = useState('')
  const [shares, setShares] = useState(1)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiClient.getVentureFunds().then((response) => {
      const open = ((response.data?.data ?? []) as Fund[]).filter((fund) => fund.is_open)
      setFunds(open)
      if (open[0]) {
        setFundId(open[0].id)
        setShares(open[0].min_shares)
      }
    })
  }, [])

  const fund = funds?.find((item) => item.id === fundId)
  const cost = fund ? fund.share_price * shares : 0
  const over = cost > circle.pool_balance

  const submit = async () => {
    if (!fund) return
    setSaving(true)
    const response = await apiClient.proposeCircleInvestment(circle.id, { kind: 'fund', fund_id: fund.id, shares, note: note.trim() || undefined })
    setSaving(false)
    if (response.error || !response.data?.data) {
      addToast({ title: "Couldn't propose", description: errorText(response.error), variant: 'destructive' })
      return
    }
    addToast({ title: 'Proposal sent', description: 'Members can vote now. It goes ahead once more than half agree.' })
    onDone(response.data.data as Circle)
  }

  if (circle.my_contribution <= 0) return <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] text-[#a1a1a6]">Add money to the circle's pool first, then you can propose buying venture fund shares with it.</p>
  if (funds === null) return <div className="hr-skeleton h-40 !rounded-[20px]" />
  if (!funds.length) {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] text-[#a1a1a6]">No venture fund is selling shares right now. <Link href="/venture-capital" className="text-white underline underline-offset-2">See venture funds</Link></p>
  }

  return (
    <div className="space-y-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
      <div className="hr-fund-picker" role="radiogroup" aria-label="Fund to buy">
        {funds.map((item) => (
          <button key={item.id} type="button" role="radio" aria-checked={item.id === fundId} onClick={() => { setFundId(item.id); setShares(item.min_shares) }} className="hr-focus">
            <FundEmblem seed={item.fund_name} size={36} />
            <span className="min-w-0 text-left"><span className="block truncate text-[13.5px] font-medium">{item.fund_name}</span><span className="block text-[11.5px] opacity-70">{money(item.share_price)} a share</span></span>
          </button>
        ))}
      </div>
      {fund && (
        <>
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setShares((value) => Math.max(fund.min_shares, value - 1))} className="hr-round hr-focus" aria-label="One share fewer"><Minus className="h-4 w-4" /></button>
            <div className="text-center">
              <p className="hr-figure text-[34px] leading-none">{shares.toLocaleString()}</p>
              <p className="text-[12px] text-[#8e8e93]">shares · {money(cost)}</p>
            </div>
            <button type="button" onClick={() => setShares((value) => Math.min(fund.shares_left, value + 1))} className="hr-round hr-focus" aria-label="One share more"><Plus className="h-4 w-4" /></button>
          </div>
          <p className={`text-center text-[12.5px] ${over ? 'text-[#ff9f95]' : 'text-[#8e8e93]'}`}>{over ? `More than the pool's ${money(circle.pool_balance)}` : `Pool after buying: ${money(circle.pool_balance - cost)}`}</p>
          <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} className="hr-field" placeholder="Why the circle should buy this (optional)" />
          <button onClick={submit} disabled={saving || over} className="hr-focus h-12 w-full rounded-full bg-white text-[15px] font-medium text-black disabled:bg-white/10 disabled:text-[#8e8e93]">
            {saving ? 'Sending…' : 'Propose to the circle'}
          </button>
        </>
      )}
    </div>
  )
}

function CircleDetails({ initial, onChange }: { initial: Circle; onChange: (next: Circle) => void }) {
  const { addToast } = useToast()
  const [circle, setCircle] = useState<Circle>(initial)
  const [amount, setAmount] = useState('')
  const [joinNote, setJoinNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [proposing, setProposing] = useState<null | 'asset' | 'fund'>(null)

  useEffect(() => {
    apiClient.getCircle(initial.id).then((response) => response.data?.data && setCircle(response.data.data))
  }, [initial.id])

  const apply = (next: Circle) => {
    setCircle(next)
    onChange(next)
  }

  const run = async (action: () => Promise<any>, success?: (next: Circle) => void) => {
    setBusy(true)
    const response = await action()
    setBusy(false)
    if (response.error || !response.data?.data) {
      addToast({ title: "That didn't work", description: errorText(response.error), variant: 'destructive' })
      return
    }
    apply(response.data.data)
    success?.(response.data.data)
  }

  const cash = circle.cash_available ?? 0
  const add = Number(amount) || 0
  const status = circle.my_status ?? (circle.is_member ? 'member' : null)
  const requests = circle.requests ?? []
  const openVotes = (circle.proposals ?? []).filter((proposal) => proposal.status === 'open')
  const decided = (circle.proposals ?? []).filter((proposal) => proposal.status !== 'open')

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8">
      <div className="hr-circle-hero">
        <Constellation members={circle.members} size={112} />
        <div className="relative min-w-0">
          {circle.focus && <AssetBadge value={circle.focus} label={circle.focus_label} />}
          <p className="hr-card-title mt-1.5 text-[23px]">{circle.name}</p>
          <p className="mt-1 text-[13px] leading-snug text-[#a1a1a6]">{circle.purpose}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[#a1a1a6]">
            <span><span className="font-semibold text-white">{circle.member_count}{circle.max_members ? `/${circle.max_members}` : ''}</span> members</span>
            <span><span className="font-semibold text-white">{money(circle.invested, true)}</span> invested</span>
            {circle.is_member && <span><span className="font-semibold text-white">{money(circle.my_invested ?? 0, true)}</span> yours</span>}
          </div>
        </div>
      </div>

      <div className="hr-circle-rule">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#4d94ff]" strokeWidth={2.2} />
        <p>One person, one vote. An investment goes ahead only when <strong>more than half</strong> of members agree ({circle.votes_needed ?? needed(circle.member_count)} of {circle.member_count} now). Only the people who agree pay.</p>
      </div>

      {status === null && (
        circle.is_full ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-[13.5px] text-[#a1a1a6]">This circle is full.</p>
        ) : (
          <div className="space-y-2">
            <input value={joinNote} onChange={(event) => setJoinNote(event.target.value)} maxLength={200} className="hr-field" placeholder="A note for the admin (optional)" />
            <button onClick={() => run(() => apiClient.joinCircle(circle.id, joinNote.trim()), () => addToast({ title: 'Request sent', description: `The admin of ${circle.name} will accept or decline it.` }))} disabled={busy} className="hr-focus inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-medium text-black disabled:opacity-60">
              <UserPlus className="h-4 w-4" strokeWidth={2.2} />Ask to join
            </button>
          </div>
        )
      )}
      {status === 'pending' && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#4d94ff]/35 bg-[#2f6bff]/10 p-4">
          <Clock3 className="h-5 w-5 shrink-0 text-[#9fd0ff]" strokeWidth={2.2} />
          <p className="min-w-0 flex-1 text-[13.5px]">Request sent. Waiting for the admin to accept you.</p>
          <button onClick={() => run(() => apiClient.cancelCircleRequest(circle.id))} disabled={busy} className="hr-focus shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-[12.5px]">Withdraw</button>
        </div>
      )}

      {circle.is_admin && requests.length > 0 && (
        <section>
          <h3 className="mb-2.5 flex items-center gap-2 text-[15px] font-medium">Join requests <span className="hr-count-chip">{requests.length}</span></h3>
          <ul className="space-y-2">
            {requests.map((request) => (
              <li key={request.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                <span className="hr-avatar h-10 w-10 text-[13px]">{initials(request.name)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{request.name}</p>
                  <p className="truncate text-[12px] text-[#8e8e93]">{request.note || 'Wants to join'}</p>
                </div>
                <button onClick={() => run(() => apiClient.answerCircleRequest(circle.id, request.id, 'decline'))} disabled={busy} aria-label={`Decline ${request.name}`} className="hr-focus inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#ff9f95]"><X className="h-4 w-4" strokeWidth={2.4} /></button>
                <button onClick={() => run(() => apiClient.answerCircleRequest(circle.id, request.id, 'approve'), () => addToast({ title: `${request.name} joined`, description: 'They can vote on proposals now.' }))} disabled={busy} className="hr-focus inline-flex h-9 items-center gap-1 rounded-full bg-white px-3.5 text-[13px] font-medium text-black"><Check className="h-4 w-4" strokeWidth={2.4} />Accept</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-[15px] font-medium">Votes {openVotes.length > 0 && <span className="hr-count-chip ml-1">{openVotes.length}</span>}</h3>
          {circle.is_member && (
            <button onClick={() => setProposing((value) => (value ? null : 'asset'))} className="hr-focus inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] font-medium text-black">
              {proposing ? <X className="h-3.5 w-3.5" /> : <Vote className="h-3.5 w-3.5" />}{proposing ? 'Cancel' : 'Propose an investment'}
            </button>
          )}
        </div>
        {proposing && (
          <div className="mb-4 space-y-3">
            <div className="hr-sendx-mode !flex w-full" role="radiogroup" aria-label="What to propose">
              <button type="button" role="radio" aria-checked={proposing === 'asset'} onClick={() => setProposing('asset')} className="hr-focus flex-1">Everyone who agrees pays</button>
              <button type="button" role="radio" aria-checked={proposing === 'fund'} onClick={() => setProposing('fund')} className="hr-focus flex-1">Use the pool</button>
            </div>
            {proposing === 'asset'
              ? <ProposeAssetForm circle={circle} onDone={(next) => { setProposing(null); apply(next) }} />
              : <ProposeFundForm circle={circle} onDone={(next) => { setProposing(null); apply(next) }} />}
          </div>
        )}
        {openVotes.length ? (
          <ul className="space-y-3">
            {openVotes.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} busy={busy} canVote={circle.is_member} onVote={(choice) => run(() => apiClient.voteOnCircleProposal(circle.id, proposal.id, choice))} />
            ))}
          </ul>
        ) : !proposing && (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] text-[#a1a1a6]">
            {circle.is_member ? 'Nothing to vote on. Propose private equity, real estate or another investment and the circle decides together.' : 'Members propose investments here and vote on them.'}
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-2.5 text-[15px] font-medium">Members</h3>
        <ul className="divide-y divide-white/[0.07] rounded-[20px] border border-white/[0.08]">
          {circle.members.map((member, index) => (
            <li key={member.name + index} className="flex items-center gap-3 px-3.5 py-2.5">
              <span className="hr-avatar h-9 w-9 text-[12px]">{initials(member.is_you ? 'You' : member.name)}</span>
              <span className={`min-w-0 flex-1 truncate text-[14px] ${member.is_you ? 'font-medium text-white' : 'text-[#d1d1d6]'}`}>
                {member.is_you ? 'You' : member.name}
                {member.is_admin && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#fbbf24]/15 px-2 py-0.5 align-middle text-[11px] font-medium text-[#fbbf24]"><Crown className="h-3 w-3" strokeWidth={2.4} />Admin</span>}
              </span>
              <span className="shrink-0 text-right text-[12px] tabular-nums text-[#8e8e93]">{money(member.invested ?? 0, true)} invested</span>
            </li>
          ))}
        </ul>
      </section>

      {decided.length > 0 && (
        <section>
          <h3 className="mb-3 text-[15px] font-medium">Decided</h3>
          <ul className="space-y-3">
            {decided.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} busy canVote={false} onVote={() => undefined} />)}
          </ul>
        </section>
      )}

      {circle.is_member && (
        <section className="hr-trade-row" data-warn={add > cash}>
          <div className="flex items-center justify-between text-[13px] text-[#8e8e93]">
            <span>Shared pool · {money(circle.pool_balance)}</span>
            <span className="inline-flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" strokeWidth={2} />{money(cash)}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="hr-figure text-[26px] text-[#8e8e93]">$</span>
            <input type="number" inputMode="decimal" min={circle.min_contribution} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={String(circle.min_contribution)} className="hr-figure hr-share-input min-w-0 flex-1 !text-left !text-[26px]" aria-label="Amount to add to the pool" />
            <button onClick={() => run(() => apiClient.contributeToCircle(circle.id, add), () => { setAmount(''); addToast({ title: 'Added to the pool', description: `${money(add)} is in ${circle.name}'s pool.` }) })} disabled={busy || add < circle.min_contribution || add > cash} className="hr-focus h-10 shrink-0 rounded-full bg-white px-4 text-[14px] font-medium text-black disabled:bg-white/10 disabled:text-[#8e8e93]">Add</button>
          </div>
          <p className={`mt-1 text-[12px] ${add > cash ? 'text-[#ff9f95]' : 'text-[#8e8e93]'}`}>{add > cash ? 'More than your Hoardrun cash' : `Optional. Pooled money buys venture fund shares when a vote passes. Minimum ${money(circle.min_contribution)}.`}</p>
        </section>
      )}

      {!!circle.holdings?.length && (
        <section>
          <h3 className="mb-3 text-[15px] font-medium">Fund shares the circle owns</h3>
          <ul className="divide-y divide-white/[0.07] rounded-[20px] border border-white/[0.08]">
            {circle.holdings.map((holding) => (
              <li key={holding.fund_id} className="flex items-center gap-3 p-3.5">
                <FundEmblem seed={holding.fund_name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{holding.fund_name}</p>
                  <p className="text-[12px] text-[#8e8e93]">{holding.shares.toLocaleString()} shares · {money(holding.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium tabular-nums">{holding.my_shares.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  <p className="text-[11.5px] text-[#8e8e93]">yours · {money(holding.my_value)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-[12px] leading-relaxed text-[#8e8e93]">
        When a vote passes, each person who agreed has their share taken from their Hoardrun cash and recorded as their investment in the circle. Taking money back out of a circle isn't available yet.
      </p>
    </div>
  )
}

function CreateCircleForm({ onCreated }: { onCreated: (circle: Circle) => void }) {
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [focus, setFocus] = useState('private_equity')
  const [size, setSize] = useState('10')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const people = Number(size) || 0

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    const response = await apiClient.createCircle({ name: name.trim(), purpose: purpose.trim(), min_contribution: 10, focus, max_members: people || undefined })
    setSaving(false)
    if (response.error || !response.data?.data) {
      setError(errorText(response.error))
      return
    }
    addToast({ title: 'Circle created', description: `You're the admin of ${response.data.data.name}. Share it so people can ask to join.` })
    onCreated(response.data.data)
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-6">
        <ol className="hr-circle-steps">
          <li><UserPlus className="h-4 w-4" strokeWidth={2.2} /><span>People ask to join, you accept them</span></li>
          <li><Vote className="h-4 w-4" strokeWidth={2.2} /><span>Anyone proposes an investment</span></li>
          <li><Users className="h-4 w-4" strokeWidth={2.2} /><span>More than half agree, it goes ahead</span></li>
        </ol>
        <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Name</span><input required minLength={2} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} className="hr-field" placeholder="Saturday Investment Club" /></label>
        <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">What it's for</span><input required minLength={10} maxLength={160} value={purpose} onChange={(event) => setPurpose(event.target.value)} className="hr-field" placeholder="Buy rental property together in Accra" /></label>
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Main type of investment</span>
          <div className="hr-asset-grid" role="radiogroup" aria-label="Main type of investment">
            {ASSETS.map((item) => {
              const Icon = item.icon
              return (
                <button key={item.value} type="button" role="radio" aria-checked={focus === item.value} onClick={() => setFocus(item.value)} className="hr-focus" style={{ ['--tone' as string]: item.tone }}>
                  <Icon className="h-4 w-4" strokeWidth={2.2} />{item.label}
                </button>
              )
            })}
          </div>
          <p className="mt-1.5 text-[12px] text-[#8e8e93]">Members can still propose other types; this is what the circle is known for.</p>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Number of people (you included)</span>
          <input required type="number" min={2} max={500} value={size} onChange={(event) => setSize(event.target.value)} className="hr-field" />
          {people >= 2 && <span className="mt-1.5 block text-[12px] text-[#8e8e93]">When full, a vote needs {needed(people)} of {people} people to agree.</span>}
        </label>
        {error && <p role="alert" className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-[14px]">{error}</p>}
      </div>
      <div className="border-t border-white/[0.08] px-5 py-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <button type="submit" disabled={saving || people < 2} className="hr-focus h-12 w-full rounded-full bg-white text-[15px] font-medium text-black disabled:opacity-60">{saving ? 'Creating…' : 'Create circle'}</button>
      </div>
    </form>
  )
}

export function CirclesPage() {
  const { addToast } = useToast()
  const [circles, setCircles] = useState<Circle[]>([])
  const [cash, setCash] = useState(0)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)
  const selected = circles.find((circle) => circle.id === selectedId) ?? null

  const load = useCallback(async () => {
    const response = await apiClient.getCircles()
    if (response.error || !response.data) setFailed(true)
    else {
      setFailed(false)
      setCircles(response.data.data ?? [])
      setCash(Number(response.data.cash_available) || 0)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const update = (next: Circle) => setCircles((current) => {
    const merged = current.some((circle) => circle.id === next.id) ? current.map((circle) => (circle.id === next.id ? { ...circle, ...next } : circle)) : [next, ...current]
    if (next.cash_available !== undefined) setCash(next.cash_available)
    return merged
  })

  const join = async (circle: Circle) => {
    setJoining(circle.id)
    const response = await apiClient.joinCircle(circle.id)
    setJoining(null)
    if (response.error || !response.data?.data) {
      addToast({ title: "Couldn't send the request", description: errorText(response.error), variant: 'destructive' })
      return
    }
    update(response.data.data)
    addToast({ title: 'Request sent', description: `The admin of ${circle.name} will accept or decline it.` })
  }

  const mine = circles.filter((circle) => circle.is_member)
  const invested = mine.reduce((sum, circle) => sum + (circle.my_invested ?? 0) + circle.my_contribution, 0)
  const toVote = mine.reduce((sum, circle) => sum + circle.open_proposals, 0)
  const requests = mine.reduce((sum, circle) => sum + (circle.pending_count ?? 0), 0)

  return (
    <motion.div className="space-y-4 sm:space-y-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
      <div>
        <Link href="/investment" className="hr-focus -ml-1 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[14px] text-[#a1a1a6] hover:text-white"><ArrowLeft className="h-4 w-4" strokeWidth={2} />Investments</Link>
        <div className="mt-1 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="hr-title">Circles</h1>
            <p className="hr-sub mt-1.5">Invest together. Members vote, and it only happens when more than half agree.</p>
          </div>
          <button onClick={() => setCreating(true)} className="hr-focus hidden h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-medium text-black sm:inline-flex"><Plus className="h-4 w-4" strokeWidth={2.4} />Create a circle</button>
        </div>
      </div>

      <section className="hr-vc-hero">
        <div className="relative z-[1] min-w-0">
          <p className="text-[13px] text-[#a1a1a6]">{mine.length ? 'Invested through circles' : 'Hoardrun cash'}</p>
          <p className="hr-figure mt-1 text-[38px] leading-none sm:text-[46px]">{money(mine.length ? invested : cash)}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="hr-count-pill">{mine.length} {mine.length === 1 ? 'circle' : 'circles'}</span>
            {toVote > 0 && <span className="hr-count-pill is-blue">{toVote} to vote on</span>}
            {requests > 0 && <span className="hr-count-pill is-amber">{requests} join {requests === 1 ? 'request' : 'requests'}</span>}
            <span className="hr-count-pill">{money(cash)} cash</span>
          </div>
        </div>
        {mine[0] ? <Constellation members={mine[0].members} size={116} /> : <OrbsGraphic className="h-24 w-24 shrink-0" />}
      </section>

      <ol className="hr-circle-steps is-row" aria-label="How circles work">
        <li><UserPlus className="h-4 w-4" strokeWidth={2.2} /><span>Ask to join; the admin accepts</span></li>
        <li><Vote className="h-4 w-4" strokeWidth={2.2} /><span>Propose an investment</span></li>
        <li><Users className="h-4 w-4" strokeWidth={2.2} /><span>Over 50% agree, it goes ahead</span></li>
      </ol>

      <button onClick={() => setCreating(true)} className="hr-focus inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white text-[14px] font-medium text-black sm:hidden"><Plus className="h-4 w-4" strokeWidth={2.4} />Create a circle</button>

      {failed ? (
        <div role="alert" className="hr-panel px-5 py-4 text-sm">We couldn't load circles. Please try again in a moment.</div>
      ) : loading ? (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((key) => <li key={key} className="hr-skeleton h-[200px] !rounded-[24px]" />)}</ul>
      ) : circles.length === 0 ? (
        <section className="hr-promo !min-h-[200px]">
          <OrbsGraphic className="hr-promo-art" />
          <div className="relative max-w-[62%] sm:max-w-[68%]">
            <h2 className="hr-card-title text-[22px] sm:text-[26px]">No circles yet</h2>
            <p className="hr-sub mt-2 !text-[#aeaeb2]">Start one with friends, family or colleagues and decide together what to invest in.</p>
            <button onClick={() => setCreating(true)} className="hr-focus mt-4 inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-medium text-black"><Plus className="h-4 w-4" strokeWidth={2.4} />Create a circle</button>
          </div>
        </section>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {circles.map((circle) => {
            const status = circle.my_status ?? (circle.is_member ? 'member' : null)
            const item = asset(circle.focus)
            return (
              <li key={circle.id} className="min-w-0">
                <div className="hr-circle-card" style={{ ['--tone' as string]: item.tone }}>
                  <button onClick={() => setSelectedId(circle.id)} className="hr-focus relative block w-full rounded-[22px] p-4 text-left">
                    <div className="flex items-start gap-3">
                      <Constellation members={circle.members} size={64} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {circle.focus && <AssetBadge value={circle.focus} label={circle.focus_label} />}
                          {circle.is_admin ? <span className="hr-role-chip is-admin"><Crown className="h-3 w-3" strokeWidth={2.4} />Admin</span>
                            : status === 'member' ? <span className="hr-role-chip">Member</span>
                            : status === 'pending' ? <span className="hr-role-chip is-pending"><Clock3 className="h-3 w-3" strokeWidth={2.4} />Requested</span>
                            : circle.is_full ? <span className="hr-role-chip">Full</span> : null}
                        </div>
                        <h3 className="hr-card-title mt-1.5 truncate text-[19px]">{circle.name}</h3>
                        <p className="line-clamp-1 text-[13px] text-[#a1a1a6]">{circle.purpose}</p>
                      </div>
                    </div>
                    <dl className="mt-3.5 grid grid-cols-3 gap-2">
                      <div><dt className="text-[11.5px] text-[#8e8e93]">Members</dt><dd className="hr-figure text-[16px]">{circle.member_count}{circle.max_members ? <span className="text-[#6e6e73]">/{circle.max_members}</span> : null}</dd></div>
                      <div><dt className="text-[11.5px] text-[#8e8e93]">Invested</dt><dd className="hr-figure text-[16px]">{money(circle.invested, true)}</dd></div>
                      <div><dt className="text-[11.5px] text-[#8e8e93]">Votes open</dt><dd className="hr-figure text-[16px]">{circle.open_proposals}</dd></div>
                    </dl>
                    {(circle.pending_count ?? 0) > 0 && <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#fbbf24]/15 px-2.5 py-1 text-[12px] font-medium text-[#fbbf24]"><UserPlus className="h-3.5 w-3.5" strokeWidth={2.4} />{circle.pending_count} waiting for you to accept</p>}
                  </button>
                  {status === null && !circle.is_full && (
                    <div className="relative px-4 pb-4">
                      <button onClick={() => join(circle)} disabled={joining === circle.id} className="hr-focus inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-white/25 text-[13.5px] font-medium hover:border-white/50 disabled:opacity-60"><UserPlus className="h-4 w-4" strokeWidth={2.4} />{joining === circle.id ? 'Sending…' : 'Ask to join'}</button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Sheet open={!!selected} onClose={() => setSelectedId(null)} label="Circle">
        <SheetHeader title="Circle" onClose={() => setSelectedId(null)} />
        {selected && <CircleDetails key={selected.id} initial={selected} onChange={update} />}
      </Sheet>

      <Sheet open={creating} onClose={() => setCreating(false)} label="Create a circle">
        <SheetHeader title="Create a circle" onClose={() => setCreating(false)} />
        <CreateCircleForm onCreated={(circle) => { setCreating(false); update(circle); setSelectedId(circle.id) }} />
      </Sheet>
    </motion.div>
  )
}
