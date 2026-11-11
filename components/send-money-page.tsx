'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Building2, Check, ChevronDown, Delete, Landmark, PenLine, Plus, Search, Send, ShieldCheck, Wallet, Zap } from 'lucide-react'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { useBeneficiaries } from '@/hooks/useBeneficiaries'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'
import { DepositModal } from '@/components/deposit-modal'
import { ConnectBankAccountModal } from '@/components/send-money/ConnectBankAccountModal'
import { AddBeneficiaryModal } from '@/components/send-money/AddBeneficiaryModal'
import { Sheet, SheetHeader } from '@/components/investment-opportunities-page'

type Mode = 'hoardrun' | 'bank'
type Picker = 'to' | 'from' | null
interface Recipient { name: string; email: string }
interface Quote { fee: number; total: number }
interface Receipt { amount: number; to: string; reference: string; detail: string }

const usd = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
const errorText = (error: unknown) => (typeof error === 'string' ? error : 'Something went wrong. Please try again.')
const PRESETS = [20, 50, 100, 250]

/** Keep an amount to digits, one decimal point, two decimals and seven whole digits. */
function cleanAmount(raw: string): string {
  let value = raw.replace(/[^0-9.]/g, '')
  const dot = value.indexOf('.')
  if (dot !== -1) value = value.slice(0, dot + 1) + value.slice(dot + 1).replace(/\./g, '')
  let [whole, cents] = value.split('.')
  whole = whole.replace(/^0+(?=\d)/, '').slice(0, 7)
  if (cents !== undefined) return `${whole || '0'}.${cents.slice(0, 2)}`
  return whole
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span className="hr-avatar" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">
      {initials(name) || '?'}
    </span>
  )
}

/** True on phones, where Hoardrun's own keypad replaces the phone keyboard. */
function useCompactKeypad() {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const update = () => setCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return compact
}

