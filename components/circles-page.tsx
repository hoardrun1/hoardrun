'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Minus, Plus, Users, Vote, Wallet, X } from 'lucide-react'
import { OrbsGraphic } from '@/components/app/home-graphics'
import { Sheet, SheetHeader } from '@/components/investment-opportunities-page'
import { FundEmblem } from '@/components/venture-capital-page'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'

interface Member { name: string; is_you: boolean; contributed: number; share: number }
interface Holding { fund_id: string; fund_name: string; firm_name: string; shares: number; amount: number; my_shares: number; my_value: number }
interface Proposal {
  id: string; fund_id: string; fund_name: string; firm_name: string; shares: number; amount: number; note?: string | null
  status: 'open' | 'passed' | 'rejected' | 'failed'; outcome?: string | null; proposed_by: string
  yes: number; no: number; voters: { yes: string[]; no: string[] }; my_vote: 'yes' | 'no' | null; created_at: string
}
interface Circle {
  id: string; name: string; purpose: string; min_contribution: number; pool_balance: number; total_contributed: number
  invested: number; member_count: number; is_member: boolean; is_creator: boolean; my_contribution: number; my_share: number
  open_proposals: number; members: Member[]; holdings?: Holding[]; proposals?: Proposal[]; cash_available?: number
}
interface Fund { id: string; fund_name: string; firm_name: string; share_price: number; shares_left: number; min_shares: number; is_open: boolean }

const money = (value: number, compact = false) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: compact ? 1 : 2, minimumFractionDigits: compact ? 0 : 2, notation: compact ? 'compact' : 'standard' }).format(value)
const pct = (value: number) => `${(value * 100).toFixed(value > 0 && value < 0.1 ? 1 : 0)}%`
const errorText = (error: unknown) => (typeof error === 'string' ? error : 'Something went wrong. Please try again.')
const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

/** Members orbit the shared pool; each one's size is their stake. */
function Constellation({ members, size = 120, center }: { members: Member[]; size?: number; center?: string }) {
  const uid = useId().replace(/:/g, '')
  const shown = members.slice(0, 8)
  const radius = 38
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="shrink-0 overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-core`} cx="0.34" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#f2f8ff" />
          <stop offset="0.45" stopColor="#d8b4fe" />
          <stop offset="0.85" stopColor="#6b21a8" />
          <stop offset="1" stopColor="#93c5fd" />
        </radialGradient>
        <radialGradient id={`${uid}-node`} cx="0.34" cy="0.28" r="0.9">
          <stop offset="0" stopColor="#eef2ff" />
          <stop offset="0.6" stopColor="#9cc9ff" />
          <stop offset="1" stopColor="#3730a3" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#fff" strokeOpacity="0.14" strokeDasharray="2 4" />
      <circle cx="60" cy="60" r={radius + 14} fill="none" stroke="#fff" strokeOpacity="0.06" />
      {shown.map((member, index) => {
        const angle = (index / Math.max(shown.length, 1)) * Math.PI * 2 - (Math.PI * 3) / 4
        const x = 60 + radius * Math.cos(angle)
        const y = 60 + radius * Math.sin(angle)
        return <line key={`l${index}`} x1="60" y1="60" x2={x} y2={y} stroke="#fff" strokeOpacity={0.08 + member.share * 0.5} strokeWidth={0.6 + member.share * 2.4} />
      })}
      <circle cx="60" cy="60" r="20" fill={`url(#${uid}-core)`} />
      <circle cx="60" cy="60" r="19.4" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.8" />
      {center && <text x="60" y="64" textAnchor="middle" fill="#0b0b0c" style={{ font: '600 10.5px var(--font-display), sans-serif', letterSpacing: '-0.03em' }}>{center}</text>}
      {shown.map((member, index) => {
        const angle = (index / Math.max(shown.length, 1)) * Math.PI * 2 - (Math.PI * 3) / 4
        const x = 60 + radius * Math.cos(angle)
        const y = 60 + radius * Math.sin(angle)
        const r = 6.5 + Math.sqrt(member.share) * 9
        return (
          <g key={index}>
            <circle cx={x} cy={y} r={r} fill={`url(#${uid}-node)`} stroke={member.is_you ? '#fff' : '#000'} strokeWidth={member.is_you ? 1.6 : 0.8} />
            <text x={x} y={y + 2.6} textAnchor="middle" fill="#0b0b0c" style={{ font: `600 ${Math.max(6, r * 0.62)}px var(--font-display), sans-serif` }}>{member.is_you ? 'You' : initials(member.name)}</text>
          </g>
        )
      })}
    </svg>
  )
}

