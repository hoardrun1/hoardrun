'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Plus, Wallet } from 'lucide-react'
import {
  BarsGraphic, BriefcaseGraphic, EmptyChart, HexCoinGraphic, OrbsGraphic, PieGraphic,
  RocketGraphic, ShieldGraphic, TowerGraphic,
} from '@/components/app/home-graphics'
import { DepositModal } from '@/components/deposit-modal'
import { apiClient } from '@/lib/api-client'

type Risk = 'Low' | 'Moderate' | 'High' | 'Very High'

const RISK_LEVEL: Record<Risk, number> = { Low: 1, Moderate: 2, High: 3, 'Very High': 4 }

const categories: {
  id: string
  title: string
  description: string
  risk: Risk
  Graphic: (props: { className?: string }) => JSX.Element
  href?: string
}[] = [
  { id: 'private-equity', title: 'Private Equity', description: 'High-growth private companies', risk: 'High', Graphic: BriefcaseGraphic, href: '/investment-opportunities?category=private-equity' },
  { id: 'real-estate', title: 'Real Estate', description: 'Income from property', risk: 'Moderate', Graphic: TowerGraphic, href: '/investment-opportunities?category=real-estate' },
  { id: 'bonds', title: 'Fixed Income', description: 'Regular interest payments', risk: 'Low', Graphic: ShieldGraphic, href: '/investment-opportunities?category=fixed-income' },
  { id: 'etfs', title: 'ETFs', description: 'Diversified market exposure', risk: 'Low', Graphic: PieGraphic, href: '/etfs' },
  { id: 'venture-capital', title: 'Venture Capital', description: 'Buy shares in startup funds', risk: 'Very High', Graphic: RocketGraphic, href: '/venture-capital' },
  { id: 'crypto', title: 'Cryptocurrency', description: 'Digital assets, traded 24/7', risk: 'Very High', Graphic: HexCoinGraphic, href: '/crypto' },
]

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'options', label: 'Options' },
  { id: 'startups', label: 'Startups' },
  { id: 'circles', label: 'Circles' },
]

type Summary = {
  total_value?: string | number
  total_gain_loss?: string | number
  total_gain_loss_percent?: string | number
  day_change?: string | number
  cash_available?: string | number
  total_portfolios?: number
}

const money = (value: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
const signedPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

function RiskMeter({ risk }: { risk: Risk }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-[#a1a1a6]">
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => (
          <span key={level} className={`h-1.5 w-3 rounded-full ${level <= RISK_LEVEL[risk] ? 'bg-white' : 'bg-white/15'}`} />
        ))}
      </span>
      {risk} risk
    </span>
  )
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="hr-section-title">{title}</h2>
      <p className="hr-sub mt-1">{description}</p>
    </div>
  )
}

