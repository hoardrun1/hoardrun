'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, BookOpen, Building, Check, Cpu, CreditCard, Factory, HeartPulse,
  ShieldCheck, ShoppingBag, Truck, Wrench, Zap,
} from 'lucide-react'
import { z } from 'zod'
import {
  BarsGraphic, HeadquartersGraphic, PieGraphic, RocketGraphic, SealedDocumentGraphic, ShieldGraphic,
} from '@/components/app/home-graphics'
import { CompanyCoin } from '@/components/investment-opportunities-page'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'

const businessTypes = [
  { value: 'tech', label: 'Technology', icon: Cpu },
  { value: 'fintech', label: 'Fintech', icon: CreditCard },
  { value: 'healthcare', label: 'Health', icon: HeartPulse },
  { value: 'retail', label: 'Retail', icon: ShoppingBag },
  { value: 'education', label: 'Education', icon: BookOpen },
  { value: 'energy', label: 'Energy', icon: Zap },
  { value: 'transportation', label: 'Logistics', icon: Truck },
  { value: 'manufacturing', label: 'Industrial', icon: Factory },
  { value: 'real-estate', label: 'Real estate', icon: Building },
  { value: 'other', label: 'Other', icon: Wrench },
]

const shareTypes = [
  { value: 'ordinary', label: 'Ordinary', description: 'Standard equity with voting rights' },
  { value: 'preference', label: 'Preference', description: 'Paid first on dividends and exit' },
  { value: 'real-estate', label: 'Property-backed', description: 'Shares secured on real estate' },
]

const STANDARD_DISCLAIMER =
  'Investing in early-stage companies is risky. You could lose all the money you invest, shares may be hard to sell, and returns are not guaranteed. This listing is not financial advice.'

const steps = [
  { title: 'Company', description: 'What you do', heading: 'Tell us about your company', Graphic: HeadquartersGraphic, fields: ['companyName', 'businessType', 'description', 'missionStatement'] },
  { title: 'Verification', description: 'Registration details', heading: 'Verify the company', Graphic: ShieldGraphic, fields: ['registrationNumber', 'incorporationDate', 'jurisdiction'] },
  { title: 'Financials', description: 'Revenue and valuation', heading: 'Share your numbers', Graphic: BarsGraphic, fields: ['valuation', 'annualRevenue'] },
  { title: 'Investment', description: 'Shares and goal', heading: 'Set up the raise', Graphic: PieGraphic, fields: ['shareType', 'sharesOffered', 'pricePerShare', 'fundraisingGoal'] },
  { title: 'Legal', description: 'Risks and terms', heading: 'Before you go live', Graphic: SealedDocumentGraphic, fields: ['risks', 'legalDisclaimer', 'termsAccepted'] },
] as const

const positive = (message: string) => z.string().refine((value) => Number(value) > 0, message)

const schema = z.object({
  companyName: z.string().trim().min(2, 'Enter your company name').max(80, 'Keep the name under 80 characters'),
  businessType: z.string().min(1, 'Pick what your company does'),
  description: z.string().trim().min(50, 'Write at least 50 characters'),
  missionStatement: z.string().trim().min(20, 'Write at least 20 characters'),
  registrationNumber: z.string().trim().min(5, 'Enter your registration number'),
  incorporationDate: z.string().min(1, 'Pick the date you incorporated'),
  jurisdiction: z.string().trim().min(2, 'Enter where the company is registered'),
  valuation: positive('Enter your valuation'),
  annualRevenue: z.string().refine((value) => value !== '' && Number(value) >= 0, 'Enter your revenue, or 0'),
  shareType: z.string().min(1, 'Pick a share type'),
  sharesOffered: positive('Enter how many shares you are offering'),
  pricePerShare: z.string().refine((value) => Number(value) >= 10, 'The lowest price per share is $10'),
  fundraisingGoal: positive('Enter how much you are raising'),
  risks: z.string().trim().min(50, 'Describe the main risks in at least 50 characters'),
  legalDisclaimer: z.string().trim().min(100, 'The disclaimer needs at least 100 characters'),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: 'Accept the terms to list your startup' }) }),
})

type FormState = {
  companyName: string; businessType: string; description: string; missionStatement: string; website: string
  registrationNumber: string; incorporationDate: string; jurisdiction: string
  valuation: string; annualRevenue: string
  shareType: string; sharesOffered: string; pricePerShare: string; fundraisingGoal: string; fundUse: string
  risks: string; legalDisclaimer: string; termsAccepted: boolean
}

