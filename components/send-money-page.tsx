'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Building2, Check, ChevronDown, Clock3, Landmark, PenLine, Plus, Search, Send, Users, Wallet, Zap } from 'lucide-react'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { useBeneficiaries } from '@/hooks/useBeneficiaries'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'
import { DepositModal } from '@/components/deposit-modal'
import { ConnectBankAccountModal } from '@/components/send-money/ConnectBankAccountModal'
import { AddBeneficiaryModal } from '@/components/send-money/AddBeneficiaryModal'
import { Sheet, SheetHeader } from '@/components/investment-opportunities-page'
import { SendHeroArt } from '@/components/send/send-hero-art'

type Mode = 'hoardrun' | 'bank'
interface Recipient { name: string; email: string }
interface Quote { fee: number; total: number }
interface Receipt { amount: number; to: string; reference: string; detail: string }
interface Person { key: string; name: string; sub: string; selected: boolean; pick: () => void }

const usd = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
const errorText = (error: unknown) => (typeof error === 'string' ? error : 'Something went wrong. Please try again.')
const PRESETS = [50, 100, 250, 500]
const NOTE_MAX = 140

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
    <span className="hr-avatar" style={{ width: size, height: size, fontSize: size * 0.34 }} aria-hidden="true">
      {initials(name) || '?'}
    </span>
  )
}