/** Each member's stake as a slice of one ring: the same split decides votes and ownership. */
function OwnershipRing({ members }: { members: Member[] }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const shades = ['#ffffff', '#5aa9ff', '#34d399', '#38bdf8', '#fbbf24', '#fb7185']
  let offset = 0
  const me = members.find((member) => member.is_you)
  return (
    <svg viewBox="0 0 120 120" className="h-36 w-36 shrink-0" aria-hidden="true">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" />
      {members.filter((member) => member.share > 0).map((member, index) => {
        const length = Math.max(member.share * circumference - 2, 0.5)
        const element = (
          <motion.circle
            key={member.name + index}
            cx="60" cy="60" r={radius} fill="none" strokeWidth={member.is_you ? 16 : 14}
            stroke={member.is_you ? '#fff' : shades[(index % (shades.length - 1)) + 1]}
            strokeDasharray={`${length} ${circumference}`}
            transform={`rotate(${(offset / circumference) * 360 - 90} 60 60)`}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${length} ${circumference}` }}
            transition={{ type: 'spring', stiffness: 90, damping: 20, delay: index * 0.06 }}
          />
        )
        offset += member.share * circumference
        return element
      })}
      <text x="60" y="58" textAnchor="middle" fill="#fff" style={{ font: '600 20px var(--font-display), sans-serif', letterSpacing: '-0.04em' }}>{me ? pct(me.share) : '—'}</text>
      <text x="60" y="74" textAnchor="middle" fill="#8e8e93" style={{ font: '400 9px var(--font-text), sans-serif' }}>your stake</text>
    </svg>
  )
}

/** Yes fills from the left, no from the right; whichever crosses the middle line decides. */
function VoteBar({ yes, no }: { yes: number; no: number }) {
  return (
    <div className="hr-votebar" role="img" aria-label={`Yes ${pct(yes)}, no ${pct(no)}. Half of all stakes decides.`}>
      <motion.span className="hr-votebar-yes" initial={{ width: 0 }} animate={{ width: `${yes * 100}%` }} transition={{ type: 'spring', stiffness: 90, damping: 18 }} />
      <motion.span className="hr-votebar-no" initial={{ width: 0 }} animate={{ width: `${no * 100}%` }} transition={{ type: 'spring', stiffness: 90, damping: 18 }} />
      <span className="hr-votebar-mid" />
    </div>
  )
}

const STATUS: Record<Proposal['status'], string> = { open: 'Voting', passed: 'Bought', rejected: 'Voted down', failed: "Couldn't buy" }

function ProposalCard({ proposal, canVote, onVote, busy }: { proposal: Proposal; canVote: boolean; onVote: (choice: 'yes' | 'no') => void; busy: boolean }) {
  return (
    <li className="hr-proposal" data-status={proposal.status}>
      <div className="flex items-start gap-3">
        <FundEmblem seed={proposal.fund_name} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-[15px] font-medium">Buy {proposal.shares.toLocaleString()} shares of {proposal.fund_name}</p>
            <span className="hr-status-chip shrink-0" data-status={proposal.status}>{STATUS[proposal.status]}</span>
          </div>
          <p className="text-[12.5px] text-[#8e8e93]">{money(proposal.amount)} from the pool · proposed by {proposal.proposed_by}</p>
        </div>
      </div>
      {proposal.note && <p className="mt-3 text-[13.5px] leading-snug text-[#c7c7cc]">“{proposal.note}”</p>}
      <div className="mt-4"><VoteBar yes={proposal.yes} no={proposal.no} /></div>
      <div className="mt-2 grid grid-cols-2 gap-3 text-[12px]">
        <div><span className="font-medium text-white">Yes {pct(proposal.yes)}</span><span className="block truncate text-[#8e8e93]">{proposal.voters.yes.join(', ') || 'No votes yet'}</span></div>
        <div className="text-right"><span className="font-medium text-[#c7c7cc]">No {pct(proposal.no)}</span><span className="block truncate text-[#8e8e93]">{proposal.voters.no.join(', ') || 'No votes yet'}</span></div>
      </div>
      {proposal.status !== 'open' && proposal.outcome && <p className="mt-3 text-[12.5px] text-[#a1a1a6]">{proposal.outcome}</p>}
      {proposal.status === 'open' && canVote && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => onVote('yes')} disabled={busy} className="hr-vote-btn hr-focus" data-picked={proposal.my_vote === 'yes'}>
            <Check className="h-4 w-4" strokeWidth={2.4} />Yes
          </button>
          <button onClick={() => onVote('no')} disabled={busy} className="hr-vote-btn hr-focus" data-picked={proposal.my_vote === 'no'}>
            <X className="h-4 w-4" strokeWidth={2.4} />No
          </button>
        </div>
      )}
    </li>
  )
}

function ProposeForm({ circle, onDone }: { circle: Circle; onDone: (next: Circle) => void }) {
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
    const response = await apiClient.proposeCircleInvestment(circle.id, { fund_id: fund.id, shares, note: note.trim() || undefined })
    setSaving(false)
    if (response.error || !response.data?.data) {
      addToast({ title: "Couldn't propose", description: errorText(response.error), variant: 'destructive' })
      return
    }
    const next = response.data.data as Circle
    const made = next.proposals?.[0]
    addToast({ title: made?.status === 'passed' ? 'Bought for the circle' : 'Proposal sent', description: made?.status === 'passed' ? `Your stake was enough to decide: ${made.shares} shares of ${made.fund_name} are now the circle's.` : 'Members can vote now. It passes once yes holds more than half of all stakes.' })
    onDone(next)
  }

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
  const [busy, setBusy] = useState(false)
  const [proposing, setProposing] = useState(false)

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

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-8">
      <div className="hr-circle-hero">
        <Constellation members={circle.members} size={132} />
        <div className="relative min-w-0">
          <p className="hr-card-title text-[24px]">{circle.name}</p>
          <p className="mt-1 text-[13px] leading-snug text-[#a1a1a6]">{circle.purpose}</p>
          <p className="mt-3 text-[12px] text-[#8e8e93]">Pool</p>
          <p className="hr-figure text-[30px] leading-none">{money(circle.pool_balance)}</p>
          <p className="mt-1 text-[12px] text-[#8e8e93]">{money(circle.invested, true)} invested · {circle.member_count} {circle.member_count === 1 ? 'member' : 'members'}</p>
        </div>
      </div>

      {!circle.is_member ? (
        <button onClick={() => run(() => apiClient.joinCircle(circle.id), () => addToast({ title: 'You joined', description: `Add money to ${circle.name} to get a stake and a vote.` }))} disabled={busy} className="hr-focus inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-medium text-black disabled:opacity-60">
          <Users className="h-4 w-4" strokeWidth={2.2} />Join circle
        </button>
      ) : (
        <div className="hr-trade-row" data-warn={add > cash}>
          <div className="flex items-center justify-between text-[13px] text-[#8e8e93]">
            <span>Add to the pool</span>
            <span className="inline-flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" strokeWidth={2} />{money(cash)}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="hr-figure text-[30px] text-[#8e8e93]">$</span>
            <input type="number" inputMode="decimal" min={circle.min_contribution} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={String(circle.min_contribution)} className="hr-figure hr-share-input min-w-0 flex-1 !text-left !text-[30px]" aria-label="Amount to add" />
            <button onClick={() => run(() => apiClient.contributeToCircle(circle.id, add), () => { setAmount(''); addToast({ title: 'Added to the pool', description: `${money(add)} is in ${circle.name}. Your stake and vote grew.` }) })} disabled={busy || add < circle.min_contribution || add > cash} className="hr-focus h-11 shrink-0 rounded-full bg-white px-5 text-[14px] font-medium text-black disabled:bg-white/10 disabled:text-[#8e8e93]">Add</button>
          </div>
          <p className={`mt-1 text-[12px] ${add > cash ? 'text-[#ff9f95]' : 'text-[#8e8e93]'}`}>{add > cash ? 'More than your Hoardrun cash' : `Minimum ${money(circle.min_contribution)}. Money stays in the circle until a vote spends it.`}</p>
        </div>
      )}

      <section>
        <h3 className="mb-3 text-[15px] font-medium">Stakes and votes</h3>
        <div className="flex items-center gap-5">
          <OwnershipRing members={circle.members} />
          <ul className="min-w-0 flex-1 space-y-2">
            {circle.members.slice(0, 6).map((member, index) => (
              <li key={member.name + index} className="flex items-center justify-between gap-2 text-[13px]">
                <span className={`truncate ${member.is_you ? 'font-medium text-white' : 'text-[#c7c7cc]'}`}>{member.is_you ? 'You' : member.name}</span>
                <span className="shrink-0 tabular-nums text-[#8e8e93]">{pct(member.share)}</span>
              </li>
            ))}
            {circle.members.length > 6 && <li className="text-[12px] text-[#8e8e93]">+{circle.members.length - 6} more</li>}
          </ul>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-[#8e8e93]">Your stake is what you've added as a share of everything added. It's both your voting power and your share of what the circle owns.</p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-medium">Proposals</h3>
          {circle.is_member && circle.my_contribution > 0 && (
            <button onClick={() => setProposing((value) => !value)} className="hr-focus inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-3.5 text-[13px]">
              {proposing ? <X className="h-3.5 w-3.5" /> : <Vote className="h-3.5 w-3.5" />}{proposing ? 'Cancel' : 'Propose'}
            </button>
          )}
        </div>
        {proposing && <div className="mb-4"><ProposeForm circle={circle} onDone={(next) => { setProposing(false); apply(next) }} /></div>}
        {circle.proposals?.length ? (
          <ul className="space-y-3">
            {circle.proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} busy={busy} canVote={circle.is_member && circle.my_contribution > 0} onVote={(choice) => run(() => apiClient.voteOnCircleProposal(circle.id, proposal.id, choice))} />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] text-[#a1a1a6]">No proposals yet. Members with a stake can propose buying venture fund shares with the pool.</p>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-[15px] font-medium">What the circle owns</h3>
        {circle.holdings?.length ? (
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
        ) : (
          <p className="text-[13px] text-[#8e8e93]">Nothing yet. Passed proposals show up here, split by each member's stake.</p>
        )}
      </section>

      <p className="text-[12px] leading-relaxed text-[#8e8e93]">
        Money added to a circle can only leave it through a passed vote, and taking money back out isn't available yet. Circles can buy venture fund shares today; private equity, real estate and crypto aren't available to buy yet.
      </p>
    </div>
  )
}

function CreateCircleForm({ onCreated }: { onCreated: (circle: Circle) => void }) {
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [minimum, setMinimum] = useState('50')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    const response = await apiClient.createCircle({ name: name.trim(), purpose: purpose.trim(), min_contribution: Number(minimum) })
    setSaving(false)
    if (response.error || !response.data?.data) {
      setError(errorText(response.error))
      return
    }
    addToast({ title: 'Circle created', description: `Add money to ${response.data.data.name} to start your stake.` })
    onCreated(response.data.data)
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-6">
        <div className="flex items-center gap-4 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-4">
          <Constellation members={[{ name: 'You', is_you: true, contributed: 0, share: 1 }]} size={72} />
          <p className="text-[13px] leading-snug text-[#a1a1a6]">Everyone adds money to one pool. Each person's stake is what they added, and it sets both their vote and their share of what the circle buys.</p>
        </div>
        <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Name</span><input required minLength={2} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} className="hr-field" placeholder="Saturday Investment Club" /></label>
        <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">What it's for</span><input required minLength={10} maxLength={160} value={purpose} onChange={(event) => setPurpose(event.target.value)} className="hr-field" placeholder="Back early-stage African startups together" /></label>
        <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Smallest amount someone can add (USD)</span><input required type="number" min={1} step="0.01" value={minimum} onChange={(event) => setMinimum(event.target.value)} className="hr-field" /></label>
        {error && <p role="alert" className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-[14px]">{error}</p>}
      </div>
      <div className="border-t border-white/[0.08] px-5 py-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <button type="submit" disabled={saving} className="hr-focus h-12 w-full rounded-full bg-white text-[15px] font-medium text-black disabled:opacity-60">{saving ? 'Creating…' : 'Create circle'}</button>
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
      addToast({ title: "Couldn't join", description: errorText(response.error), variant: 'destructive' })
      return
    }
    update(response.data.data)
    setSelectedId(circle.id)
  }

  const mine = circles.filter((circle) => circle.is_member)
  const myTotal = mine.reduce((sum, circle) => sum + circle.my_contribution, 0)

  return (
    <motion.div className="space-y-5 sm:space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
      <div>
        <Link href="/investment" className="hr-focus -ml-1 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[14px] text-[#a1a1a6] hover:text-white"><ArrowLeft className="h-4 w-4" strokeWidth={2} />Investments</Link>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="hr-title">Circles</h1>
            <p className="hr-sub mt-2">Pool money with people you trust, vote with your stake, and own your share of everything the circle buys.</p>
          </div>
          <button onClick={() => setCreating(true)} className="hr-focus hidden h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-medium text-black sm:inline-flex"><Plus className="h-4 w-4" strokeWidth={2.4} />Create a circle</button>
        </div>
      </div>

      <section className="hr-vc-hero">
        <div className="relative z-[1] min-w-0">
          <p className="text-[13px] text-[#a1a1a6]">{mine.length ? 'You have added' : 'Hoardrun cash to add'}</p>
          <p className="hr-figure mt-1 text-[40px] leading-none sm:text-[48px]">{money(mine.length ? myTotal : cash)}</p>
          <p className="mt-2 text-[13px] text-[#a1a1a6]">{mine.length ? `Across ${mine.length} ${mine.length === 1 ? 'circle' : 'circles'} · ${money(cash)} cash` : 'Join or create a circle to start investing together.'}</p>
        </div>
        {mine[0] ? <Constellation members={mine[0].members} size={128} /> : <OrbsGraphic className="h-28 w-28 shrink-0" />}
      </section>

      <button onClick={() => setCreating(true)} className="hr-focus inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white text-[14px] font-medium text-black sm:hidden"><Plus className="h-4 w-4" strokeWidth={2.4} />Create a circle</button>

      {failed ? (
        <div role="alert" className="hr-panel px-5 py-4 text-sm">We couldn't load circles. Please try again in a moment.</div>
      ) : loading ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((key) => <li key={key} className="hr-skeleton h-[260px] !rounded-[24px]" />)}</ul>
      ) : circles.length === 0 ? (
        <section className="hr-promo !min-h-[240px]">
          <OrbsGraphic className="hr-promo-art" />
          <div className="relative max-w-[62%] sm:max-w-[68%]">
            <h2 className="hr-card-title text-[24px] sm:text-[28px]">No circles yet</h2>
            <p className="hr-sub mt-2 !text-[#aeaeb2]">Start one with friends, family or colleagues. You decide together what to buy.</p>
            <button onClick={() => setCreating(true)} className="hr-focus mt-5 inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-medium text-black"><Plus className="h-4 w-4" strokeWidth={2.4} />Create a circle</button>
          </div>
        </section>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {circles.map((circle) => (
            <li key={circle.id} className="min-w-0">
              <div className="hr-company !p-0">
                <span className="hr-company-glow" aria-hidden="true" />
                <button onClick={() => setSelectedId(circle.id)} className="hr-focus relative block w-full rounded-[24px] p-5 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <Constellation members={circle.members} size={92} />
                    <div className="flex flex-col items-end gap-1.5">
                      {circle.is_member && <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-black">{circle.my_contribution > 0 ? `Your stake ${pct(circle.my_share)}` : 'Joined'}</span>}
                      {circle.open_proposals > 0 && <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] text-[#c7c7cc]">{circle.open_proposals} to vote on</span>}
                    </div>
                  </div>
                  <h3 className="hr-card-title mt-3 truncate text-[21px]">{circle.name}</h3>
                  <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-[#c7c7cc]">{circle.purpose}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-3">
                    <div><dt className="text-[12px] text-[#8e8e93]">Pool</dt><dd className="hr-figure text-[17px]">{money(circle.pool_balance, true)}</dd></div>
                    <div><dt className="text-[12px] text-[#8e8e93]">Invested</dt><dd className="hr-figure text-[17px]">{money(circle.invested, true)}</dd></div>
                    <div><dt className="text-[12px] text-[#8e8e93]">Members</dt><dd className="hr-figure text-[17px]">{circle.member_count}</dd></div>
                  </dl>
                </button>
                {!circle.is_member && (
                  <div className="relative px-5 pb-5">
                    <button onClick={() => join(circle)} disabled={joining === circle.id} className="hr-focus inline-flex h-10 items-center gap-1.5 rounded-full border border-white/25 px-4 text-[13.5px] font-medium hover:border-white/50 disabled:opacity-60"><Plus className="h-4 w-4" strokeWidth={2.4} />{joining === circle.id ? 'Joining…' : 'Join'}</button>
                  </div>
                )}
              </div>
            </li>
          ))}
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
