'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Globe, MapPin, Plus, Search, Trash2, X } from 'lucide-react'
import { BriefcaseGraphic, ShieldGraphic, TowerGraphic } from '@/components/app/home-graphics'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'

type Category = 'private-equity' | 'real-estate' | 'fixed-income'
type Risk = 'low' | 'moderate' | 'high' | 'very_high'

interface Company {
  id: string
  name: string
  category: Category
  sector: string
  tagline: string
  about?: string | null
  location?: string | null
  website?: string | null
  founded_year?: number | null
  funding_goal: number
  min_investment: number
  amount_raised: number
  target_return?: string | null
  term?: string | null
  risk_level: Risk
  created_at: string
  is_owner: boolean
}

const CATEGORIES: Record<Category, { title: string; tab: string; description: string; noun: string; Graphic: (props: { className?: string }) => JSX.Element }> = {
  'private-equity': { title: 'Private equity', tab: 'Private equity', description: 'Stakes in private companies that are raising money.', noun: 'private equity companies', Graphic: BriefcaseGraphic },
  'real-estate': { title: 'Real estate', tab: 'Real estate', description: 'Property projects that pay out from rent or sale.', noun: 'real estate projects', Graphic: TowerGraphic },
  'fixed-income': { title: 'Fixed income', tab: 'Fixed income', description: 'Loans and bonds that pay regular interest.', noun: 'fixed income offers', Graphic: ShieldGraphic },
}

const RISKS: { value: Risk; label: string; level: number }[] = [
  { value: 'low', label: 'Low', level: 1 },
  { value: 'moderate', label: 'Moderate', level: 2 },
  { value: 'high', label: 'High', level: 3 },
  { value: 'very_high', label: 'Very high', level: 4 },
]

const money = (value: number, compact = false) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: compact ? 1 : 0, notation: compact ? 'compact' : 'standard' }).format(value)

const listedAgo = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days < 1) return 'Listed today'
  if (days === 1) return 'Listed yesterday'
  if (days < 30) return `Listed ${days} days ago`
  return `Listed ${new Date(iso).toLocaleDateString()}`
}

const errorText = (error: unknown) => {
  if (Array.isArray(error)) return error.map((item) => String(item?.msg ?? item).replace(/^Value error, /, '')).join('. ')
  return typeof error === 'string' ? error : 'Something went wrong. Please try again.'
}

/** The company's initials struck into a chrome coin. */
export function CompanyCoin({ name, size = 56 }: { name: string; size?: number }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()
  return (
    <span className="hr-coin" style={{ width: size, height: size, fontSize: size * 0.34 }} aria-hidden="true">
      <span>{initials}</span>
    </span>
  )
}

function RiskMeter({ risk }: { risk: Risk }) {
  const { label, level } = RISKS.find((item) => item.value === risk) ?? RISKS[1]
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-[#a1a1a6]">
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className={`h-1.5 w-3 rounded-full ${step <= level ? 'bg-white' : 'bg-white/15'}`} />
        ))}
      </span>
      {label} risk
    </span>
  )
}

function Progress({ raised, goal }: { raised: number; goal: number }) {
  const share = goal > 0 ? Math.min(raised / goal, 1) : 0
  return (
    <div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-white/40 to-white" style={{ width: `${Math.max(share * 100, raised > 0 ? 2 : 0)}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[12px] tabular-nums text-[#8e8e93]">
        <span><span className="text-white">{money(raised)}</span> raised</span>
        <span>{Math.round(share * 100)}% of {money(goal, true)}</span>
      </div>
    </div>
  )
}

export function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
            className="hr-sheet fixed right-0 top-0 flex h-full w-full max-w-[480px] flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={label}
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
      <h2 className="hr-section-title">{title}</h2>
      <button onClick={onClose} className="hr-round hr-focus" aria-label="Close">
        <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>
    </div>
  )
}