const EMPTY: FormState = {
  companyName: '', businessType: '', description: '', missionStatement: '', website: '',
  registrationNumber: '', incorporationDate: '', jurisdiction: '',
  valuation: '', annualRevenue: '',
  shareType: '', sharesOffered: '', pricePerShare: '10', fundraisingGoal: '', fundUse: '',
  risks: '', legalDisclaimer: '', termsAccepted: false,
}

const money = (value: number, compact = false) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: compact ? 1 : 0, notation: compact ? 'compact' : 'standard' }).format(value)

function Field({ label, error, hint, className = '', children }: { label: string; error?: string; hint?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium text-[#c7c7cc]">
        {label}
        {hint && <span className="text-[12px] font-normal text-[#8e8e93]">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-[12.5px] text-[#ff9f95]">{error}</span>}
    </label>
  )
}

/** How much of the company the raise buys, drawn as a ring. */
function EquityRing({ share }: { share: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(share, 0), 1)
  return (
    <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id="hr-equity" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5aa9ff" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
      <motion.circle
        cx="70" cy="70" r={radius} fill="none" stroke="url(#hr-equity)" strokeWidth="16" strokeLinecap="round"
        transform="rotate(-90 70 70)"
        initial={false}
        animate={{ strokeDasharray: `${circumference * clamped} ${circumference}` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
      <text x="70" y="68" textAnchor="middle" className="fill-white" style={{ font: '600 24px var(--font-display), sans-serif', letterSpacing: '-0.04em' }}>
        {clamped > 0 ? `${(clamped * 100).toFixed(clamped < 0.1 ? 1 : 0)}%` : '—'}
      </text>
      <text x="70" y="88" textAnchor="middle" style={{ font: '400 11px var(--font-text), sans-serif', fill: '#8e8e93' }}>of the company</text>
    </svg>
  )
}

function Preview({ form }: { form: FormState }) {
  const type = businessTypes.find((item) => item.value === form.businessType)
  const goal = Number(form.fundraisingGoal) || 0
  return (
    <div className="hr-company pointer-events-none !p-5">
      <span className="hr-company-glow" aria-hidden="true" />
      <div className="relative flex items-center gap-4">
        <CompanyCoin name={form.companyName || 'Your company'} size={52} />
        <div className="min-w-0">
          <p className="hr-card-title truncate text-[19px]">{form.companyName || 'Your company'}</p>
          <p className="truncate text-[13px] text-[#8e8e93]">{[type?.label ?? 'Sector', form.jurisdiction || 'Location'].join(' · ')}</p>
        </div>
      </div>
      <p className="relative mt-4 line-clamp-3 text-[14px] leading-snug text-[#d1d1d6]">
        {form.description || 'Your one-line pitch shows here as you write it.'}
      </p>
      <dl className="relative mt-4 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-[12px] text-[#8e8e93]">Raising</dt>
          <dd className="hr-figure text-[18px]">{goal ? money(goal, true) : '—'}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-[#8e8e93]">Minimum</dt>
          <dd className="hr-figure text-[18px]">{Number(form.pricePerShare) ? money(Number(form.pricePerShare)) : '—'}</dd>
        </div>
      </dl>
      <div className="relative mt-4 h-1.5 rounded-full bg-white/10" />
      <p className="relative mt-2 text-[12px] text-[#8e8e93]">$0 raised</p>
    </div>
  )
}

export function StartupRegistrationPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }
  const text = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(key, event.target.value as never)

  const validate = (index: number) => {
    const fields = steps[index].fields
    const result = schema.pick(Object.fromEntries(fields.map((field) => [field, true])) as any).safeParse(form)
    if (result.success) {
      setErrors({})
      return true
    }
    const found: Record<string, string> = {}
    result.error.errors.forEach((issue) => {
      const field = String(issue.path[0])
      found[field] ??= issue.message
    })
    setErrors(found)
    return false
  }

  const goTo = (index: number) => {
    if (index > step) {
      for (let check = step; check < index; check++) {
        if (!validate(check)) {
          setDirection(1)
          setStep(check)
          return
        }
      }
    }
    setDirection(index > step ? 1 : -1)
    setStep(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async () => {
    for (let index = 0; index < steps.length; index++) {
      if (!validate(index)) {
        setStep(index)
        return
      }
    }
    setSubmitting(true)
    const category = form.shareType === 'real-estate' || form.businessType === 'real-estate' ? 'real-estate' : 'private-equity'
    const sector = businessTypes.find((type) => type.value === form.businessType)?.label ?? form.businessType
    const description = form.description.trim()
    const about = [
      description,
      `Mission: ${form.missionStatement.trim()}`,
      form.fundUse.trim() && `Use of funds: ${form.fundUse.trim()}`,
      `Risks: ${form.risks.trim()}`,
    ].filter(Boolean).join('\n\n').slice(0, 4000)

    const response = await apiClient.createOpportunity({
      name: form.companyName.trim(),
      category,
      sector,
      tagline: description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description,
      about,
      location: form.jurisdiction.trim() || undefined,
      website: form.website.trim() || undefined,
      founded_year: Number(form.incorporationDate.slice(0, 4)) || undefined,
      funding_goal: Number(form.fundraisingGoal),
      // The smallest amount anyone can put in is one share
      min_investment: Number(form.pricePerShare),
      risk_level: 'high',
    })
    setSubmitting(false)

    if (response.error || !response.data?.data) {
      addToast({ title: "Couldn't list your startup", description: typeof response.error === 'string' ? response.error : 'Please try again.', variant: 'destructive' })
      return
    }
    addToast({ title: 'Sent for approval', description: `Hoardrun will review ${response.data.data.name}. Once approved it appears on the ${category === 'real-estate' ? 'real estate' : 'private equity'} page and people can invest.` })
    router.push(`/investment-opportunities?category=${category}`)
  }

  const goal = Number(form.fundraisingGoal) || 0
  const valuation = Number(form.valuation) || 0
  const price = Number(form.pricePerShare) || 0
  const shares = Number(form.sharesOffered) || 0
  const equity = goal > 0 && valuation > 0 ? goal / (valuation + goal) : 0
  const sharesTotal = shares * price
  const current = steps[step]
  const last = step === steps.length - 1

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <Link href="/investment" className="hr-focus -ml-1 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[14px] text-[#a1a1a6] hover:text-white">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Investments
          </Link>
          <h1 className="hr-title mt-2">Register your startup</h1>
          <p className="hr-sub mt-2">Five short steps. Your listing goes live on Hoardrun as soon as you finish.</p>
        </div>
        <div className="hr-hero-art hidden sm:block" aria-hidden="true">
          <RocketGraphic className="relative h-24 w-24 drop-shadow-[0_14px_24px_rgba(0,0,0,0.85)]" />
        </div>
      </div>

      {/* Phones and tablets: a compact progress strip */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[#8e8e93]">Step {step + 1} of {steps.length}</span>
          <span className="font-medium">{current.title}</span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {steps.map((item, index) => (
            <button key={item.title} onClick={() => goTo(index)} className="hr-focus h-1.5 rounded-full transition-colors" style={{ background: index <= step ? '#fff' : 'rgba(255,255,255,0.12)' }} aria-label={`Go to ${item.title}`} />
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        {/* Desktop: step rail */}
        <nav className="hidden lg:block" aria-label="Registration steps">
          <ol className="sticky top-6 space-y-1">
            {steps.map((item, index) => {
              const state = index < step ? 'done' : index === step ? 'current' : 'next'
              return (
                <li key={item.title}>
                  <button onClick={() => goTo(index)} className="hr-step hr-focus" data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
                    <span className="hr-step-art" aria-hidden="true">
                      <item.Graphic className="h-8 w-8" />
                      {state === 'done' && (
                        <span className="hr-step-done"><Check className="h-2.5 w-2.5" strokeWidth={3.4} /></span>
                      )}
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-[14px] font-medium">{item.title}</span>
                      <span className="block truncate text-[12px] text-[#8e8e93]">{item.description}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        {/* The current step */}
        <section className="hr-panel min-w-0 p-5 sm:p-6" aria-labelledby="hr-step-title">
          <div className="hr-step-head">
            <div className="min-w-0">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8e8e93]">Step {step + 1} · {current.title}</p>
              <h2 id="hr-step-title" className="hr-section-title mt-1 !text-[24px] sm:!text-[28px]">{current.heading}</h2>
              <p className="mt-1 text-[13.5px] text-[#a1a1a6]">{current.description}</p>
            </div>
            <div className="hr-step-stage" aria-hidden="true">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.6, rotate: -12, y: 10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 12, y: -10 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="hr-float"
                >
                  <current.Graphic className="h-full w-full" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
              className="space-y-4"
            >
              {step === 0 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Company name" error={errors.companyName}>
                      <input value={form.companyName} onChange={text('companyName')} maxLength={80} className="hr-field" placeholder="Northwind Labs" />
                    </Field>
                    <Field label="Website" hint="Optional">
                      <input value={form.website} onChange={text('website')} maxLength={200} className="hr-field" placeholder="northwind.com" />
                    </Field>
                  </div>
                  <div>
                    <span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">What does it do?</span>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-5" role="radiogroup" aria-label="Business type">
                      {businessTypes.map((type) => (
                        <button key={type.value} type="button" role="radio" aria-checked={form.businessType === type.value} onClick={() => update('businessType', type.value)} className="hr-chip hr-focus">
                          <type.icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                          <span className="truncate">{type.label}</span>
                        </button>
                      ))}
                    </div>
                    {errors.businessType && <span className="mt-1.5 block text-[12.5px] text-[#ff9f95]">{errors.businessType}</span>}
                  </div>
                  <Field label="Pitch" error={errors.description} hint={`${form.description.trim().length}/50 minimum`}>
                    <textarea value={form.description} onChange={text('description')} rows={2} maxLength={1000} className="hr-field !h-auto resize-none py-3" placeholder="What you make, who it's for and why it matters" />
                  </Field>
                  <Field label="Mission" error={errors.missionStatement}>
                    <input value={form.missionStatement} onChange={text('missionStatement')} maxLength={300} className="hr-field" placeholder="Where you're headed, in a sentence" />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Registration number" error={errors.registrationNumber}>
                      <input value={form.registrationNumber} onChange={text('registrationNumber')} maxLength={40} className="hr-field" placeholder="CS123456789" />
                    </Field>
                    <Field label="Incorporated on" error={errors.incorporationDate}>
                      <input type="date" value={form.incorporationDate} max={new Date().toISOString().slice(0, 10)} onChange={text('incorporationDate')} className="hr-field" />
                    </Field>
                  </div>
                  <Field label="Registered in" error={errors.jurisdiction}>
                    <input value={form.jurisdiction} onChange={text('jurisdiction')} maxLength={80} className="hr-field" placeholder="Accra, Ghana" />
                  </Field>
                  <p className="flex gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-[13px] leading-snug text-[#a1a1a6]">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-white" strokeWidth={2} />
                    Hoardrun doesn't check registration details yet, so investors will see your listing marked as unverified.
                  </p>
                </>
              )}

              {step === 2 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Valuation (USD)" error={errors.valuation} hint="Before this raise">
                    <input type="number" min={1} step="any" value={form.valuation} onChange={text('valuation')} className="hr-field" placeholder="2000000" />
                  </Field>
                  <Field label="Revenue last 12 months (USD)" error={errors.annualRevenue}>
                    <input type="number" min={0} step="any" value={form.annualRevenue} onChange={text('annualRevenue')} className="hr-field" placeholder="0" />
                  </Field>
                  {valuation > 0 && (
                    <div className="hr-metric sm:col-span-2">
                      <span className="text-[13px] text-[#8e8e93]">Valued at</span>
                      <span className="hr-figure text-[30px]">{money(valuation, true)}</span>
                      {Number(form.annualRevenue) > 0 && <span className="text-[13px] text-[#8e8e93]">{(valuation / Number(form.annualRevenue)).toFixed(1)}× revenue</span>}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <>
                  <div>
                    <span className="mb-1.5 block text-[13px] font-medium text-[#c7c7cc]">Share type</span>
                    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Share type">
                      {shareTypes.map((type) => (
                        <button key={type.value} type="button" role="radio" aria-checked={form.shareType === type.value} onClick={() => update('shareType', type.value)} className="hr-option hr-focus">
                          <span className="block text-[14px] font-medium">{type.label}</span>
                          <span className="mt-0.5 block text-[12px] leading-snug opacity-70">{type.description}</span>
                        </button>
                      ))}
                    </div>
                    {errors.shareType && <span className="mt-1.5 block text-[12.5px] text-[#ff9f95]">{errors.shareType}</span>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Raising (USD)" error={errors.fundraisingGoal}>
                      <input type="number" min={1} step="any" value={form.fundraisingGoal} onChange={text('fundraisingGoal')} className="hr-field" placeholder="500000" />
                    </Field>
                    <Field label="Shares offered" error={errors.sharesOffered}>
                      <input type="number" min={1} step={1} value={form.sharesOffered} onChange={text('sharesOffered')} className="hr-field" placeholder="50000" />
                    </Field>
                    <Field label="Price per share" error={errors.pricePerShare}>
                      <input type="number" min={10} step="any" value={form.pricePerShare} onChange={text('pricePerShare')} className="hr-field" placeholder="10" />
                    </Field>
                  </div>
                  <div className="hr-metric items-center gap-4 text-center sm:!flex-row sm:gap-5 sm:text-left">
                    <EquityRing share={equity} />
                    <div className="min-w-0 space-y-1.5 text-[13px] text-[#a1a1a6]">
                      <p className="text-[15px] text-white">{equity > 0 ? `Raising ${money(goal, true)} gives investors about ${(equity * 100).toFixed(1)}% of the company.` : 'Add your raise and valuation to see how much of the company you are offering.'}</p>
                      {sharesTotal > 0 && goal > 0 && Math.abs(sharesTotal - goal) > 1 && (
                        <p>{shares.toLocaleString()} shares at {money(price)} is {money(sharesTotal)}, which doesn't match your goal.</p>
                      )}
                      {price > 0 && <p>The smallest investment is one share: {money(price)}.</p>}
                    </div>
                  </div>
                  <Field label="Use of funds" hint="Optional">
                    <input value={form.fundUse} onChange={text('fundUse')} maxLength={300} className="hr-field" placeholder="Hiring, inventory, marketing…" />
                  </Field>
                </>
              )}

              {step === 4 && (
                <>
                  <Field label="Main risks" error={errors.risks} hint={`${form.risks.trim().length}/50 minimum`}>
                    <textarea value={form.risks} onChange={text('risks')} rows={3} maxLength={2000} className="hr-field !h-auto resize-none py-3" placeholder="What could go wrong: competition, funding, regulation, key people" />
                  </Field>
                  <Field
                    label="Disclaimer"
                    error={errors.legalDisclaimer}
                    hint={
                      <button type="button" onClick={() => update('legalDisclaimer', STANDARD_DISCLAIMER)} className="hr-focus rounded text-[12px] font-medium text-white underline underline-offset-2">
                        Use standard wording
                      </button>
                    }
                  >
                    <textarea value={form.legalDisclaimer} onChange={text('legalDisclaimer')} rows={3} maxLength={2000} className="hr-field !h-auto resize-none py-3" placeholder="What investors should understand before putting money in" />
                  </Field>
                  <button type="button" role="checkbox" aria-checked={form.termsAccepted} onClick={() => update('termsAccepted', !form.termsAccepted)} className="hr-check hr-focus">
                    <span className="hr-check-box" aria-hidden="true">{form.termsAccepted && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
                    <span className="text-left">I'm authorised to list this company, the details are accurate, and I accept Hoardrun's terms and privacy policy.</span>
                  </button>
                  {errors.termsAccepted && <span className="block text-[12.5px] text-[#ff9f95]">{errors.termsAccepted}</span>}
                  <div className="xl:hidden">
                    <p className="mb-2 text-[13px] font-medium text-[#c7c7cc]">How investors will see it</p>
                    <Preview form={form} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="hr-wizard-actions">
            <button onClick={() => goTo(step - 1)} disabled={step === 0} className="hr-focus inline-flex h-12 items-center gap-1.5 rounded-full border border-white/15 px-5 text-[15px] font-medium disabled:opacity-0">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Back
            </button>
            {last ? (
              <button onClick={submit} disabled={submitting} className="hr-focus inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-6 text-[15px] font-medium text-black disabled:opacity-60 sm:flex-none">
                {submitting ? 'Listing…' : 'List my startup'}
              </button>
            ) : (
              <button onClick={() => goTo(step + 1)} className="hr-focus inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-6 text-[15px] font-medium text-black sm:flex-none">
                Continue
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </section>

        {/* Wide screens: live preview */}
        <aside className="hidden xl:block">
          <div className="sticky top-6">
            <p className="mb-2 text-[13px] font-medium text-[#c7c7cc]">How investors will see it</p>
            <Preview form={form} />
            <p className="mt-3 text-[12px] leading-relaxed text-[#8e8e93]">This updates as you type. Nothing is published until you finish the last step.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
