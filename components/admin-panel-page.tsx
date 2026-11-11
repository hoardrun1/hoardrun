'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight, BadgeCheck, Building2, Check, ChevronLeft, ChevronRight, Clock3, Globe, Landmark, Lock, MapPin, Search,
  ShieldCheck, Users, Wallet, X, XCircle, type LucideIcon,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'

type Tab = 'overview' | 'approvals' | 'people'
type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'all'

interface Overview {
  users: { total: number; new_today: number; new_7_days: number; new_30_days: number; verified_email: number; active_7_days: number; signups_14_days: { date: string; count: number }[] }
  money: { cash_held: number; deposits_30_days: number; transactions_30_days: number; sent_30_days: number }
  investing: {
    listings_pending: number; listings_approved: number; listings_rejected: number; invested_in_listings: number; listing_investors: number
    circles: number; circle_members: number; invested_by_circles: number; venture_fund_orders: number
  }
}
interface Listing {
  id: string; name: string; category: string; sector: string; tagline: string; about?: string | null; location?: string | null; website?: string | null
  founded_year?: number | null; funding_goal: number; min_investment: number; amount_raised: number; target_return?: string | null; term?: string | null
  risk_level: string; review_status: 'pending' | 'approved' | 'rejected'; review_note?: string | null; reviewed_at?: string | null; created_at: string
  owner: { name: string; email: string | null; email_verified: boolean; joined_at: string | null }; investor_count: number
}
interface Person { id: string; name: string; email: string; joined_at: string | null; last_login_at: string | null; email_verified: boolean; status: string; is_admin: boolean; cash: number }

const CATEGORY: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  'private-equity': { label: 'Private equity', icon: Building2, tone: '#8b5cf6' },
  'real-estate': { label: 'Real estate', icon: Building2, tone: '#38bdf8' },
  'fixed-income': { label: 'Fixed income', icon: Landmark, tone: '#34d399' },
}
const RISK: Record<string, string> = { low: 'Low', moderate: 'Moderate', high: 'High', very_high: 'Very high' }

const money = (value: number, compact = false) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: compact ? 'compact' : 'standard', maximumFractionDigits: compact ? 1 : 2 }).format(value)
const count = (value: number) => new Intl.NumberFormat('en-US').format(value)
const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
const errorText = (error: unknown) => (typeof error === 'string' ? error : 'Something went wrong. Please try again.')
const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

function Stat({ label, value, note, icon: Icon, tone = '#4d94ff' }: { label: string; value: string; note?: string; icon: LucideIcon; tone?: string }) {
  return (
    <div className="hr-admin-stat" style={{ ['--tone' as string]: tone }}>
      <span className="hr-admin-stat-icon"><Icon className="h-4 w-4" strokeWidth={2.2} /></span>
      <p className="mt-2.5 text-[12px] text-[#a1a1a6]">{label}</p>
      <p className="hr-figure mt-0.5 truncate text-[24px] leading-tight">{value}</p>
      {note && <p className="mt-0.5 truncate text-[11.5px] text-[#6e6e73]">{note}</p>}
    </div>
  )
}