export function SendMoneyPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [mode, setMode] = useState<Mode>('hoardrun')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [cash, setCash] = useState<number | null>(null)
  const [recent, setRecent] = useState<Recipient[]>([])
  const [showAll, setShowAll] = useState(false)
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
  const searchInput = useRef<HTMLInputElement>(null)
  const amountInput = useRef<HTMLInputElement>(null)

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

  const balance = mode === 'hoardrun' ? cash : source ? Number(source.balance) : null
  const balanceLabel = mode === 'hoardrun' ? 'Hoardrun cash' : source ? `${source.name ?? 'Bank'} ••${source.mask ?? ''}` : 'your bank'
  const over = balance !== null && value > balance
  const ready = value >= 1 && !over && (mode === 'hoardrun' ? !!recipient : !!source && !!payee)
  const toName = mode === 'hoardrun' ? recipient?.name : payee?.name
  const fee = mode === 'hoardrun' ? 'Free' : quote ? usd(quote.fee) : '—'
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
  }

  // The round faces: recent people on Hoardrun, saved recipients for bank transfers
  const people: Person[] = mode === 'hoardrun'
    ? recent.map((item) => ({ key: item.email, name: item.name, sub: item.email, selected: recipient?.email === item.email, pick: () => choose(item) }))
    : payees.map((item) => ({ key: item.id, name: item.name, sub: `${item.bankName ?? 'Bank'} •• ${String(item.accountNumber ?? '').slice(-4)}`, selected: item.id === beneficiaryId, pick: () => setBeneficiaryId(item.id) }))
  // A chosen Hoardrun member who isn't in the recent list still gets a face
  if (mode === 'hoardrun' && recipient && !people.some((person) => person.selected)) {
    people.unshift({ key: recipient.email, name: recipient.name, sub: recipient.email, selected: true, pick: () => undefined })
  }
  const visible = showAll ? people : people.slice(0, 4)

  const addContact = () => {
    if (mode === 'bank') setAddRecipientOpen(true)
    else searchInput.current?.focus()
  }

  const ctaLabel = ready
    ? `Send ${usd(value)}`
    : value < 1 ? 'Enter an amount' : over ? `More than your ${balanceLabel}` : mode === 'hoardrun' ? 'Choose who to pay' : !source ? 'Connect a bank first' : 'Choose a recipient'

  return (
    <div className="hr-sendx mx-auto w-full max-w-[1120px]">
      <header className="flex items-center justify-between">
        <Link href="/home" aria-label="Back to Home" className="hr-focus hr-sendx-round"><ArrowLeft className="h-5 w-5" strokeWidth={2} /></Link>
        <h1 className="text-[19px] font-semibold tracking-[-0.01em] sm:text-[21px]">Send Money</h1>
        <Link href="/transactions" aria-label="Transfer history" className="hr-focus hr-sendx-round"><Clock3 className="h-5 w-5" strokeWidth={2} /></Link>
      </header>

      <div className="hr-sendx-grid">
        {/* Hero */}
        <section className="hr-sendx-hero" aria-label="About sending">
          <div className="relative z-10 max-w-[300px] lg:max-w-none">
            <span className="hr-sendx-badge"><Zap className="h-3.5 w-3.5" strokeWidth={2.4} fill="currentColor" />Fast • Secure • Reliable</span>
            <h2 className="hr-sendx-title">Send money<br />with <span className="hr-sendx-ease">ease<svg viewBox="0 0 120 12" aria-hidden="true"><path d="M2 9 C 30 2, 80 2, 118 7" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" /></svg></span></h2>
            <p className="hr-sendx-lede">Transfer money anytime, anywhere with confidence.</p>
          </div>
          <SendHeroArt className="hr-sendx-art" />
        </section>

        <div className="hr-sendx-stack">
          {/* Recipient */}
          <section className="hr-sendx-card" aria-labelledby="send-recipient">
            <div className="flex items-center justify-between gap-3">
              <h2 id="send-recipient" className="hr-sendx-card-title"><Users className="h-5 w-5 text-[#4d94ff]" strokeWidth={2.2} />Recipient</h2>
              <div className="hr-sendx-mode" role="radiogroup" aria-label="How to send">
                <button type="button" role="radio" aria-checked={mode === 'hoardrun'} onClick={() => { setMode('hoardrun'); setShowAll(false) }} className="hr-focus">Hoardrun</button>
                <button type="button" role="radio" aria-checked={mode === 'bank'} onClick={() => { setMode('bank'); setShowAll(false) }} className="hr-focus">Bank</button>
              </div>
            </div>

            {mode === 'hoardrun' && (
              <label className="relative mt-3 block">
                <span className="sr-only">Search by email</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8e8e93]" strokeWidth={2} />
                <input ref={searchInput} type="email" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by email" className="hr-sendx-search" autoComplete="off" />
              </label>
            )}
            <AnimatePresence initial={false}>
              {mode === 'hoardrun' && lookup && lookup !== 'none' && (
                <motion.button initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={() => choose({ name: lookup.name, email: lookup.email })} className="hr-focus hr-sendx-found">
                  <Avatar name={lookup.name} size={36} />
                  <span className="min-w-0 flex-1 text-left"><span className="block truncate text-[14px] font-medium">{lookup.name}</span><span className="block text-[12px] text-[#8e8e93]">On Hoardrun · tap to choose</span></span>
                  <Check className="h-4 w-4 text-[#4d94ff]" strokeWidth={2.6} />
                </motion.button>
              )}
            </AnimatePresence>
            {mode === 'hoardrun' && lookup === 'none' && <p className="mt-2 text-[12.5px] text-[#8e8e93]">No one on Hoardrun uses that email. Check it, or switch to Bank.</p>}

            <div className="hr-sendx-people" role="radiogroup" aria-label={mode === 'hoardrun' ? 'Recent people' : 'Bank recipients'}>
              {visible.map((person) => (
                <button key={person.key} type="button" role="radio" aria-checked={person.selected} onClick={person.pick} title={person.sub} className="hr-focus hr-sendx-person">
                  <span className="relative">
                    <Avatar name={person.name} size={54} />
                    {person.selected && <span className="hr-sendx-tick" aria-hidden="true"><Check className="h-3 w-3" strokeWidth={3.2} /></span>}
                  </span>
                  <span className="hr-sendx-person-name">{person.name}</span>
                </button>
              ))}
              <button type="button" onClick={addContact} className="hr-focus hr-sendx-person">
                <span className="hr-sendx-add" aria-hidden="true"><Plus className="h-6 w-6" strokeWidth={2} /></span>
                <span className="hr-sendx-person-name">{mode === 'bank' ? 'Add recipient' : 'New person'}</span>
              </button>
            </div>
            {people.length > 4 && (
              <button type="button" onClick={() => setShowAll((open) => !open)} className="hr-focus mt-1 inline-flex items-center gap-1 rounded-full text-[13px] font-medium text-[#4d94ff]">
                {showAll ? 'Show less' : `View all ${people.length}`}<ChevronDown className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} strokeWidth={2.2} />
              </button>
            )}
            {!people.length && <p className="mt-1 text-[12.5px] text-[#8e8e93]">{mode === 'hoardrun' ? 'People you pay will appear here for one-tap sending.' : 'Add someone’s US bank details to send to their bank.'}</p>}
          </section>

          {/* Amount */}
          <section className={`hr-sendx-card ${over ? 'is-over' : ''}`} aria-labelledby="send-amount">
            <div className="flex items-center justify-between gap-3">
              <h2 id="send-amount" className="hr-sendx-card-title"><Wallet className="h-5 w-5 text-[#4d94ff]" strokeWidth={2.2} />Amount</h2>
              <span className="hr-sendx-currency"><span aria-hidden="true" className="hr-sendx-coin">$</span>USD</span>
            </div>
            <label className="hr-sendx-amount mt-3">
              <span className="hr-sendx-amount-code">USD</span>
              <span className="hr-sendx-amount-sep" aria-hidden="true" />
              <span className="sr-only">Amount in US dollars</span>
              <input
                ref={amountInput}
                value={amount}
                onChange={(event) => setAmount(cleanAmount(event.target.value))}
                onBlur={() => { if (amount && !amount.includes('.')) setAmount(`${amount}.00`) }}
                inputMode="decimal"
                placeholder="0.00"
                aria-invalid={over}
              />
            </label>
            <div className="hr-sendx-presets">
              {PRESETS.map((preset) => (
                <button key={preset} type="button" onClick={() => setAmount(`${preset}.00`)} aria-pressed={value === preset} className="hr-focus hr-sendx-chip">${preset.toLocaleString('en-US')}</button>
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
              {mode === 'bank' ? (
                banks.length ? (
                  <label className="inline-flex items-center gap-1.5 text-[#a1a1a6]">
                    <Building2 className="h-3.5 w-3.5" strokeWidth={2.2} />From
                    <select value={sourceId} onChange={(event) => setSourceId(event.target.value)} className="hr-sendx-select" aria-label="Bank account to send from">
                      {banks.map((account: any) => <option key={account.id} value={account.id}>{account.name ?? 'Bank'} ••{account.mask ?? ''}</option>)}
                    </select>
                  </label>
                ) : (
                  <button type="button" onClick={() => setConnectOpen(true)} className="hr-focus inline-flex items-center gap-1.5 rounded-full font-medium text-[#4d94ff]"><Landmark className="h-3.5 w-3.5" strokeWidth={2.2} />Connect a bank to send from</button>
                )
              ) : <span />}
              <span className={over ? 'text-[#ff9f95]' : 'text-[#a1a1a6]'}>
                {balance === null ? '' : `${usd(balance)} available`}
                {cashEmpty && <>{' · '}<button type="button" onClick={() => setDepositOpen(true)} className="hr-focus rounded font-medium text-[#4d94ff] hover:underline">Add money</button></>}
              </span>
            </div>
          </section>

          {/* Note */}
          <section className="hr-sendx-card hr-sendx-card-sm" aria-labelledby="send-note">
            <h2 id="send-note" className="hr-sendx-card-title !text-[15px]"><PenLine className="h-[18px] w-[18px] text-[#4d94ff]" strokeWidth={2.2} />Note <span className="font-normal text-[#8e8e93]">(optional)</span></h2>
            <label className="relative mt-2.5 block">
              <span className="sr-only">Note</span>
              <input value={note} onChange={(event) => setNote(event.target.value.slice(0, NOTE_MAX))} maxLength={NOTE_MAX} placeholder="Add a note…" className="hr-sendx-note" />
              <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] tabular-nums text-[#6e6e73]">{note.length}/{NOTE_MAX}</span>
            </label>
          </section>

          <div>
            <button onClick={() => setReviewing(true)} disabled={!ready} className="hr-focus hr-sendx-cta">
              <Send className="h-5 w-5" strokeWidth={2.2} />
              <span>{ctaLabel}{ready && toName ? ` to ${toName.split(' ')[0]}` : ''}</span>
              <span className="hr-sendx-cta-arrow" aria-hidden="true"><ArrowRight className="h-5 w-5" strokeWidth={2.4} /></span>
            </button>
            <p className="mt-2 text-center text-[12px] text-[#8e8e93]">{fee === 'Free' ? 'Free' : `Fee ${fee}`} · {mode === 'hoardrun' ? 'arrives instantly' : 'arrives in 1–3 business days'} · you'll review before sending</p>
          </div>
        </div>
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
            <div className="flex justify-between px-4 py-3"><dt className="text-[#8e8e93]">Fee</dt><dd>{fee}</dd></div>
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
