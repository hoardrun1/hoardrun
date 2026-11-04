"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react"

import { BarsGraphic, CoinsGraphic, EmptyChart, GemGraphic, ReceiptStack, TargetGraphic, VaultGraphic } from "@/components/app/home-graphics"
import { DepositModal } from "@/components/deposit-modal"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api-client"
import { useApiCache } from "@/lib/api-cache"

type Money = { amount?: number | string; currency?: string } | number | string | null | undefined

type ActivityItem = {
  transaction_id?: string
  amount?: Money
  type?: string
  merchant?: string | null
  category?: string | null
  date?: string
  status?: string
}

type DashboardSummary = {
  financial_summary?: {
    balances?: { total_balance?: Money; available_balance?: Money; net_worth?: Money }
    assets?: { investments?: Money; savings?: Money }
  }
  recent_activity?: ActivityItem[]
  quick_stats?: { monthly_spending?: Money }
}

type SavingsGoal = {
  id?: string
  goal_id?: string
  name?: string
  title?: string
  currentAmount?: number
  targetAmount?: number
  isCompleted?: boolean
}

const toNumber = (value: Money): number => {
  const raw = typeof value === "object" && value !== null ? value.amount : value
  const parsed = Number(raw ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const isIncoming = (item: ActivityItem) => {
  if (toNumber(item.amount) < 0) return false
  return /deposit|credit|income|receiv|refund/i.test(item.type ?? "")
}

function formatParts(value: number, currency: string) {
  const parts = new Intl.NumberFormat(undefined, { style: "currency", currency }).formatToParts(value)
  const fraction = parts.find((part) => part.type === "fraction")?.value
  const whole = parts
    .filter((part) => part.type !== "decimal" && part.type !== "fraction")
    .map((part) => part.value)
    .join("")
  return { whole, fraction }
}

/** Running balance over recent activity. Returns nothing until there are two real points to draw. */
function useBalanceSeries(activity: ActivityItem[], balance: number) {
  return useMemo(() => {
    const dated = activity
      .filter((item) => item.date)
      .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime())
    if (dated.length < 2) return null
    const points = [balance]
    for (let i = dated.length - 1; i >= 0; i--) {
      const amount = Math.abs(toNumber(dated[i].amount))
      points.unshift(points[0] + (isIncoming(dated[i]) ? -amount : amount))
    }
    return points
  }, [activity, balance])
}

/** Cents sit smaller than the whole amount, so long lists of money stay easy to scan. */
function Money({ value, currency }: { value: number; currency: string }) {
  const { whole, fraction } = formatParts(value, currency)
  return (
    <span className="hr-figure">
      {whole}
      {fraction && <span className="text-[0.72em] text-[#a1a1a6]">.{fraction}</span>}
    </span>
  )
}

const CHART_WIDTH = 600
const CHART_HEIGHT = 170

function BalanceChart({ points }: { points: number[] }) {
  const min = Math.min(...points)
  const range = Math.max(...points) - min || 1
  const coordinates = points.map((point, index) => [
    (index / (points.length - 1)) * CHART_WIDTH,
    CHART_HEIGHT - 14 - ((point - min) / range) * (CHART_HEIGHT - 40),
  ])
  const line = coordinates.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none" className="block h-40 w-full lg:h-52" aria-hidden="true">
      <defs>
        <linearGradient id="hr-balance-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.26" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${CHART_WIDTH} ${CHART_HEIGHT} L0 ${CHART_HEIGHT} Z`} fill="url(#hr-balance-area)" />
      <path d={line} fill="none" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0 0 5px rgba(255,255,255,0.6))" }} />
    </svg>
  )
}

function Section({ title, href, children, className = "" }: { title: string; href?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`hr-panel flex flex-col p-4 sm:p-5 ${className}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="hr-section-title !text-[21px]">{title}</h2>
        {href && (
          <Link href={href} className="hr-focus -mr-1 flex items-center rounded-full p-1 text-[#a1a1a6] transition-colors hover:text-white" aria-label={title}>
            <ChevronRight className="h-5 w-5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuth()
  const apiCache = useApiCache()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const cached = apiCache.get<DashboardSummary>("dashboard-summary")
      if (cached) {
        setSummary(cached)
      } else {
        const response = await apiClient.getDashboard()
        if (response.error) throw new Error(response.error)
        // Some responses arrive still wrapped in the API's { data } envelope.
        const body = response.data?.financial_summary ? response.data : response.data?.data
        setSummary(body ?? null)
        if (body) apiCache.set("dashboard-summary", body, 2 * 60 * 1000)
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data")
    } finally {
      setIsLoading(false)
    }

    // Goals are optional here: if they fail, the rest of the page still works.
    try {
      const goalsResponse = await (apiClient as unknown as { request: (endpoint: string) => Promise<{ data?: unknown }> }).request("/savings/goals")
      const goalList = (goalsResponse.data as { data?: SavingsGoal[] } | SavingsGoal[] | undefined) ?? []
      setGoals(Array.isArray(goalList) ? goalList : goalList.data ?? [])
    } catch (err) {
      console.error("Savings goals fetch error:", err)
    }
  }, [apiCache])

  useEffect(() => {
    load()
  }, [load])

  // A confirmed deposit changes the balance; drop the cached summary and fetch it again
  useEffect(() => {
    const onChange = () => {
      apiCache.invalidate("dashboard-summary")
      load()
    }
    window.addEventListener("hoardrun:balance-changed", onChange)
    return () => window.removeEventListener("hoardrun:balance-changed", onChange)
  }, [apiCache, load])

  const balances = summary?.financial_summary?.balances
  const balance = toNumber(balances?.total_balance)
  const available = toNumber(balances?.available_balance)
  const netWorth = toNumber(balances?.net_worth)
  const investments = toNumber(summary?.financial_summary?.assets?.investments)
  const spending = toNumber(summary?.quick_stats?.monthly_spending)
  // Goals, fixed deposits and auto-save together, as counted in net worth
  const savings = toNumber(summary?.financial_summary?.assets?.savings)
  const rawBalance = balances?.total_balance
  const currency = (typeof rawBalance === "object" && rawBalance?.currency) || "USD"
  const activity = useMemo(() => summary?.recent_activity ?? [], [summary])
  const series = useBalanceSeries(activity, balance)
  const { whole, fraction } = formatParts(balance, currency)
  const firstName = user?.name?.split(" ")[0]

  const actions = [
    { label: t("dashboard.home.send"), icon: ArrowUpRight, onClick: () => router.push("/send") },
    { label: t("dashboard.home.addMoney"), icon: Plus, onClick: () => setIsDepositModalOpen(true), primary: true },
    { label: t("dashboard.home.cards"), icon: CreditCard, onClick: () => router.push("/cards") },
    { label: t("dashboard.home.invest"), icon: TrendingUp, onClick: () => router.push("/investment") },
    { label: t("dashboard.home.save"), icon: Target, onClick: () => router.push("/savings") },
  ]

  const accounts = [
    { label: t("dashboard.home.cash", "Cash"), value: available, Graphic: CoinsGraphic, href: "/finance" },
    { label: t("dashboard.home.savings"), value: savings, Graphic: VaultGraphic, href: "/savings" },
    { label: t("dashboard.home.portfolio"), value: investments, Graphic: BarsGraphic, href: "/investment" },
    { label: t("dashboard.home.netWorth"), value: netWorth, Graphic: GemGraphic, href: "/overview" },
  ]

  const shortcuts = [
    { label: t("dashboard.home.analytics"), hint: t("dashboard.home.analyticsHint", "See your spending"), icon: Activity, href: "/analytics" },
    { label: t("dashboard.home.financialHealth"), hint: t("dashboard.home.financialHealthHint", "Your money score"), icon: Target, href: "/health-score" },
    { label: t("dashboard.home.notifications"), hint: t("dashboard.home.notificationsHint", "Alerts and updates"), icon: Bell, href: "/notifications" },
    { label: t("dashboard.home.help"), hint: t("dashboard.home.helpHint", "Answers and support"), icon: HelpCircle, href: "/help" },
  ]

  return (
    <motion.div className="relative isolate space-y-4 sm:space-y-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
      {/* Revolut-style wallpaper behind the balance on phones: the logo blue with sweeping light arcs */}
      <div aria-hidden="true" className="hr-wallpaper lg:hidden" />
      <header className="flex items-center justify-between gap-4">
        <h1 className="hr-title">
          {firstName ? t("dashboard.home.welcomeName", { defaultValue: "Welcome, {{name}}", name: firstName }) : t("dashboard.home.welcome", "Welcome")}
        </h1>
        <div className="hidden items-center gap-2 lg:flex">
          {actions.map((action) => (
            <button key={action.label} onClick={action.onClick} data-primary={action.primary ? "true" : undefined} className="hr-pill hr-focus">
              <action.icon className="h-4 w-4" strokeWidth={2} />
              {action.label}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div role="alert" className="hr-panel flex items-center justify-between gap-3 px-5 py-4 text-sm">
          <span>{t("dashboard.home.loadError", "We couldn't load your latest numbers.")}</span>
          <button onClick={load} className="hr-focus flex-none rounded-full bg-white px-4 py-2 font-medium text-black">
            {t("dashboard.home.retry", "Try again")}
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-12">
        {/* Balance: open on the page on phones and tablets, a chart card on desktop */}
        <section className="hr-balance lg:col-span-8">
          {!series && <div aria-hidden="true" className="lp-eclipse hr-eclipse lg:hidden" />}
          <div className="relative px-5 pt-8 text-center lg:p-6 lg:pb-3 lg:text-left">
            <p className="text-sm text-[#a1a1a6]">{t("dashboard.home.totalBalance")}</p>
            {isLoading && !summary ? (
              <div className="hr-skeleton mx-auto mt-2 h-14 w-56 lg:mx-0" />
            ) : (
              <p className="mt-1 text-[56px] font-semibold leading-none tracking-[-0.045em] tabular-nums lg:text-[52px]">
                {whole}
                {fraction && <span className="text-[0.46em] text-[#a1a1a6]">.{fraction}</span>}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] text-[#a1a1a6] lg:justify-start">
              <span className="inline-flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="text-white"><Money value={spending} currency={currency} /></span>
                {t("dashboard.home.spentThisMonth", "spent this month")}
              </span>
              {available !== balance && !isLoading && (
                <span>
                  <span className="text-white"><Money value={available} currency={currency} /></span> {t("dashboard.home.available", "available")}
                </span>
              )}
            </div>
          </div>

          {series ? (
            <div className="relative mt-4"><BalanceChart points={series} /></div>
          ) : (
            <div className="hidden px-6 pb-5 lg:block">
              <EmptyChart label={t("dashboard.home.chartEmpty", "Your balance over time will show here")} />
            </div>
          )}

          <div className={`relative grid grid-cols-5 gap-1 px-2 pb-6 lg:hidden ${series ? "pt-4" : "pt-20 sm:pt-24"}`}>
            {actions.map((action) => (
              <button key={action.label} onClick={action.onClick} data-primary={action.primary ? "true" : undefined} className="hr-action hr-focus rounded-2xl">
                <span className="hr-action-icon">
                  <action.icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
                </span>
                <span className="w-full text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Accounts */}
        <section className="lg:col-span-4">
          <h2 className="hr-section-title mb-3 !text-[21px] lg:sr-only">{t("dashboard.home.accounts", "Accounts")}</h2>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:h-full lg:grid-cols-2">
            {accounts.map(({ label, value, Graphic, href }) => (
              <li key={label} className="min-w-0">
                <Link href={href} className="hr-tile hr-focus">
                  <span className="hr-tile-glow" aria-hidden="true" />
                  <Graphic className="hr-tile-art" />
                  <span className="relative block truncate text-[13px] text-[#a1a1a6]">{label}</span>
                  {isLoading && !summary ? (
                    <span className="hr-skeleton relative mt-1.5 block h-6 w-20" />
                  ) : (
                    <span className="relative mt-0.5 block truncate text-xl font-semibold tracking-tight"><Money value={value} currency={currency} /></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Activity */}
        <Section title={t("dashboard.home.recentTransactions")} href="/transactions" className="lg:col-span-8">
          {activity.length > 0 ? (
            <ul className="divide-y divide-white/[0.07]">
              {activity.slice(0, 5).map((item, index) => {
                const incoming = isIncoming(item)
                const Icon = incoming ? ArrowDownLeft : ArrowUpRight
                return (
                  <li key={item.transaction_id ?? index} className="flex items-center gap-3 py-3">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#1c1c1e]">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{item.merchant || item.category || item.type}</span>
                      {item.date && <span className="block text-[13px] text-[#a1a1a6]">{new Date(item.date).toLocaleDateString()}</span>}
                    </span>
                    <span className={`flex-none font-medium ${incoming ? "text-white" : "text-[#a1a1a6]"}`}>
                      {incoming ? "+" : "−"}
                      <Money value={Math.abs(toNumber(item.amount))} currency={currency} />
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="hr-canvas mt-1 flex flex-1 flex-col items-center px-4 pb-5 pt-6 text-center">
              <ReceiptStack />
              <p className="mt-4 font-medium">{t("dashboard.home.noRecentTransactions")}</p>
              <p className="mt-0.5 text-[13px] text-[#a1a1a6]">{t("dashboard.home.transactionsWillAppear")}</p>
              <button onClick={() => setIsDepositModalOpen(true)} className="hr-focus mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-black">
                <Plus className="h-4 w-4" strokeWidth={2.4} />
                {t("dashboard.home.addMoney")}
              </button>
            </div>
          )}
        </Section>

        {/* Goals */}
        {goals.length > 0 ? (
          <Section title={t("dashboard.home.savings")} href="/savings" className="lg:col-span-4">
            <ul className="space-y-4 pt-1">
              {goals.slice(0, 3).map((goal, index) => {
                const current = toNumber(goal.currentAmount)
                const target = toNumber(goal.targetAmount)
                const progress = target > 0 ? Math.min(current / target, 1) : 0
                return (
                  <li key={goal.id ?? goal.goal_id ?? index}>
                    <div className="mb-1.5 flex justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{goal.name ?? goal.title}</span>
                      <span className="flex-none tabular-nums text-[#a1a1a6]">{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-white" style={{ width: `${progress * 100}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </Section>
        ) : (
          <section className="hr-promo lg:col-span-4">
            <TargetGraphic className="hr-promo-art" />
            <div className="relative max-w-[62%] lg:max-w-[70%]">
              <h2 className="hr-card-title text-[23px]">{t("dashboard.home.noGoals", "No goals yet")}</h2>
              <p className="hr-sub mt-2 !text-[#aeaeb2]">{t("dashboard.home.noGoalsDesc", "Set a goal and watch your savings grow.")}</p>
              <Link href="/savings" className="hr-focus mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-black">
                <Plus className="h-4 w-4" strokeWidth={2.4} />
                {t("dashboard.home.createGoal", "Create a goal")}
              </Link>
            </div>
          </section>
        )}

        {/* Shortcuts */}
        <nav aria-label={t("dashboard.home.more", "More")} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:col-span-12">
          {shortcuts.map((shortcut) => (
            <Link key={shortcut.href} href={shortcut.href} className="hr-panel hr-focus flex min-w-0 flex-col gap-4 p-4 transition-colors hover:border-white/25">
              <span className="hr-gem">
                <shortcut.icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{shortcut.label}</span>
                <span className="block truncate text-[13px] text-[#a1a1a6]">{shortcut.hint}</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <DepositModal open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen} />
    </motion.div>
  )
}