/** Sign-ups per day for the last two weeks. */
function SignupBars({ days }: { days: { date: string; count: number }[] }) {
  const top = Math.max(...days.map((day) => day.count), 1)
  return (
    <div>
      <div className="flex h-28 items-end gap-1.5" role="img" aria-label={`Sign-ups over 14 days: ${days.map((day) => day.count).join(', ')}`}>
        {days.map((day, index) => (
          <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] tabular-nums text-[#8e8e93]">{day.count || ''}</span>
            <motion.span initial={{ height: 0 }} animate={{ height: `${Math.max((day.count / top) * 100, day.count ? 6 : 2)}%` }} transition={{ delay: index * 0.025, type: 'spring', stiffness: 160, damping: 20 }}
              className="w-full rounded-md" style={{ background: day.count ? 'linear-gradient(180deg, #7cc0ff, #2f6bff)' : 'rgba(255,255,255,0.08)' }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10.5px] text-[#6e6e73]">
        <span>{new Date(days[0]?.date ?? Date.now()).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
        <span>Today</span>
      </div>
    </div>
  )
}

function OverviewTab({ data }: { data: Overview }) {
  const { users, money: cash, investing } = data
  return (
    <div className="space-y-4">
      <section className="hr-admin-card">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[13px] text-[#a1a1a6]">People registered</p>
            <p className="hr-figure text-[44px] leading-none">{count(users.total)}</p>
          </div>
          <p className="text-right text-[12.5px] text-[#a1a1a6]"><span className="font-semibold text-white">+{count(users.new_7_days)}</span> this week<br /><span className="font-semibold text-white">+{count(users.new_today)}</span> today</p>
        </div>
        <div className="mt-4"><SignupBars days={users.signups_14_days} /></div>
      </section>

      <div className="hr-admin-grid">
        <Stat label="New in 30 days" value={count(users.new_30_days)} icon={Users} />
        <Stat label="Verified email" value={count(users.verified_email)} note={users.total ? `${Math.round((users.verified_email / users.total) * 100)}% of everyone` : undefined} icon={BadgeCheck} tone="#34d399" />
        <Stat label="Active this week" value={count(users.active_7_days)} note="Signed in in the last 7 days" icon={ShieldCheck} tone="#38bdf8" />
        <Stat label="Cash held" value={money(cash.cash_held, true)} note="In everyone's Hoardrun cash" icon={Wallet} tone="#fbbf24" />
        <Stat label="Deposits, 30 days" value={money(cash.deposits_30_days, true)} icon={ArrowUpRight} tone="#34d399" />
        <Stat label="Transactions, 30 days" value={count(cash.transactions_30_days)} note={`${money(cash.sent_30_days, true)} going out`} icon={Landmark} />
      </div>

      <section className="hr-admin-card">
        <h2 className="text-[15px] font-medium">Investing</h2>
        <div className="hr-admin-grid mt-3">
          <Stat label="Waiting for approval" value={count(investing.listings_pending)} icon={Clock3} tone="#fbbf24" />
          <Stat label="Approved businesses" value={count(investing.listings_approved)} note={`${count(investing.listings_rejected)} not approved`} icon={BadgeCheck} tone="#34d399" />
          <Stat label="Invested in businesses" value={money(investing.invested_in_listings, true)} note={`${count(investing.listing_investors)} investors`} icon={Building2} tone="#8b5cf6" />
          <Stat label="Circles" value={count(investing.circles)} note={`${count(investing.circle_members)} members`} icon={Users} tone="#38bdf8" />
          <Stat label="Through circles" value={money(investing.invested_by_circles, true)} icon={Wallet} tone="#4d94ff" />
          <Stat label="Venture fund orders" value={money(investing.venture_fund_orders, true)} icon={ArrowUpRight} tone="#fb7185" />
        </div>
      </section>
    </div>
  )
}

function ListingCard({ listing, onDecided }: { listing: Listing; onDecided: (next: Listing) => void }) {
  const { addToast } = useToast()
  const [note, setNote] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(listing.review_status === 'pending')
  const meta = CATEGORY[listing.category] ?? CATEGORY['private-equity']
  const Icon = meta.icon

  const decide = async (decision: 'approve' | 'reject') => {
    setBusy(true)
    const response = await apiClient.reviewListing(listing.id, decision, decision === 'reject' ? note.trim() : undefined)
    setBusy(false)
    if (response.error || !response.data?.data) {
      addToast({ title: "That didn't work", description: errorText(response.error), variant: 'destructive' })
      return
    }
    addToast(decision === 'approve'
      ? { title: `${listing.name} approved`, description: `It's on the ${meta.label.toLowerCase()} page now, and its owner was told.` }
      : { title: `${listing.name} not approved`, description: 'It stays private. Its owner was told why.' })
    setRejecting(false)
    onDecided(response.data.data)
  }

  const facts = [
    ['Raising', money(listing.funding_goal)], ['Minimum', money(listing.min_investment)], ['Raised so far', money(listing.amount_raised)],
    ['Target return', listing.target_return], ['Term', listing.term], ['Risk', RISK[listing.risk_level] ?? listing.risk_level],
    ['Sector', listing.sector], ['Founded', listing.founded_year ? String(listing.founded_year) : null], ['Investors', String(listing.investor_count)],
  ].filter(([, value]) => value) as [string, string][]

  return (
    <li className="hr-admin-card !p-0" style={{ ['--tone' as string]: meta.tone }}>
      <button onClick={() => setOpen((value) => !value)} className="hr-focus flex w-full items-start gap-3 rounded-[22px] p-4 text-left" aria-expanded={open}>
        <span className="hr-asset-badge is-lg" style={{ ['--tone' as string]: meta.tone }}><Icon className="h-5 w-5" strokeWidth={2.2} /></span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-[16px] font-medium">{listing.name}</span>
            <span className="hr-review-chip" data-status={listing.review_status}>
              {listing.review_status === 'pending' ? <Clock3 className="h-3 w-3" strokeWidth={2.4} /> : listing.review_status === 'approved' ? <BadgeCheck className="h-3 w-3" strokeWidth={2.4} /> : <XCircle className="h-3 w-3" strokeWidth={2.4} />}
              {listing.review_status === 'pending' ? 'Waiting' : listing.review_status === 'approved' ? 'Approved' : 'Not approved'}
            </span>
          </span>
          <span className="block text-[12.5px] text-[#a1a1a6]">{meta.label} · {money(listing.funding_goal, true)} · by {listing.owner.name}</span>
          <span className="block truncate text-[13px] text-[#d1d1d6]">{listing.tagline}</span>
        </span>
        <ChevronRight className={`mt-1 h-4 w-4 shrink-0 text-[#8e8e93] transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="space-y-3 border-t border-white/[0.07] px-4 pb-4 pt-3">
          {listing.about && <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-[#c7c7cc]">{listing.about}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[#a1a1a6]">
            {listing.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{listing.location}</span>}
            {listing.website && <a href={listing.website} target="_blank" rel="noopener noreferrer" className="hr-focus inline-flex items-center gap-1 rounded text-[#9fd0ff] hover:underline"><Globe className="h-3.5 w-3.5" />{listing.website.replace(/^https?:\/\//, '')}</a>}
            <span>Listed {date(listing.created_at)}</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 sm:grid-cols-3">
            {facts.map(([label, value]) => (
              <div key={label} className="min-w-0"><dt className="text-[11.5px] text-[#8e8e93]">{label}</dt><dd className="truncate text-[13.5px] font-medium tabular-nums">{value}</dd></div>
            ))}
          </dl>
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] p-3">
            <span className="hr-avatar h-9 w-9 text-[12px]">{initials(listing.owner.name)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium">{listing.owner.name}</p>
              <p className="truncate text-[12px] text-[#8e8e93]">{listing.owner.email} · joined {date(listing.owner.joined_at)}</p>
            </div>
            <span className={`shrink-0 text-[11.5px] ${listing.owner.email_verified ? 'text-[#34d399]' : 'text-[#fbbf24]'}`}>{listing.owner.email_verified ? 'Email verified' : 'Email not verified'}</span>
          </div>
          {listing.review_note && <p className="text-[12.5px] text-[#a1a1a6]">Note to owner: “{listing.review_note}”</p>}

          {rejecting ? (
            <div className="space-y-2">
              <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} rows={2} className="hr-field !h-auto py-2.5" placeholder="Tell the owner why (they'll see this)" />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setRejecting(false)} disabled={busy} className="hr-focus h-11 rounded-full border border-white/15 text-[14px]">Cancel</button>
                <button onClick={() => decide('reject')} disabled={busy} className="hr-focus h-11 rounded-full bg-[#e5484d] text-[14px] font-medium text-white disabled:opacity-60">{busy ? 'Saving…' : 'Don’t approve'}</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {listing.review_status !== 'rejected' && listing.amount_raised <= 0 && (
                <button onClick={() => setRejecting(true)} disabled={busy} className="hr-focus inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-white/15 text-[14px] text-[#ff9f95]"><X className="h-4 w-4" strokeWidth={2.4} />{listing.review_status === 'approved' ? 'Take down' : 'Don’t approve'}</button>
              )}
              {listing.review_status !== 'approved' && (
                <button onClick={() => decide('approve')} disabled={busy} className="hr-focus col-start-2 inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-white text-[14px] font-medium text-black disabled:opacity-60"><Check className="h-4 w-4" strokeWidth={2.4} />{busy ? 'Saving…' : 'Approve'}</button>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  )
}

function ApprovalsTab({ onCountChange }: { onCountChange: () => void }) {
  const [filter, setFilter] = useState<ReviewStatus>('pending')
  const [listings, setListings] = useState<Listing[] | null>(null)

  const load = useCallback(async () => {
    setListings(null)
    const response = await apiClient.getAdminListings(filter)
    setListings(response.data?.data ?? [])
  }, [filter])

  useEffect(() => { load() }, [load])

  const decided = (next: Listing) => {
    setListings((current) => (current ?? []).map((item) => (item.id === next.id ? next : item)).filter((item) => filter === 'all' || item.review_status === filter || item.id === next.id))
    onCountChange()
  }

  return (
    <div className="space-y-3">
      <div className="hr-admin-filters" role="radiogroup" aria-label="Show">
        {(['pending', 'approved', 'rejected', 'all'] as ReviewStatus[]).map((value) => (
          <button key={value} type="button" role="radio" aria-checked={filter === value} onClick={() => setFilter(value)} className="hr-focus">
            {value === 'pending' ? 'Waiting' : value === 'approved' ? 'Approved' : value === 'rejected' ? 'Not approved' : 'All'}
          </button>
        ))}
      </div>
      <p className="text-[12.5px] leading-snug text-[#8e8e93]">Businesses people register stay private until you approve them. Approved ones appear on the private equity, real estate or fixed income page and can take investments.</p>
      {listings === null ? (
        <div className="space-y-2">{[0, 1].map((key) => <div key={key} className="hr-skeleton h-24 !rounded-[22px]" />)}</div>
      ) : listings.length === 0 ? (
        <p className="hr-admin-card text-center text-[13.5px] text-[#a1a1a6]">{filter === 'pending' ? 'Nothing waiting. New businesses show up here as soon as they’re registered.' : 'Nothing here yet.'}</p>
      ) : (
        <ul className="space-y-2.5">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} onDecided={decided} />)}</ul>
      )}
    </div>
  )
}

function PeopleTab() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ data: Person[]; total: number; pages: number } | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const response = await apiClient.getAdminUsers({ q: query.trim() || undefined, page })
      setData(response.data ?? { data: [], total: 0, pages: 1 })
    }, query ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [query, page])

  return (
    <div className="space-y-3">
      <label className="relative block">
        <span className="sr-only">Search people</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" strokeWidth={2} />
        <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search by name or email" className="hr-field !h-11 !rounded-full !pl-10" />
      </label>
      {data === null ? (
        <div className="hr-skeleton h-64 !rounded-[22px]" />
      ) : (
        <>
          <p className="text-[12.5px] text-[#8e8e93]">{count(data.total)} {data.total === 1 ? 'person' : 'people'}</p>
          <ul className="divide-y divide-white/[0.07] rounded-[22px] border border-white/[0.08] bg-white/[0.02]">
            {data.data.map((person) => (
              <li key={person.id} className="flex items-center gap-3 px-3.5 py-3">
                <span className="hr-avatar h-10 w-10 shrink-0 text-[13px]">{initials(person.name)}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[14px] font-medium">
                    <span className="truncate">{person.name}</span>
                    {person.is_admin && <span className="hr-role-chip is-admin shrink-0 !py-0 !text-[10.5px]">Admin</span>}
                  </p>
                  <p className="truncate text-[12px] text-[#8e8e93]">{person.email}</p>
                  <p className="text-[11.5px] text-[#6e6e73]">Joined {date(person.joined_at)} · {person.last_login_at ? `last in ${date(person.last_login_at)}` : 'never signed in'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13.5px] font-medium tabular-nums">{money(person.cash)}</p>
                  <p className={`text-[11px] ${person.email_verified ? 'text-[#34d399]' : 'text-[#fbbf24]'}`}>{person.email_verified ? 'Verified' : 'Not verified'}</p>
                </div>
              </li>
            ))}
          </ul>
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-3 text-[13px]">
              <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1} className="hr-round hr-focus disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
              <span className="tabular-nums text-[#a1a1a6]">Page {page} of {data.pages}</span>
              <button onClick={() => setPage((value) => Math.min(data.pages, value + 1))} disabled={page >= data.pages} className="hr-round hr-focus disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function AdminPanelPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [tab, setTab] = useState<Tab>('overview')

  const loadOverview = useCallback(async () => {
    const response = await apiClient.getAdminOverview()
    if (response.data?.data) setOverview(response.data.data)
  }, [])

  useEffect(() => {
    apiClient.getAdminStatus().then((response) => {
      const ok = !!response.data?.is_admin
      setAllowed(ok)
      if (ok) loadOverview()
    })
  }, [loadOverview])

  if (allowed === false) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06]"><Lock className="h-6 w-6 text-[#a1a1a6]" /></span>
        <h1 className="hr-title mt-4 !text-[28px]">Admins only</h1>
        <p className="hr-sub mt-2">This area is for the people who run Hoardrun.</p>
      </div>
    )
  }

  const pending = overview?.investing.listings_pending ?? 0

  return (
    <motion.div className="mx-auto w-full max-w-[1100px] space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#9fd0ff]"><ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.4} />Hoardrun admin</p>
          <h1 className="hr-title mt-1">Admin</h1>
        </div>
        {pending > 0 && tab !== 'approvals' && (
          <button onClick={() => setTab('approvals')} className="hr-focus inline-flex items-center gap-1.5 rounded-full bg-[#fbbf24]/15 px-3.5 py-2 text-[13px] font-medium text-[#fbbf24]"><Clock3 className="h-4 w-4" strokeWidth={2.4} />{pending} to approve</button>
        )}
      </div>

      <div className="hr-sendx-mode !flex w-full" role="tablist" aria-label="Admin sections">
        {([['overview', 'Overview'], ['approvals', `Approvals${pending ? ` · ${pending}` : ''}`], ['people', 'People']] as [Tab, string][]).map(([value, label]) => (
          <button key={value} type="button" role="tab" aria-selected={tab === value} aria-checked={tab === value} data-state={tab === value ? 'active' : 'inactive'} onClick={() => setTab(value)} className="hr-focus flex-1 !py-2">{label}</button>
        ))}
      </div>

      {allowed === null || (tab === 'overview' && !overview) ? (
        <div className="space-y-3">{[0, 1, 2].map((key) => <div key={key} className="hr-skeleton h-32 !rounded-[22px]" />)}</div>
      ) : tab === 'overview' && overview ? (
        <OverviewTab data={overview} />
      ) : tab === 'approvals' ? (
        <ApprovalsTab onCountChange={loadOverview} />
      ) : (
        <PeopleTab />
      )}
    </motion.div>
  )
}
