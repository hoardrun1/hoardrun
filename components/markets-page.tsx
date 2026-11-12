'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Search, Wallet } from 'lucide-react'
import { Sheet, SheetHeader } from '@/components/investment-opportunities-page'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'
import { OpenInvestingAccount } from '@/components/markets/open-investing-account'
import type { BrokerageStatus } from '@/lib/api-client'

type Kind = 'crypto' | 'etf'
type Range = '1D' | '1W' | '1M' | '1Y'

interface Asset { symbol: string; name: string; about?: string; price: number | null; change: number | null; spark: number[] }
interface Position { symbol: string; name: string; quantity: number; cost_basis: number; price: number | null; value: number | null; gain: number | null }

const CRYPTO: [string, string][] = [
  ['BTC', 'Bitcoin'], ['ETH', 'Ethereum'], ['SOL', 'Solana'], ['BNB', 'BNB'], ['XRP', 'XRP'], ['ADA', 'Cardano'],
  ['DOGE', 'Dogecoin'], ['AVAX', 'Avalanche'], ['LINK', 'Chainlink'], ['DOT', 'Polkadot'], ['TRX', 'TRON'], ['LTC', 'Litecoin'],
]
const BINANCE = 'https://data-api.binance.vision/api/v3'
const BINANCE_STREAM = 'wss://data-stream.binance.vision/stream'
const KLINES: Record<Range, [string, number]> = { '1D': ['15m', 96], '1W': ['2h', 84], '1M': ['12h', 60], '1Y': ['1d', 365] }

const price = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '—'
  const digits = value >= 1000 ? 2 : value >= 1 ? 2 : value >= 0.01 ? 4 : 6
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)
}
const usd = (value: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
const change = (value: number | null) => (value === null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`)
const qty = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: value < 1 ? 8 : 4 })
const errorText = (error: unknown) => (typeof error === 'string' ? error : 'Something went wrong. Please try again.')

/** A chrome coin for crypto, a chrome tile for funds, both stamped with the ticker. */
function AssetMark({ kind, symbol, size = 40 }: { kind: Kind; symbol: string; size?: number }) {
  const uid = useId().replace(/:/g, '')
  const label = symbol.length > 4 ? symbol.slice(0, 4) : symbol
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className="shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)]" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-m`} x1="0" y1="0" x2="1" y2="1">
          {(kind === 'crypto' ? ['#fffbeb', '#fcd34d', '#b45309', '#fde68a'] : ['#f0f9ff', '#7dd3fc', '#0369a1', '#bae6fd']).map((color, index) => <stop key={index} offset={[0, 0.35, 0.65, 1][index]} stopColor={color} />)}
        </linearGradient>
      </defs>
      {kind === 'crypto' ? (
        <>
          <circle cx="24" cy="24" r="23" fill={`url(#${uid}-m)`} />
          <circle cx="24" cy="24" r="18.5" fill="#111113" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
          <circle cx="24" cy="24" r="21" fill="none" stroke="#000" strokeOpacity="0.25" strokeDasharray="1.5 2.5" />
        </>
      ) : (
        <>
          <rect x="1" y="1" width="46" height="46" rx="13" fill={`url(#${uid}-m)`} />
          <rect x="5" y="5" width="38" height="38" rx="10" fill="#111113" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
        </>
      )}
      <text x="24" y="28" textAnchor="middle" fill="#fff" style={{ font: `600 ${label.length > 3 ? 9.5 : 11.5}px var(--font-display), sans-serif`, letterSpacing: '-0.02em' }}>{label}</text>
    </svg>
  )
}