/** Close a floating panel on an outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) close() }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, close])
  return ref
}

/** The pill at the top of the stage: who it's from or to, tap to change. */
function PartyPill({ label, name, detail, placeholder, open, onToggle, icon }: {
  label: string; name?: string; detail?: string; placeholder: string; open: boolean; onToggle: () => void; icon?: React.ReactNode
}) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} aria-haspopup="dialog" className="hr-focus hr-party">
      <span className="hr-party-label">{label}</span>
      {name ? (icon ?? <Avatar name={name} size={26} />) : <span className="hr-party-ghost" aria-hidden="true"><Plus className="h-3.5 w-3.5" strokeWidth={2.4} /></span>}
      <span className="min-w-0 text-left">
        <span className={`block truncate text-[14px] ${name ? 'font-medium text-white' : 'text-[#c7c7cc]'}`}>{name ?? placeholder}</span>
        {name && detail && <span className="block truncate text-[11.5px] text-[#8e8e93]">{detail}</span>}
      </span>
      <ChevronDown className={`h-4 w-4 flex-none text-[#8e8e93] transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
    </button>
  )
}

export function SendMoneyPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const compact = useCompactKeypad()
  const [mode, setMode] = useState<Mode>('hoardrun')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [picker, setPicker] = useState<Picker>(null)
  const [cash, setCash] = useState<number | null>(null)
  const [recent, setRecent] = useState<Recipient[]>([])
  const [query, setQuery] = useState('')
  const [lookup, setLookup] = useState<{ email: string; name: string } | null | 'none'>(null)
  const [recipient, setRecipient] = useState<Recipient | null>(null)
  const [sourceId, setSourceId] = useState('')
  const [beneficiaryId, setBeneficiaryId] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [reviewing, setReviewing] = useState(false)
  const [sending, setSending] = useState(false)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [depositOpen, setDepositOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [addRecipientOpen, setAddRecipientOpen] = useState(false)
  const amountInput = useRef<HTMLInputElement>(null)
  const closePicker = useCallback(() => setPicker(null), [])
  const pickerRef = useDismiss(picker !== null, closePicker)

  const { accounts, fetchAccounts } = useBankAccounts()
  const { beneficiaries, fetchBeneficiaries } = useBeneficiaries()
  const banks = (Array.isArray(accounts) ? accounts : []).filter((account: any) => account.isPlaidAccount)
  const payees = Array.isArray(beneficiaries) ? beneficiaries : []

  const loadCash = useCallback(async () => {
    const [balance, recents] = await Promise.all([apiClient.getCashBalance(), apiClient.getRecentCashRecipients()])
    setCash(Number(balance.data?.cash_available) || 0)
    setRecent(recents.data?.data ?? [])
  }, [])

  useEffect(() => {
    if (!user) return
    loadCash()
    fetchAccounts()
    fetchBeneficiaries()
  }, [user, loadCash, fetchAccounts, fetchBeneficiaries])

  useEffect(() => {
    if (!sourceId && banks[0]) setSourceId(banks[0].id)
  }, [banks, sourceId])

  // Look up a Hoardrun member as an email is typed
  useEffect(() => {
    const email = query.trim()
    if (!isEmail(email)) {
      setLookup(null)
      return
    }
    const timer = window.setTimeout(async () => {
      const response = await apiClient.lookupCashRecipient(email)
      setLookup(response.data?.found ? { email, name: response.data.name } : 'none')
    }, 350)
    return () => window.clearTimeout(timer)
  }, [query])

  const value = Number(amount) || 0
  const source = banks.find((account: any) => account.id === sourceId)
  const payee = payees.find((item) => item.id === beneficiaryId)

  // Bank transfers get a real fee quote once there's an account, a recipient and an amount
  useEffect(() => {
    setQuote(null)
    if (mode !== 'bank' || !value || !sourceId || !beneficiaryId) return
    let cancelled = false
    const timer = window.setTimeout(async () => {
      const response = await apiClient.createPlaidTransferQuote({ source_account_id: sourceId, beneficiary_id: beneficiaryId, amount: value })
      const data = response.data?.data?.quote
      if (!cancelled && data) setQuote({ fee: Number(data.total_fees), total: Number(data.total_cost) })
    }, 400)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [mode, value, sourceId, beneficiaryId])

  const press = useCallback((key: string) => {
    if (key === 'back') return setAmount((current) => current.slice(0, -1))
    setAmount((current) => cleanAmount(current + key))
  }, [])

  // On a computer, typing digits anywhere fills the amount
  useEffect(() => {
    if (compact) return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, [role=dialog]')) return
      if (/^[0-9.]$/.test(event.key)) {
        event.preventDefault()
        amountInput.current?.focus()
        press(event.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [compact, press])

  const balance = mode === 'hoardrun' ? cash : source ? Number(source.balance) : null
  const balanceLabel = mode === 'hoardrun' ? 'Hoardrun cash' : source ? `${source.name ?? 'Bank'} ••${source.mask ?? ''}` : 'your bank'
  const over = balance !== null && value > balance
  const ready = value >= 1 && !over && (mode === 'hoardrun' ? !!recipient : !!source && !!payee)
  const toName = mode === 'hoardrun' ? recipient?.name : payee?.name
  const feeValue = mode === 'hoardrun' ? 0 : quote?.fee ?? null
  const cashEmpty = mode === 'hoardrun' && cash !== null && cash < 1

  const send = async () => {
    setSending(true)
    const response = mode === 'hoardrun'
      ? await apiClient.sendCash({ recipient_email: recipient!.email, amount: value, note: note.trim() || undefined })
      : await apiClient.sendMoney({ source_account_id: sourceId, beneficiary_id: beneficiaryId, amount: value, description: note.trim() || 'Bank transfer' })
    setSending(false)
    if (response.error) {
      toast({ title: "Couldn't send", description: errorText(response.error), variant: 'destructive' })
      return
    }
    const data = response.data?.data ?? {}
    setReceipt({
      amount: value,
      to: toName ?? 'Recipient',
      reference: data.reference ?? data.transfer?.transfer_id ?? data.transfer_id ?? '',
      detail: mode === 'hoardrun' ? 'Arrived instantly in their Hoardrun cash' : 'On its way by ACH, usually 1–3 business days',
    })
    setReviewing(false)
    setAmount('')
    setNote('')
    setNoteOpen(false)
    if (mode === 'hoardrun') {
      setCash(Number(data.cash_available) || 0)
      loadCash()
    } else {
      fetchAccounts()
    }
  }

  const choose = (item: Recipient) => {
    setRecipient(item)
    setQuery('')
    setPicker(null)
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setPicker(null)
  }

  const length = (amount || '0').replace('.', '').length
  const amountSize = length > 6 ? 'text-[48px] sm:text-[60px]' : length > 4 ? 'text-[58px] sm:text-[72px]' : 'text-[68px] sm:text-[84px]'

  const cta = ready
    ? `Send ${usd(value)}`
    : value < 1 ? 'Enter an amount' : over ? `More than ${balanceLabel}` : mode === 'hoardrun' ? 'Choose who to pay' : !source ? 'Connect a bank to send' : 'Choose a recipient'

  const fee = feeValue === null ? '—' : feeValue === 0 ? 'Free' : usd(feeValue)
  const payLabel = ready && toName ? `Pay ${toName.split(' ')[0]}` : cta

  return (
    <div className="mx-auto w-full max-w-[1040px] space-y-3 sm:space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link href="/home" aria-label="Back to Home" className="hr-focus hr-send-back"><ArrowLeft className="h-4 w-4" strokeWidth={2} /></Link>
          <h1 className="truncate whitespace-nowrap text-[20px] font-semibold tracking-[-0.01em] sm:text-[24px]">Send money</h1>
        </div>
        <div className="hr-choice hr-choice-sm" role="radiogroup" aria-label="How to send">
          <button type="button" role="radio" aria-checked={mode === 'hoardrun'} onClick={() => switchMode('hoardrun')} className="hr-focus inline-flex items-center justify-center gap-1.5"><Zap className="h-3.5 w-3.5" strokeWidth={2.2} />Hoardrun</button>
          <button type="button" role="radio" aria-checked={mode === 'bank'} onClick={() => switchMode('bank')} className="hr-focus inline-flex items-center justify-center gap-1.5"><Landmark className="h-3.5 w-3.5" strokeWidth={2.2} />Bank</button>
        </div>
      </header>

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        {/* The money: a bold blue panel, giant amount and a keypad (Cash App) */}
        <section className={`hr-cash ${ready ? 'is-ready' : ''} ${over ? 'is-over' : ''}`} aria-label="Amount">
          <div className="lg:hidden">
        {/* Who: one pill per side, tap to choose */}
        <div ref={pickerRef} className="relative z-20 flex flex-wrap items-center justify-center gap-2">
          {mode === 'bank' && (
            <PartyPill
              label="From" name={source ? `${source.name ?? 'Bank'}` : undefined} detail={source ? `•• ${source.mask ?? '----'}` : undefined}
              placeholder="Connect a bank" open={picker === 'from'}
              onToggle={() => (banks.length ? setPicker(picker === 'from' ? null : 'from') : setConnectOpen(true))}
              icon={<span className="hr-bank-chip !h-[26px] !w-[26px] !rounded-[8px]" aria-hidden="true"><Building2 className="h-3.5 w-3.5" strokeWidth={2.2} /></span>}
            />
          )}
          <PartyPill
            label="To" name={toName} detail={mode === 'hoardrun' ? recipient?.email : payee ? `${payee.bankName ?? 'Bank'} •• ${String(payee.accountNumber ?? '').slice(-4)}` : undefined}
            placeholder={mode === 'hoardrun' ? 'Choose who to pay' : 'Choose a recipient'} open={picker === 'to'}
            onToggle={() => (mode === 'bank' && !payees.length ? setAddRecipientOpen(true) : setPicker(picker === 'to' ? null : 'to'))}
          />

          <AnimatePresence>
            {picker && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="hr-picker" role="dialog" aria-label={picker === 'from' ? 'Send from' : 'Send to'}
              >
                {picker === 'to' && mode === 'hoardrun' && (
                  <>
                    <label className="relative block">
                      <span className="sr-only">Their email</span>
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" strokeWidth={2} />
                      <input autoFocus type="email" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by email" className="hr-picker-search" autoComplete="off" />
                    </label>
                    {lookup && lookup !== 'none' && (
                      <button onClick={() => choose({ name: lookup.name, email: lookup.email })} className="hr-focus hr-picker-row">
                        <Avatar name={lookup.name} size={34} />
                        <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{lookup.name}</span><span className="block truncate text-[12px] text-[#8e8e93]">On Hoardrun</span></span>
                        <ArrowUpRight className="h-4 w-4 text-[#8e8e93]" strokeWidth={2} />
                      </button>
                    )}
                    {lookup === 'none' && <p className="px-2 py-2 text-[12.5px] text-[#8e8e93]">No one on Hoardrun uses that email. Check it, or switch to Bank.</p>}
                    {!query && (recent.length ? (
                      <>
                        <p className="hr-picker-head">Recent</p>
                        {recent.slice(0, 5).map((item) => (
                          <button key={item.email} onClick={() => choose(item)} className="hr-focus hr-picker-row">
                            <Avatar name={item.name} size={34} />
                            <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{item.name}</span><span className="block truncate text-[12px] text-[#8e8e93]">{item.email}</span></span>
                          </button>
                        ))}
                      </>
                    ) : <p className="px-2 py-2 text-[12.5px] text-[#8e8e93]">Type the email they use on Hoardrun.</p>)}
                  </>
                )}
                {picker === 'to' && mode === 'bank' && (
                  <>
                    <p className="hr-picker-head">Recipients</p>
                    {payees.map((item) => (
                      <button key={item.id} onClick={() => { setBeneficiaryId(item.id); setPicker(null) }} className="hr-focus hr-picker-row" aria-current={item.id === beneficiaryId}>
                        <Avatar name={item.name} size={34} />
                        <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{item.name}</span><span className="block truncate text-[12px] text-[#8e8e93]">{item.bankName} •• {String(item.accountNumber ?? '').slice(-4)}</span></span>
                        {item.id === beneficiaryId && <Check className="h-4 w-4" strokeWidth={2.4} />}
                      </button>
                    ))}
                    <button onClick={() => { setPicker(null); setAddRecipientOpen(true) }} className="hr-focus hr-picker-row text-[#c7c7cc]"><span className="hr-party-ghost !h-[34px] !w-[34px]"><Plus className="h-4 w-4" strokeWidth={2.2} /></span>Add a recipient</button>
                  </>
                )}
                {picker === 'from' && (
                  <>
                    <p className="hr-picker-head">Your banks</p>
                    {banks.map((account: any) => (
                      <button key={account.id} onClick={() => { setSourceId(account.id); setPicker(null) }} className="hr-focus hr-picker-row" aria-current={account.id === sourceId}>
                        <span className="hr-bank-chip" aria-hidden="true"><Building2 className="h-4 w-4" strokeWidth={2} /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{account.name ?? 'Bank account'}</span><span className="block text-[12px] text-[#8e8e93]">•• {account.mask ?? '----'} · {usd(Number(account.balance) || 0)}</span></span>
                        {account.id === sourceId && <Check className="h-4 w-4" strokeWidth={2.4} />}
                      </button>
                    ))}
                    <button onClick={() => { setPicker(null); setConnectOpen(true) }} className="hr-focus hr-picker-row text-[#c7c7cc]"><span className="hr-party-ghost !h-[34px] !w-[34px]"><Plus className="h-4 w-4" strokeWidth={2.2} /></span>Connect another bank</button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
          </div>

          <div className="hr-cash-top">
            <span className="hr-cash-balance" aria-live="polite"><Wallet className="h-3.5 w-3.5" strokeWidth={2.2} />{over ? `More than your ${usd(balance ?? 0)}` : balance === null ? (mode === 'bank' ? 'No bank connected' : 'Hoardrun cash') : `${usd(balance)} ${mode === 'bank' ? `in ${balanceLabel}` : 'available'}`}</span>
            {cashEmpty && <button type="button" onClick={() => setDepositOpen(true)} className="hr-focus hr-cash-link">Add money</button>}
            {mode === 'bank' && !source && <button type="button" onClick={() => setConnectOpen(true)} className="hr-focus hr-cash-link">Connect bank</button>}
          </div>

          <label className={`hr-cash-amount ${amountSize}`}>
            <span className="sr-only">Amount in US dollars</span>
            <span className="hr-cash-currency" aria-hidden="true">$</span>
            <input
              ref={amountInput}
              value={amount}
              onChange={(event) => setAmount(cleanAmount(event.target.value))}
              inputMode={compact ? 'none' : 'decimal'}
              readOnly={compact}
              placeholder="0"
              aria-invalid={over}
              style={{ width: `${Math.max(1, (amount || '0').length) + 0.15}ch` }}
            />
          </label>

          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map((preset) => (
              <button key={preset} type="button" onClick={() => setAmount(String(preset))} aria-pressed={amount === String(preset)} className="hr-focus hr-cash-preset">${preset}</button>
            ))}
          </div>

          <div className="hr-cash-keypad" role="group" aria-label="Amount keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'].map((key) => (
              <button key={key} type="button" onClick={() => press(key)} className="hr-focus" aria-label={key === 'back' ? 'Delete' : key === '.' ? 'Decimal point' : key}>
                {key === 'back' ? <Delete className="mx-auto h-5 w-5" strokeWidth={2} /> : key}
              </button>
            ))}
          </div>

          <div className="lg:hidden">
            {noteOpen || note ? (
              <input autoFocus={noteOpen && !note} value={note} onChange={(event) => setNote(event.target.value)} maxLength={140} placeholder="What's it for?" aria-label="Note" className="hr-cash-note" />
            ) : (
              <button type="button" onClick={() => setNoteOpen(true)} className="hr-focus mx-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] text-white/80 hover:text-white"><PenLine className="h-3.5 w-3.5" strokeWidth={2} />Add a note</button>
            )}
          </div>

          <button onClick={() => setReviewing(true)} disabled={!ready} className="hr-focus hr-cash-pay lg:hidden">
            {ready && toName ? <Avatar name={toName} size={26} /> : null}
            <span>{payLabel}</span>
            {ready && <Send className="h-4 w-4" strokeWidth={2.4} />}
          </button>
        </section>

        {/* Who and what happens (desktop): quick-send faces, then a Wise-style summary */}
        <aside className="hr-cash-side hidden lg:flex" aria-label="Who to pay">
          {mode === 'hoardrun' ? (
            <div className="space-y-3">
              <h2 className="hr-cash-side-title">Send to</h2>
              {recipient ? (
                <div className="hr-cash-chosen">
                  <Avatar name={recipient.name} size={46} />
                  <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-semibold">{recipient.name}</p><p className="truncate text-[12.5px] text-[#8e8e93]">{recipient.email}</p></div>
                  <button onClick={() => setRecipient(null)} className="hr-focus rounded-full px-3 py-1 text-[12.5px] text-[#c7c7cc] ring-1 ring-white/15 hover:text-white">Change</button>
                </div>
              ) : (
                <>
                  <label className="relative block">
                    <span className="sr-only">Their email</span>
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" strokeWidth={2} />
                    <input type="email" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name@email.com" className="hr-cash-search" autoComplete="off" />
                  </label>
                  {lookup && lookup !== 'none' && (
                    <button onClick={() => choose({ name: lookup.name, email: lookup.email })} className="hr-focus hr-picker-row !bg-white/[0.05]">
                      <Avatar name={lookup.name} size={36} />
                      <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{lookup.name}</span><span className="block text-[12px] text-[#8e8e93]">On Hoardrun · tap to choose</span></span>
                    </button>
                  )}
                  {lookup === 'none' && <p className="text-[12.5px] text-[#8e8e93]">No one on Hoardrun uses that email. Check it, or switch to Bank.</p>}
                  <div>
                    <p className="hr-cash-side-sub">Quick send</p>
                    {recent.length ? (
                      <div className="hr-quick">
                        {recent.slice(0, 8).map((item) => (
                          <button key={item.email} onClick={() => choose(item)} className="hr-focus hr-quick-person" title={item.email}>
                            <Avatar name={item.name} size={48} />
                            <span>{item.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 rounded-2xl border border-dashed border-white/12 p-3 text-[12.5px] text-[#8e8e93]">People you pay will show up here for one-tap sending.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between"><h2 className="hr-cash-side-title">From</h2><button onClick={() => setConnectOpen(true)} className="hr-focus inline-flex items-center gap-1 rounded-full text-[12.5px] text-[#c7c7cc] hover:text-white"><Plus className="h-3.5 w-3.5" />Connect</button></div>
                <div className="mt-2 space-y-1.5" role="radiogroup" aria-label="Bank account to send from">
                  {banks.length ? banks.map((account: any) => (
                    <button key={account.id} type="button" role="radio" aria-checked={account.id === sourceId} onClick={() => setSourceId(account.id)} className="hr-focus hr-cash-option">
                      <span className="hr-bank-chip !h-8 !w-8" aria-hidden="true"><Building2 className="h-4 w-4" strokeWidth={2} /></span>
                      <span className="min-w-0 flex-1 text-left"><span className="block truncate text-[13.5px] font-medium">{account.name ?? 'Bank account'}</span><span className="block text-[11.5px] opacity-70">•• {account.mask ?? '----'}</span></span>
                      <span className="text-[12.5px] tabular-nums">{usd(Number(account.balance) || 0)}</span>
                    </button>
                  )) : (
                    <button onClick={() => setConnectOpen(true)} className="hr-focus hr-cash-option !border-dashed"><span className="hr-party-ghost !h-8 !w-8"><Landmark className="h-4 w-4" strokeWidth={2} /></span><span className="text-left text-[13px]">Connect your bank securely with Plaid</span></button>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between"><h2 className="hr-cash-side-title">To</h2><button onClick={() => setAddRecipientOpen(true)} className="hr-focus inline-flex items-center gap-1 rounded-full text-[12.5px] text-[#c7c7cc] hover:text-white"><Plus className="h-3.5 w-3.5" />Add</button></div>
                <div className="mt-2 space-y-1.5" role="radiogroup" aria-label="Recipient">
                  {payees.length ? payees.slice(0, 4).map((item) => (
                    <button key={item.id} type="button" role="radio" aria-checked={item.id === beneficiaryId} onClick={() => setBeneficiaryId(item.id)} className="hr-focus hr-cash-option">
                      <Avatar name={item.name} size={32} />
                      <span className="min-w-0 flex-1 text-left"><span className="block truncate text-[13.5px] font-medium">{item.name}</span><span className="block truncate text-[11.5px] opacity-70">{item.bankName} •• {String(item.accountNumber ?? '').slice(-4)}</span></span>
                    </button>
                  )) : (
                    <button onClick={() => setAddRecipientOpen(true)} className="hr-focus hr-cash-option !border-dashed"><span className="hr-party-ghost !h-8 !w-8"><Plus className="h-4 w-4" strokeWidth={2} /></span><span className="text-left text-[13px]">Add someone's US bank details</span></button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto space-y-3">
            <dl className="hr-cash-summary">
              <div><dt>Fee</dt><dd>{fee}</dd></div>
              <div><dt>Arrives</dt><dd>{mode === 'hoardrun' ? 'Instantly' : '1–3 business days'}</dd></div>
              <div><dt>They get</dt><dd className="tabular-nums">{usd(value)}</dd></div>
            </dl>
            <label className="relative block">
              <span className="sr-only">Note</span>
              <PenLine className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" strokeWidth={2} />
              <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={140} placeholder="Add a note (optional)" className="hr-cash-search" />
            </label>
            <button onClick={() => setReviewing(true)} disabled={!ready} className="hr-focus hr-cash-pay is-side">
              {ready && toName ? <Avatar name={toName} size={26} /> : null}
              <span>{ready ? `Pay ${usd(value)}` : cta}</span>
              {ready && <Send className="h-4 w-4" strokeWidth={2.4} />}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-[#6e6e73]"><ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />You'll review before anything is sent</p>
          </div>
        </aside>
      </div>

      <Sheet open={reviewing} onClose={() => setReviewing(false)} label="Review">
        <SheetHeader title="Review" onClose={() => setReviewing(false)} />
        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8">
          <div className="flex flex-col items-center pt-2 text-center">
            <Avatar name={toName ?? '?'} size={64} />
            <p className="mt-3 text-[14px] text-[#a1a1a6]">You're sending</p>
            <p className="hr-figure text-[48px] leading-none">{usd(value)}</p>
            <p className="mt-2 text-[15px]">to {toName}</p>
          </div>
          <dl className="divide-y divide-white/[0.07] rounded-[20px] border border-white/[0.08] text-[14px]">
            <div className="flex justify-between px-4 py-3"><dt className="text-[#8e8e93]">From</dt><dd>{mode === 'hoardrun' ? 'Hoardrun cash' : `${source?.name ?? 'Bank'} ••${source?.mask ?? ''}`}</dd></div>
            <div className="flex justify-between px-4 py-3"><dt className="text-[#8e8e93]">Speed</dt><dd>{mode === 'hoardrun' ? 'Instant' : '1–3 business days'}</dd></div>
            <div className="flex justify-between px-4 py-3"><dt className="text-[#8e8e93]">Fee</dt><dd>{feeValue === null ? '—' : feeValue === 0 ? 'Free' : usd(feeValue)}</dd></div>
            {note.trim() && <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-[#8e8e93]">Note</dt><dd className="truncate">{note.trim()}</dd></div>}
          </dl>
          <button onClick={send} disabled={sending} className="hr-focus h-14 w-full rounded-full bg-white text-[16px] font-medium text-black disabled:opacity-60">{sending ? 'Sending…' : `Send ${usd(value)}`}</button>
        </div>
      </Sheet>

      <AnimatePresence>
        {receipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Sent">
            <motion.div initial={{ y: 30, scale: 0.94, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 20 }} className="hr-certificate w-full max-w-sm text-center">
              <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }} className="hr-sent-orb mx-auto"><Check className="h-9 w-9" strokeWidth={3} /></motion.span>
              <p className="mt-5 text-[13px] font-medium uppercase tracking-[0.14em] text-[#8e8e93]">Sent</p>
              <p className="hr-figure mt-1 text-[48px] leading-none">{usd(receipt.amount)}</p>
              <p className="mt-2 text-[15px]">to {receipt.to}</p>
              <p className="mt-1 text-[13px] text-[#a1a1a6]">{receipt.detail}</p>
              {receipt.reference && <p className="mt-4 text-[11px] tabular-nums text-[#8e8e93]">{receipt.reference}</p>}
              <button onClick={() => setReceipt(null)} className="hr-focus mt-6 h-12 w-full rounded-full bg-white text-[15px] font-medium text-black">Done</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DepositModal open={depositOpen} onOpenChange={setDepositOpen} />
      <ConnectBankAccountModal open={connectOpen} onOpenChange={setConnectOpen} onSuccess={() => { fetchAccounts(); toast({ title: 'Bank connected', description: 'You can send from it now.' }) }} />
      <AddBeneficiaryModal open={addRecipientOpen} onOpenChange={setAddRecipientOpen} onSuccess={() => fetchBeneficiaries()} />
    </div>
  )
}