function CompanyCard({ company, onOpen }: { company: Company; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="hr-company hr-focus text-left">
      <span className="hr-company-glow" aria-hidden="true" />
      <div className="relative flex items-start gap-4">
        <CompanyCoin name={company.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="hr-card-title truncate text-[20px]">{company.name}</h3>
            {company.is_owner && <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-[#c7c7cc]">Yours</span>}
          </div>
          <p className="mt-0.5 truncate text-[13px] text-[#8e8e93]">
            {[company.sector, company.location].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
      <p className="relative mt-4 line-clamp-2 text-[15px] leading-snug text-[#d1d1d6]">{company.tagline}</p>
      <dl className="relative mt-5 grid grid-cols-3 gap-3">
        <div>
          <dt className="text-[12px] text-[#8e8e93]">Raising</dt>
          <dd className="hr-figure mt-0.5 text-[18px]">{money(company.funding_goal, true)}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-[#8e8e93]">Minimum</dt>
          <dd className="hr-figure mt-0.5 text-[18px]">{money(company.min_investment, true)}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-[#8e8e93]">Target return</dt>
          <dd className="hr-figure mt-0.5 text-[18px]">{company.target_return || '—'}</dd>
        </div>
      </dl>
      <div className="relative mt-5">
        <Progress raised={company.amount_raised} goal={company.funding_goal} />
      </div>
      <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-white/[0.07] pt-4">
        <RiskMeter risk={company.risk_level} />
        <span className="text-[12px] text-[#8e8e93]">{listedAgo(company.created_at)}</span>
      </div>
    </button>
  )
}

function CompanyDetails({ company, onDelete, deleting }: { company: Company; onDelete: () => void; deleting: boolean }) {
  const facts = [
    { label: 'Raising', value: money(company.funding_goal) },
    { label: 'Minimum investment', value: money(company.min_investment) },
    { label: 'Target return', value: company.target_return },
    { label: 'Term', value: company.term },
    { label: 'Founded', value: company.founded_year ? String(company.founded_year) : null },
    { label: 'Sector', value: company.sector },
  ].filter((fact) => fact.value)

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-8">
      <div className="flex items-center gap-4">
        <CompanyCoin name={company.name} size={72} />
        <div className="min-w-0">
          <p className="hr-card-title text-[26px]">{company.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#8e8e93]">
            {company.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" strokeWidth={1.8} />{company.location}</span>}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="hr-focus inline-flex items-center gap-1 rounded text-[#c7c7cc] hover:text-white">
                <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />
                {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
              </a>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-[16px] leading-snug text-white">{company.tagline}</p>
      {company.about && <p className="hr-sub mt-3 whitespace-pre-line !text-[#aeaeb2]">{company.about}</p>}

      <div className="hr-panel mt-6 p-4">
        <Progress raised={company.amount_raised} goal={company.funding_goal} />
        <div className="mt-4"><RiskMeter risk={company.risk_level} /></div>
      </div>

      <dl className="mt-4 divide-y divide-white/[0.07] rounded-[20px] border border-white/[0.08]">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <dt className="text-[14px] text-[#8e8e93]">{fact.label}</dt>
            <dd className="text-right text-[15px] font-medium tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[12px] leading-relaxed text-[#8e8e93]">
        These details come from whoever listed the company and haven't been checked by Hoardrun. A target return is the company's own estimate, not a promise. Investing in private companies can lose you money.
      </p>

      <button disabled className="mt-6 h-12 w-full cursor-not-allowed rounded-full bg-white/10 text-[15px] font-medium text-[#8e8e93]">
        Investing opens soon
      </button>
      {company.is_owner && (
        <button onClick={onDelete} disabled={deleting} className="hr-focus mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 text-[14px] text-[#c7c7cc] hover:border-white/30 hover:text-white disabled:opacity-50">
          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
          {deleting ? 'Removing…' : 'Remove listing'}
        </button>
      )}
    </div>
  )
}

const EMPTY_FORM = {
  name: '', sector: '', tagline: '', about: '', location: '', website: '', founded_year: '',
  funding_goal: '', min_investment: '', target_return: '', term: '', risk_level: 'moderate' as Risk,
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] text-[#8e8e93]">{hint}</span>}
    </label>
  )
}

function ListCompanyForm({ initialCategory, onCreated }: { initialCategory: Category; onCreated: (company: Company) => void }) {
  const { addToast } = useToast()
  const [category, setCategory] = useState<Category>(initialCategory)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const set = (key: keyof typeof EMPTY_FORM) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    const body: Record<string, unknown> = { ...form, category }
    Object.keys(body).forEach((key) => body[key] === '' && delete body[key])
    if (body.founded_year) body.founded_year = Number(body.founded_year)
    const response = await apiClient.createOpportunity(body)
    setSaving(false)
    if (response.error || !response.data?.data) {
      setError(errorText(response.error))
      return
    }
    addToast({ title: 'Company listed', description: `${response.data.data.name} is now on the ${CATEGORIES[category].title.toLowerCase()} page.` })
    onCreated(response.data.data)
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-6">
        <p className="hr-sub">Add a company that's raising money. It shows up for everyone on Hoardrun as soon as you save it.</p>

        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Type</span>
          <div className="hr-choice" role="radiogroup" aria-label="Type">
            {(Object.keys(CATEGORIES) as Category[]).map((key) => (
              <button key={key} type="button" role="radio" aria-checked={category === key} onClick={() => setCategory(key)} className="hr-focus">
                {CATEGORIES[key].tab}
              </button>
            ))}
          </div>
        </div>

        <Field label="Company name"><input required minLength={2} maxLength={80} value={form.name} onChange={set('name')} className="hr-field" placeholder="Northwind Labs" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sector"><input required minLength={2} maxLength={60} value={form.sector} onChange={set('sector')} className="hr-field" placeholder="Logistics" /></Field>
          <Field label="Location"><input maxLength={80} value={form.location} onChange={set('location')} className="hr-field" placeholder="Accra, Ghana" /></Field>
        </div>
        <Field label="One-line pitch" hint={`${form.tagline.length}/160`}>
          <input required minLength={10} maxLength={160} value={form.tagline} onChange={set('tagline')} className="hr-field" placeholder="What the company does, in a sentence" />
        </Field>
        <Field label="About (optional)">
          <textarea maxLength={4000} rows={4} value={form.about} onChange={set('about')} className="hr-field !h-auto py-3" placeholder="Traction, team, what the money is for" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Website"><input maxLength={200} value={form.website} onChange={set('website')} className="hr-field" placeholder="northwind.com" /></Field>
          <Field label="Founded"><input type="number" min={1800} max={new Date().getFullYear()} value={form.founded_year} onChange={set('founded_year')} className="hr-field" placeholder="2021" /></Field>
        </div>

        <div className="h-px bg-white/10" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Raising (USD)"><input required type="number" min={1} step="any" value={form.funding_goal} onChange={set('funding_goal')} className="hr-field" placeholder="500000" /></Field>
          <Field label="Minimum (USD)"><input required type="number" min={1} step="any" value={form.min_investment} onChange={set('min_investment')} className="hr-field" placeholder="1000" /></Field>
          <Field label="Target return (optional)"><input maxLength={40} value={form.target_return} onChange={set('target_return')} className="hr-field" placeholder="12–18% a year" /></Field>
          <Field label="Term (optional)"><input maxLength={40} value={form.term} onChange={set('term')} className="hr-field" placeholder="3–5 years" /></Field>
        </div>

        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Risk</span>
          <div className="hr-choice" role="radiogroup" aria-label="Risk">
            {RISKS.map((risk) => (
              <button key={risk.value} type="button" role="radio" aria-checked={form.risk_level === risk.value} onClick={() => setForm((current) => ({ ...current, risk_level: risk.value }))} className="hr-focus">
                {risk.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p role="alert" className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-[14px]">{error}</p>}
      </div>

      <div className="border-t border-white/[0.08] px-5 py-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <button type="submit" disabled={saving} className="hr-focus h-12 w-full rounded-full bg-white text-[15px] font-medium text-black disabled:opacity-60">
          {saving ? 'Listing…' : 'List company'}
        </button>
      </div>
    </form>
  )
}

export function InvestmentOpportunitiesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const param = searchParams?.get('category') as Category | null
  const category: Category = param && param in CATEGORIES ? param : 'private-equity'
  const meta = CATEGORIES[category]

  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Company | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async (search: string) => {
    const response = await apiClient.getOpportunities({ category, q: search.trim() || undefined })
    if (response.error || !response.data) {
      setFailed(true)
    } else {
      setFailed(false)
      setCompanies(response.data.data ?? [])
    }
    setLoading(false)
  }, [category])

  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => load(query), query ? 250 : 0)
    return () => window.clearTimeout(timer)
  }, [load, query])

  const removeSelected = async () => {
    if (!selected) return
    setDeleting(true)
    const response = await apiClient.deleteOpportunity(selected.id)
    setDeleting(false)
    if (response.error) {
      addToast({ title: "Couldn't remove listing", description: errorText(response.error), variant: 'destructive' })
      return
    }
    setCompanies((current) => current.filter((company) => company.id !== selected.id))
    setSelected(null)
    addToast({ title: 'Listing removed', description: `${selected.name} is no longer listed.` })
  }

  const onCreated = (company: Company) => {
    setCreating(false)
    setQuery('')
    if (company.category !== category) router.push(`/investment-opportunities?category=${company.category}`)
    else setCompanies((current) => [company, ...current.filter((item) => item.id !== company.id)])
  }

  const Graphic = meta.Graphic

  return (
    <motion.div className="space-y-5 sm:space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
      <div>
        <Link href="/investment" className="hr-focus -ml-1 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[14px] text-[#a1a1a6] hover:text-white">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Investments
        </Link>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="hr-title">{meta.title}</h1>
            <p className="hr-sub mt-2">{meta.description}</p>
          </div>
          <button onClick={() => setCreating(true)} className="hr-focus hidden h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-medium text-black sm:inline-flex">
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            List a company
          </button>
        </div>
      </div>

      <nav className="hr-section-nav hr-section-nav-static" aria-label="Investment types">
        {(Object.keys(CATEGORIES) as Category[]).map((key) => (
          <Link key={key} href={`/investment-opportunities?category=${key}`} aria-current={key === category ? 'true' : undefined} className="hr-section-tab hr-focus flex items-center justify-center" replace>
            {key === category && <motion.span layoutId="hr-opportunity-lens" className="lp-glass-lens absolute inset-0 rounded-full" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="relative">{CATEGORIES[key].tab}</span>
          </Link>
        ))}
      </nav>

      <div className="flex gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search companies</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" strokeWidth={2} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, sector or place" className="hr-field !h-11 !rounded-full !pl-10" />
        </label>
        <button onClick={() => setCreating(true)} className="hr-round hr-focus !h-11 !w-11 sm:!hidden" aria-label="List a company">
          <Plus className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      {failed ? (
        <div role="alert" className="hr-panel px-5 py-4 text-sm">We couldn't load companies. Please try again in a moment.</div>
      ) : loading && companies.length === 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((key) => <li key={key} className="hr-skeleton h-[300px] !rounded-[24px]" />)}
        </ul>
      ) : companies.length === 0 ? (
        <section className="hr-promo !min-h-[260px]">
          <Graphic className="hr-promo-art" />
          <div className="relative max-w-[62%] sm:max-w-[68%]">
            <h2 className="hr-card-title text-[24px] sm:text-[28px]">{query ? 'No matches' : `No ${meta.noun} yet`}</h2>
            <p className="hr-sub mt-2 !text-[#aeaeb2]">
              {query ? `Nothing listed here matches “${query.trim()}”.` : 'Companies show up here once someone lists them. Raising money? Be the first.'}
            </p>
            {!query && (
              <button onClick={() => setCreating(true)} className="hr-focus mt-5 inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-medium text-black">
                <Plus className="h-4 w-4" strokeWidth={2.4} />
                List a company
              </button>
            )}
          </div>
        </section>
      ) : (
        <>
          <p className="text-[13px] text-[#8e8e93]">{companies.length} {companies.length === 1 ? 'company' : 'companies'}</p>
          <ul className="grid gap-4 md:grid-cols-2">
            {companies.map((company) => (
              <li key={company.id} className="min-w-0">
                <CompanyCard company={company} onOpen={() => setSelected(company)} />
              </li>
            ))}
          </ul>
        </>
      )}

      <Sheet open={!!selected} onClose={() => setSelected(null)} label="Company details">
        <SheetHeader title="Company" onClose={() => setSelected(null)} />
        {selected && <CompanyDetails company={selected} onDelete={removeSelected} deleting={deleting} />}
      </Sheet>

      <Sheet open={creating} onClose={() => setCreating(false)} label="List a company">
        <SheetHeader title="List a company" onClose={() => setCreating(false)} />
        <ListCompanyForm initialCategory={category} onCreated={onCreated} />
      </Sheet>
    </motion.div>
  )
}