function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  if (points.length < 2) return <span className="block h-8 w-20" />
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const path = points.map((value, index) => `${index ? 'L' : 'M'}${(index / (points.length - 1)) * 80},${30 - ((value - min) / span) * 26 - 2}`).join(' ')
  return (
    <svg viewBox="0 0 80 32" className="h-8 w-20 shrink-0" aria-hidden="true">
      <path d={path} fill="none" stroke={up ? '#34d399' : '#fb7185'} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/** Big area chart with a crosshair that follows the pointer. */
function PriceChart({ points, loading }: { points: [number, number][]; loading: boolean }) {
  const [hover, setHover] = useState<number | null>(null)
  const ref = useRef<SVGSVGElement>(null)
  const W = 600
  const H = 220
  const values = points.map(([, value]) => value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const x = (index: number) => (index / Math.max(points.length - 1, 1)) * W
  const y = (value: number) => H - 14 - ((value - min) / span) * (H - 40)
  const line = points.map(([, value], index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(' ')
  const up = values.length > 1 && values[values.length - 1] >= values[0]
  const hue = up ? '#34d399' : '#fb7185'

  const onMove = (event: React.PointerEvent) => {
    const box = ref.current?.getBoundingClientRect()
    if (!box || points.length < 2) return
    const ratio = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1)
    setHover(Math.round(ratio * (points.length - 1)))
  }

  if (loading || points.length < 2) return <div className="hr-skeleton h-[220px] !rounded-[18px]" />
  const active = hover !== null ? points[hover] : null

  return (
    <div className="relative">
      {active && (
        <div className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-full bg-white px-2.5 py-1 text-[11.5px] font-medium tabular-nums text-black shadow-lg" style={{ left: `${Math.min(Math.max((x(hover!) / W) * 100, 12), 88)}%` }}>
          {price(active[1])} · {new Date(active[0]).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[220px] w-full touch-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label="Price chart">
        <defs>
          <linearGradient id="hr-mk-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={hue} stopOpacity="0.32" />
            <stop offset="1" stopColor={hue} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hr-mk-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={hue} stopOpacity="0.4" />
            <stop offset="1" stopColor={hue} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((row) => <line key={row} x1="0" x2={W} y1={H * row} y2={H * row} stroke="#fff" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" />)}
        <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#hr-mk-area)" />
        <motion.path key={line.length} d={line} fill="none" stroke="url(#hr-mk-line)" strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }} style={{ filter: `drop-shadow(0 0 8px ${hue}99)` }} />
        {active && hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="#fff" strokeOpacity="0.35" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
            <circle cx={x(hover)} cy={y(active[1])} r="5" fill="#fff" stroke="#000" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
    </div>
  )
}

/** The price, with each update flashing lighter (up) or darker (down). */
function LivePrice({ value, className }: { value: number | null; className?: string }) {
  const previous = useRef(value)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)
  useEffect(() => {
    if (value !== null && previous.current !== null && value !== previous.current) {
      setFlash(value > previous.current ? 'up' : 'down')
      const timer = window.setTimeout(() => setFlash(null), 650)
      previous.current = value
      return () => window.clearTimeout(timer)
    }
    previous.current = value
  }, [value])
  return <span className={`hr-live-price ${className ?? ''}`} data-flash={flash ?? undefined}>{price(value)}</span>
}

function ChangePill({ value }: { value: number | null }) {
  return <span className="hr-change" data-dir={value === null ? undefined : value >= 0 ? 'up' : 'down'}>{value !== null && (value >= 0 ? '▲ ' : '▼ ')}{change(value).replace('+', '')}</span>
}

function OrderPanel({ kind, asset, position, cash, enabled, brokerage, onDone }: { kind: Kind; asset: Asset; position?: Position; cash: number; enabled: boolean; brokerage: BrokerageStatus | null; onDone: () => void }) {
  const { addToast } = useToast()
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [receipt, setReceipt] = useState<any>(null)
  const value = Number(amount) || 0
  const held = position?.quantity ?? 0
  const heldValue = asset.price ? held * asset.price : 0
  const limit = side === 'buy' ? cash : heldValue
  const over = value > limit + 0.001
  const estimate = asset.price ? value / asset.price : 0

  const submit = async (sellAll = false) => {
    setBusy(true)
    const response = await apiClient.placeMarketOrder({ asset_type: kind, symbol: asset.symbol, side, amount: sellAll ? undefined : value, sell_all: sellAll })
    setBusy(false)
    setReviewing(false)
    if (response.error || !response.data?.data) {
      addToast({ title: side === 'buy' ? "Couldn't buy" : "Couldn't sell", description: errorText(response.error), variant: 'destructive' })
      return
    }
    setReceipt(response.data.data)
    setAmount('')
    onDone()
  }

  // Placed with the broker: it fills at the market price, so the final amount isn't known yet
  if (receipt?.placed_at_broker) {
    return (
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="space-y-4">
        <div className="hr-certificate text-center">
          <div className="flex justify-center"><AssetMark kind={kind} symbol={receipt.symbol} size={64} /></div>
          <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.14em] text-[#8e8e93]">{receipt.side === 'buy' ? 'Buy order placed' : 'Sell order placed'}</p>
          <p className="hr-figure mt-1 text-[34px] leading-none">{receipt.amount != null ? usd(receipt.amount) : `All your ${receipt.symbol}`}</p>
          <p className="mt-2 text-[13px] text-[#a1a1a6]">of {receipt.name}, at the market price</p>
          {receipt.reference && <p className="mt-4 text-[11px] tabular-nums text-[#8e8e93]">{receipt.reference}</p>}
        </div>
        <p className="text-center text-[13px] text-[#a1a1a6]">
          {receipt.side === 'buy'
            ? (kind === 'crypto' ? 'It usually fills in seconds.' : 'It fills when the US market is open.') + ` Cash left: ${usd(receipt.cash_available)}.`
            : 'The money comes back to your Hoardrun cash once the sale settles, usually the next business day.'}
        </p>
        <button onClick={() => setReceipt(null)} className="hr-focus h-12 w-full rounded-full border border-white/15 text-[15px]">Done</button>
      </motion.div>
    )
  }

  if (receipt) {
    return (
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="space-y-4">
        <div className="hr-certificate text-center">
          <div className="flex justify-center"><AssetMark kind={kind} symbol={receipt.symbol} size={64} /></div>
          <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.14em] text-[#8e8e93]">{receipt.side === 'buy' ? 'Bought' : 'Sold'}</p>
          <p className="hr-figure mt-1 text-[34px] leading-none">{qty(receipt.quantity)} {receipt.symbol}</p>
          <p className="mt-2 text-[13px] text-[#a1a1a6]">{usd(receipt.amount)} at {price(receipt.price)}</p>
          <p className="mt-4 text-[11px] tabular-nums text-[#8e8e93]">{receipt.reference}</p>
        </div>
        <p className="text-center text-[13px] text-[#a1a1a6]">You now hold {qty(receipt.position_quantity)} {receipt.symbol}. Cash: {usd(receipt.cash_available)}.</p>
        <button onClick={() => setReceipt(null)} className="hr-focus h-12 w-full rounded-full border border-white/15 text-[15px]">Done</button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="hr-choice" role="radiogroup" aria-label="Buy or sell">
        <button type="button" role="radio" aria-checked={side === 'buy'} onClick={() => { setSide('buy'); setReviewing(false) }} className="hr-focus">Buy</button>
        <button type="button" role="radio" aria-checked={side === 'sell'} onClick={() => { setSide('sell'); setReviewing(false) }} disabled={held <= 0} className="hr-focus disabled:opacity-40">Sell</button>
      </div>
      <div className="hr-trade-row" data-warn={over}>
        <div className="flex items-center justify-between text-[13px] text-[#8e8e93]">
          <span>{side === 'buy' ? 'You pay' : 'You get'}</span>
          <span className="inline-flex items-center gap-1.5">{side === 'buy' ? <><Wallet className="h-3.5 w-3.5" />{usd(cash)}</> : <>{qty(held)} {asset.symbol} · {usd(heldValue)}</>}</span>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <span className="hr-figure text-[40px] text-[#8e8e93]">$</span>
          <input type="number" inputMode="decimal" min={1} step="0.01" value={amount} onChange={(event) => { setAmount(event.target.value); setReviewing(false) }} placeholder="0" className="hr-figure hr-share-input min-w-0 flex-1 !text-left !text-[40px]" aria-label="Amount in dollars" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[25, 100, 500].map((preset) => <button key={preset} type="button" onClick={() => { setAmount(String(preset)); setReviewing(false) }} className="hr-focus rounded-full border border-white/12 px-3 py-1 text-[12px] text-[#d1d1d6]" data-active={value === preset}>${preset}</button>)}
          {limit > 0 && <button type="button" onClick={() => { setAmount(limit.toFixed(2)); setReviewing(false) }} className="hr-focus rounded-full border border-white/12 px-3 py-1 text-[12px] text-[#d1d1d6]">Max</button>}
        </div>
      </div>
      <div className="hr-trade-row !py-3">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[#8e8e93]">{side === 'buy' ? 'You get about' : 'You sell about'}</span>
          <span className="font-medium tabular-nums">{qty(estimate)} {asset.symbol}</span>
        </div>
        <p className="mt-1 text-[12px] text-[#8e8e93]">At {price(asset.price)}. {brokerage?.configured ? 'The order fills at the market price, which can differ a little.' : 'The final price is fetched live when you confirm.'}</p>
      </div>
      {!enabled && brokerage?.configured ? (
        <OpenInvestingAccount status={brokerage} onChanged={onDone} />
      ) : !enabled ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] leading-snug text-[#a1a1a6]">Trading isn't switched on yet. Hoardrun needs a licensed {kind === 'crypto' ? 'exchange' : 'broker'} connected before orders can be placed. Prices here are live.</p>
      ) : over ? (
        <p className="text-center text-[13px] text-[#ff9f95]">{side === 'buy' ? 'More than your Hoardrun cash' : `More than your ${asset.symbol}`}</p>
      ) : null}
      {reviewing ? (
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <button onClick={() => setReviewing(false)} className="hr-focus h-12 rounded-full border border-white/15 px-5 text-[15px]">Edit</button>
          <button onClick={() => submit(side === 'sell' && Math.abs(value - heldValue) < 0.01)} disabled={busy} className="hr-focus h-12 rounded-full bg-white text-[15px] font-medium text-black disabled:opacity-60">{busy ? 'Placing…' : `Confirm ${side} · ${usd(value)}`}</button>
        </div>
      ) : (
        <button onClick={() => setReviewing(true)} disabled={!enabled || value < 1 || over || !asset.price} className="hr-focus h-12 w-full rounded-full bg-white text-[15px] font-medium text-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#8e8e93]">
          Review {side}
        </button>
      )}
    </div>
  )
}

export function MarketsPage({ kind }: { kind: Kind }) {
  const [assets, setAssets] = useState<Asset[]>(() => (kind === 'crypto' ? CRYPTO.map(([symbol, name]) => ({ symbol, name, price: null, change: null, spark: [] })) : []))
  const [selected, setSelected] = useState(kind === 'crypto' ? 'BTC' : 'SPY')
  const [range, setRange] = useState<Range>('1D')
  const [chart, setChart] = useState<[number, number][]>([])
  const [chartLoading, setChartLoading] = useState(true)
  const [positions, setPositions] = useState<Position[]>([])
  const [cash, setCash] = useState(0)
  const [enabled, setEnabled] = useState(false)
  const [live, setLive] = useState(false)
  const [marketOpen, setMarketOpen] = useState<boolean | null>(null)
  const [updated, setUpdated] = useState<Date | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [brokerage, setBrokerage] = useState<BrokerageStatus | null>(null)

  const loadPositions = useCallback(async () => {
    const response = await apiClient.getMarketPositions(kind)
    if (response.data) {
      setPositions(response.data.data ?? [])
      setCash(Number(response.data.cash_available) || 0)
      setEnabled(Boolean(response.data.trading_enabled))
      setBrokerage(response.data.brokerage ?? null)
    }
  }, [kind])

  useEffect(() => { loadPositions() }, [loadPositions])

  // Crypto: 24h tickers and sparklines once, then a live Binance stream
  useEffect(() => {
    if (kind !== 'crypto') return
    let socket: WebSocket | null = null
    let closed = false
    const symbols = CRYPTO.map(([symbol]) => symbol)
    const pairs = encodeURIComponent(JSON.stringify(symbols.map((symbol) => `${symbol}USDT`)))
    fetch(`${BINANCE}/ticker/24hr?symbols=${pairs}&type=MINI`)
      .then((response) => response.json())
      .then((rows: any[]) => {
        setAssets((current) => current.map((asset) => {
          const row = rows.find((item) => item.symbol === `${asset.symbol}USDT`)
          if (!row) return asset
          const last = Number(row.lastPrice)
          const open = Number(row.openPrice)
          return { ...asset, price: last, change: open ? ((last - open) / open) * 100 : null }
        }))
        setUpdated(new Date())
      })
      .catch(() => setFailed('Live crypto prices are unavailable right now.'))
    symbols.forEach((symbol) => {
      fetch(`${BINANCE}/klines?symbol=${symbol}USDT&interval=1h&limit=24`)
        .then((response) => response.json())
        .then((rows: any[]) => setAssets((current) => current.map((asset) => (asset.symbol === symbol ? { ...asset, spark: rows.map((row) => Number(row[4])) } : asset))))
        .catch(() => {})
    })
    const connect = () => {
      socket = new WebSocket(`${BINANCE_STREAM}?streams=${symbols.map((symbol) => `${symbol.toLowerCase()}usdt@miniTicker`).join('/')}`)
      socket.onopen = () => setLive(true)
      socket.onmessage = (event) => {
        const tick = JSON.parse(event.data)?.data
        if (!tick?.s) return
        const symbol = String(tick.s).replace(/USDT$/, '')
        const last = Number(tick.c)
        const open = Number(tick.o)
        setAssets((current) => current.map((asset) => (asset.symbol === symbol ? { ...asset, price: last, change: open ? ((last - open) / open) * 100 : asset.change } : asset)))
        setUpdated(new Date())
      }
      socket.onclose = () => {
        setLive(false)
        if (!closed) window.setTimeout(connect, 3000)
      }
    }
    connect()
    return () => {
      closed = true
      socket?.close()
    }
  }, [kind])

  // ETFs: quotes from the backend every 15 seconds
  useEffect(() => {
    if (kind !== 'etf') return
    let timer: number
    const load = async () => {
      const response = await apiClient.getEtfQuotes()
      if (response.error || !response.data?.data) {
        setFailed('ETF prices are unavailable right now.')
      } else {
        setFailed(null)
        const rows = response.data.data as any[]
        setAssets(rows.map((row) => ({ symbol: row.symbol, name: row.name, about: row.about, price: row.price, change: row.change_percent, spark: row.spark ?? [] })))
        setMarketOpen(rows.some((row) => row.market_open))
        setUpdated(new Date())
      }
      timer = window.setTimeout(load, 15000)
    }
    load()
    return () => window.clearTimeout(timer)
  }, [kind])

  // Chart for the selected asset
  useEffect(() => {
    let cancelled = false
    setChartLoading(true)
    const done = (points: [number, number][]) => {
      if (cancelled) return
      setChart(points)
      setChartLoading(false)
    }
    if (kind === 'crypto') {
      const [interval, limit] = KLINES[range]
      fetch(`${BINANCE}/klines?symbol=${selected}USDT&interval=${interval}&limit=${limit}`)
        .then((response) => response.json())
        .then((rows: any[]) => done(rows.map((row) => [Number(row[0]), Number(row[4])])))
        .catch(() => done([]))
    } else {
      apiClient.getEtfChart(selected, range).then((response) => done(response.data?.data ?? []))
    }
    return () => { cancelled = true }
  }, [kind, selected, range])

  const asset = assets.find((item) => item.symbol === selected) ?? assets[0]
  // Keep the chart's last point on the live price
  const liveChart = useMemo<[number, number][]>(() => {
    if (!chart.length || !asset?.price || range !== '1D') return chart
    return [...chart.slice(0, -1), [Date.now(), asset.price]]
  }, [chart, asset?.price, range])

  const held = new Map(positions.map((position) => [position.symbol, position]))
  const livePositions = positions.map((position) => {
    const current = assets.find((item) => item.symbol === position.symbol)?.price ?? position.price
    const value = current !== null && current !== undefined ? position.quantity * current : position.value
    return { ...position, value, gain: value !== null && value !== undefined ? value - position.cost_basis : position.gain }
  })
  const total = livePositions.reduce((sum, position) => sum + (position.value ?? 0), 0)
  const gain = livePositions.reduce((sum, position) => sum + (position.gain ?? 0), 0)
  const list = assets.filter((item) => !query.trim() || `${item.symbol} ${item.name}`.toLowerCase().includes(query.trim().toLowerCase()))

  const title = kind === 'crypto' ? 'Crypto' : 'ETFs'
  const description = kind === 'crypto'
    ? 'Live prices streamed straight from the market, every tick.'
    : 'Funds that hold hundreds of companies in one trade.'

  return (
    <motion.div className="space-y-5 sm:space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
      <div>
        <Link href="/investment" className="hr-focus -ml-1 inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-1 py-1 text-[14px] text-[#a1a1a6] hover:text-white"><ArrowLeft className="h-4 w-4" strokeWidth={2} />Investments</Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="hr-title">{title}</h1>
            <p className="hr-sub mt-2">{description}</p>
          </div>
          <span className="hr-live-badge" data-live={kind === 'crypto' ? live : marketOpen ?? false}>
            <span className="hr-live-dot" />
            {kind === 'crypto' ? (live ? 'Live' : 'Connecting…') : marketOpen ? 'Market open' : 'Market closed'}
            {updated && <span className="text-[#8e8e93]">· {updated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: kind === 'crypto' ? '2-digit' : undefined })}</span>}
          </span>
        </div>
      </div>

      {failed && <div role="alert" className="hr-panel px-5 py-4 text-sm">{failed}</div>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="hr-market-hero">
          {asset ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <AssetMark kind={kind} symbol={asset.symbol} size={52} />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium">{asset.name}</p>
                    <p className="text-[13px] text-[#8e8e93]">{asset.symbol}{kind === 'crypto' ? ' / USD' : asset.about ? ` · ${asset.about}` : ''}</p>
                  </div>
                </div>
                <div className="hr-choice !w-auto" role="radiogroup" aria-label="Chart range">
                  {(['1D', '1W', '1M', '1Y'] as Range[]).map((item) => <button key={item} type="button" role="radio" aria-checked={range === item} onClick={() => setRange(item)} className="hr-focus !px-3">{item}</button>)}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <LivePrice value={asset.price} className="hr-figure text-[44px] leading-none sm:text-[52px]" />
                <span className="pb-1.5"><ChangePill value={asset.change} /></span>
                <span className="pb-2 text-[12px] text-[#8e8e93]">today</span>
              </div>
              <div className="mt-5"><PriceChart points={liveChart} loading={chartLoading} /></div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button onClick={() => setOrdering(true)} className="hr-focus h-12 min-w-[140px] flex-1 rounded-full bg-white px-6 text-[15px] font-medium text-black sm:flex-none">Trade {asset.symbol}</button>
                {held.get(asset.symbol) && (
                  <span className="text-[13px] text-[#a1a1a6]">You hold {qty(held.get(asset.symbol)!.quantity)} {asset.symbol}</span>
                )}
              </div>
            </>
          ) : (
            <div className="hr-skeleton h-[380px] !rounded-[18px]" />
          )}
        </section>

        <aside className="space-y-4">
          <section className="hr-panel p-5">
            <p className="text-[13px] text-[#8e8e93]">Your {kind === 'crypto' ? 'crypto' : 'ETFs'}</p>
            <p className="hr-figure mt-1 text-[34px] leading-none">{usd(total)}</p>
            <p className="mt-1 text-[13px] text-[#a1a1a6]">{positions.length ? `${gain >= 0 ? '+' : '−'}${usd(Math.abs(gain))} all time` : `${usd(cash)} cash to invest`}</p>
            {livePositions.length > 0 && (
              <ul className="mt-4 space-y-2.5">
                {livePositions.map((position) => (
                  <li key={position.symbol}>
                    <button onClick={() => setSelected(position.symbol)} className="hr-focus flex w-full items-center gap-3 rounded-xl text-left">
                      <AssetMark kind={kind} symbol={position.symbol} size={32} />
                      <span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{position.symbol}</span><span className="block text-[12px] text-[#8e8e93]">{qty(position.quantity)}</span></span>
                      <span className="text-right"><span className="block text-[14px] tabular-nums">{position.value !== null ? usd(position.value) : '—'}</span><span className="block text-[12px] tabular-nums text-[#8e8e93]">{position.gain !== null ? `${position.gain >= 0 ? '+' : '−'}${usd(Math.abs(position.gain))}` : ''}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className="px-1 text-[12px] leading-relaxed text-[#8e8e93]">
            {kind === 'crypto'
              ? 'Prices stream live from Binance in US dollar terms (USDT). Crypto is volatile: prices can fall fast, and you can lose what you put in.'
              : 'ETF prices refresh every 15 seconds; outside US market hours they show the last close. ETFs can fall in value.'}
            {brokerage?.configured && ' Investments are held at Alpaca Securities LLC, member FINRA/SIPC, and are not FDIC insured.'}
          </p>
        </aside>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="hr-section-title">Markets</h2>
          <label className="relative w-full max-w-[260px]">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" strokeWidth={2} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="hr-field !h-10 !rounded-full !pl-10" />
          </label>
        </div>
        <ul className="hr-market-list">
          {list.map((item) => (
            <li key={item.symbol}>
              <button onClick={() => { setSelected(item.symbol); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="hr-market-row hr-focus" aria-current={item.symbol === selected ? 'true' : undefined}>
                <AssetMark kind={kind} symbol={item.symbol} />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-[15px] font-medium">{item.name}</span>
                  <span className="block truncate text-[12.5px] text-[#8e8e93]">{item.symbol}{held.get(item.symbol) ? ` · you hold ${qty(held.get(item.symbol)!.quantity)}` : ''}</span>
                </span>
                <span className="hidden sm:block"><Sparkline points={item.spark} up={(item.change ?? 0) >= 0} /></span>
                <span className="w-[112px] text-right">
                  <LivePrice value={item.price} className="block text-[15px] font-medium tabular-nums" />
                  <ChangePill value={item.change} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Sheet open={ordering && !!asset} onClose={() => setOrdering(false)} label={`Trade ${asset?.symbol ?? ''}`}>
        <SheetHeader title={`Trade ${asset?.symbol ?? ''}`} onClose={() => setOrdering(false)} />
        {asset && (
          <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-8">
            <div className="flex items-center gap-3">
              <AssetMark kind={kind} symbol={asset.symbol} size={44} />
              <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-medium">{asset.name}</p><p className="text-[12px] text-[#8e8e93]">{asset.symbol}</p></div>
              <div className="text-right"><LivePrice value={asset.price} className="block text-[17px] font-medium tabular-nums" /><ChangePill value={asset.change} /></div>
            </div>
            <OrderPanel key={asset.symbol} kind={kind} asset={asset} position={held.get(asset.symbol)} cash={cash} enabled={enabled} brokerage={brokerage} onDone={loadPositions} />
          </div>
        )}
      </Sheet>
    </motion.div>
  )
}