export function InvestmentPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const scrollingTo = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false
    apiClient.getInvestmentSummary().then((response) => {
      if (cancelled) return
      if (response.error || !response.data) setFailed(true)
      else setSummary(response.data)
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Keeps the section pill in step with what's on screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingTo.current) return
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    sections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [])

  const goTo = (id: string) => {
    setActiveSection(id)
    if (scrollingTo.current) window.clearTimeout(scrollingTo.current)
    scrollingTo.current = window.setTimeout(() => {
      scrollingTo.current = null
    }, 800)
    const top = (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + window.scrollY - 124
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const value = Number(summary?.total_value) || 0
  const gain = Number(summary?.total_gain_loss) || 0
  const gainPercent = Number(summary?.total_gain_loss_percent) || 0
  const [whole, cents] = money(value).split('.')

  const stats = [
    { label: 'Total return', value: money(gain), note: signedPercent(gainPercent) },
    { label: 'Today', value: money(Number(summary?.day_change) || 0) },
    { label: 'Cash to invest', value: money(Number(summary?.cash_available) || 0) },
    { label: 'Portfolios', value: String(summary?.total_portfolios ?? 0) },
  ]

  return (
    <motion.div className="space-y-5 sm:space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
      <h1 className="hr-title">Investments</h1>

      <nav className="hr-section-nav" aria-label="Sections">
        {sections.map((section) => (
          <button key={section.id} onClick={() => goTo(section.id)} aria-current={activeSection === section.id ? 'true' : undefined} className="hr-section-tab hr-focus">
            {activeSection === section.id && (
              <motion.span layoutId="hr-section-lens" className="lp-glass-lens absolute inset-0 rounded-full" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">{section.label}</span>
          </button>
        ))}
      </nav>

      {failed && (
        <div role="alert" className="hr-panel px-5 py-4 text-sm">We couldn't load your portfolio. Please try again in a moment.</div>
      )}

      {/* Overview */}
      <div id="overview" className="grid scroll-mt-32 gap-4 sm:gap-5 lg:grid-cols-12">
        <section className="hr-balance lg:col-span-8">
          <div aria-hidden="true" className="lp-eclipse hr-eclipse lg:hidden" />
          <div className="relative px-5 pt-8 text-center lg:p-6 lg:pb-3 lg:text-left">
            <p className="text-sm text-[#a1a1a6]">Portfolio value</p>
            {isLoading ? (
              <div className="hr-skeleton mx-auto mt-2 h-14 w-56 lg:mx-0" />
            ) : (
              <p className="mt-1 hr-figure text-[60px] leading-none lg:text-[56px]">
                {whole}
                {cents && <span className="text-[0.46em] text-[#a1a1a6]">.{cents}</span>}
              </p>
            )}
            <p className="mx-auto mt-3 max-w-[280px] text-[13px] leading-snug text-[#a1a1a6] lg:mx-0 lg:max-w-none">
              {value > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  <span className="text-white">{signedPercent(gainPercent)}</span> all time
                </span>
              ) : (
                'Once you start investing, your performance will appear here.'
              )}
            </p>
          </div>
          <div className="hidden px-6 pb-5 lg:block">
            <EmptyChart label="Performance over time will show here" />
          </div>
          <div className="relative flex justify-center gap-2 px-4 pb-7 pt-24 lg:hidden">
            <button onClick={() => setIsDepositModalOpen(true)} className="hr-pill hr-focus !h-11 !px-5" data-primary="true">
              <Wallet className="h-4 w-4" strokeWidth={2} />
              Deposit
            </button>
            <button onClick={() => goTo('options')} className="hr-pill hr-focus !h-11 !px-5">
              Explore
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </section>

        <div className="grid gap-4 sm:gap-5 lg:col-span-4">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-2">
            {stats.map((stat) => (
              <li key={stat.label} className="hr-panel flex min-w-0 flex-col justify-between gap-3 p-4">
                <span className="truncate text-[13px] text-[#a1a1a6]">{stat.label}</span>
                {isLoading ? (
                  <span className="hr-skeleton block h-6 w-16" />
                ) : (
                  <span className="min-w-0">
                    <span className="hr-figure block truncate text-[22px] leading-tight">{stat.value}</span>
                    {stat.note && <span className="block text-[12px] tabular-nums text-[#a1a1a6]">{stat.note}</span>}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <section className="hr-promo !hidden lg:!flex">
            <BarsGraphic className="hr-promo-art" />
            <div className="relative max-w-[66%]">
              <h2 className="hr-card-title text-[22px]">Put your money to work</h2>
              <button onClick={() => setIsDepositModalOpen(true)} className="hr-focus mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-black">
                <Wallet className="h-4 w-4" strokeWidth={2} />
                Deposit
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Investment options */}
      <section id="options" className="scroll-mt-32">
        <SectionHeading title="Investment options" description="Ways to grow your money, by risk." />
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {categories.map(({ id, title, description, risk, Graphic, href }) => {
            const content = (
              <>
                <span className="hr-collection-glow" aria-hidden="true" />
                <Graphic className="hr-collection-art" />
                <span className="hr-card-title relative block text-[18px] sm:text-[20px]">{title}</span>
                <span className="relative mt-1 block text-[13.5px] leading-snug text-[#8e8e93]">{description}</span>
                <span className="relative mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-2.5">
                  <RiskMeter risk={risk} />
                  {!href && <span className="text-[12px] font-medium text-white">Coming soon</span>}
                </span>
              </>
            )
            return (
              <li key={id} className="min-w-0">
                {href ? (
                  <Link href={href} className="hr-collection hr-focus">{content}</Link>
                ) : (
                  <div className="hr-collection hr-collection-soon">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {/* Startups */}
      <section id="startups" className="scroll-mt-32">
        <SectionHeading title="Startups" description="Early-stage companies raising money." />
        <div className="hr-promo">
          <RocketGraphic className="hr-promo-art" />
          <div className="relative max-w-[62%] sm:max-w-[70%]">
            <h3 className="hr-card-title text-[23px] sm:text-[26px]">No startups yet</h3>
            <p className="hr-sub mt-2 !text-[#aeaeb2]">Raising money? Be one of the first to list your company.</p>
            <Link href="/startupregistration" className="hr-focus mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-black">
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              Register your startup
            </Link>
          </div>
        </div>
      </section>

      {/* Circles */}
      <section id="circles" className="scroll-mt-32">
        <SectionHeading title="Circles" description="Invest together with people you trust." />
        <div className="hr-promo">
          <OrbsGraphic className="hr-promo-art" />
          <div className="relative max-w-[62%] sm:max-w-[70%]">
            <h3 className="hr-card-title text-[23px] sm:text-[26px]">Invest as a group</h3>
            <p className="hr-sub mt-2 !text-[#aeaeb2]">Pool money, vote with your stake, and own your share of everything the circle buys.</p>
            <Link href="/circles" className="hr-focus mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-black">
              Open circles
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      <DepositModal open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen} />
    </motion.div>
  )
}
