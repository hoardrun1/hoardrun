'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Building2, Check, Delete, Landmark, PenLine, Plus, Search, Wallet, X, Zap } from 'lucide-react'
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

function Avatar({ name, size = 40, muted = false }: { name: string; size?: number; muted?: boolean }) {
  return (
    <span className="hr-avatar" style={{ width: size, height: size, fontSize: size * 0.36, opacity: muted ? 0.75 : 1 }} aria-hidden="true">
      {initials(name) || '?'}
    </span>
  )
}

/** True on small touch screens, where Hoardrun's own keypad replaces the phone keyboard. */
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

/** The amount: typed on a computer, tapped on a compact keypad on a phone. */
function AmountField({ amount, setAmount, over, compact }: { amount: string; setAmount: (value: string) => void; over: boolean; compact: boolean }) {
  const input = useRef<HTMLInputElement>(null)
  const press = useCallback((key: string) => {
    if (key === 'back') return setAmount(amount.slice(0, -1))
    setAmount(cleanAmount(amount + key))
  }, [amount, setAmount])

  // On a computer, typing digits anywhere on the page fills the amount
  useEffect(() => {
    if (compact) return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, [role=dialog]')) return
      if (/^[0-9.]$/.test(event.key)) {
        event.preventDefault()
        input.current?.focus()
        press(event.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [compact, press])

  const length = (amount || '0').replace('.', '').length
  const size = length > 6 ? 'text-[38px] sm:text-[44px]' : length > 4 ? 'text-[46px] sm:text-[54px]' : 'text-[54px] sm:text-[64px]'

  return (
    <>
      <label className="hr-send-amount">
        <span className="sr-only">Amount in US dollars</span>
        <span className={`hr-figure ${size} ${over ? 'text-[#ff9f95]' : amount ? 'text-white' : 'text-[#48484a]'}`} aria-hidden="true">$</span>
        <input
          ref={input}
          value={amount}
          onChange={(event) => setAmount(cleanAmount(event.target.value))}
          inputMode={compact ? 'none' : 'decimal'}
          readOnly={compact}
          placeholder="0"
          aria-invalid={over}
          className={`hr-figure ${size} ${over ? 'text-[#ff9f95]' : 'text-white'}`}
          style={{ width: `${Math.max(1, (amount || '0').length) + 0.3}ch` }}
        />
      </label>
      {compact && (
        <div className="hr-keypad" role="group" aria-label="Amount keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'].map((key) => (
            <button key={key} type="button" onClick={() => press(key)} className="hr-focus" aria-label={key === 'back' ? 'Delete' : key === '.' ? 'Decimal point' : key}>
              {key === 'back' ? <Delete className="mx-auto h-5 w-5" strokeWidth={1.8} /> : key}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

/** Desktop: the transfer taking shape as the form is filled in. */
function TransferPreview({ from, to, amount, mode, fee, note }: { from: string; to?: string; amount: number; mode: Mode; fee: string; note: string }) {
  return (
    <aside className="hr-send-preview hidden lg:flex" aria-label="Transfer preview">
      <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#8e8e93]">Preview</p>
      <div className="hr-send-route" aria-hidden="true">
        <span className="hr-send-node"><Avatar name={from} size={52} /><span>You</span></span>
        <span className="hr-send-path"><span className="hr-send-pulse" /></span>
        <span className="hr-send-node">
          {to ? <Avatar name={to} size={52} /> : <span className="hr-send-ghost"><ArrowUpRight className="h-5 w-5" strokeWidth={2} /></span>}
          <span className="max-w-[110px] truncate">{to ? to.split(' ')[0] : 'Recipient'}</span>
        </span>
      </div>
      <p className="hr-figure text-center text-[40px] leading-none">{usd(amount)}</p>
      <dl className="hr-send-facts">
        <div><dt>Speed</dt><dd>{mode === 'hoardrun' ? 'Instant' : '1–3 business days'}</dd></div>
        <div><dt>Fee</dt><dd>{fee}</dd></div>
        <div><dt>Note</dt><dd className="truncate">{note.trim() || '—'}</dd></div>
      </dl>
    </aside>
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
  const balanceLabel = mode === 'hoardrun' ? 'Hoardrun cash' : source ? `${source.name ?? 'Bank'} ••${source.mask ?? ''}` : 'No bank yet'
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
    setNoteOpen(false)
    if (mode === 'hoardrun') {
      setCash(Number(data.cash_available) || 0)
      loadCash()
    } else {
      fetchAccounts()
    }
  }

  const pickRecent = (item: Recipient) => {
    setRecipient(item)
    setQuery('')
  }

  const cta = ready
    ? `Send ${usd(value)}${toName ? ` to ${toName.split(' ')[0]}` : ''}`
    : value < 1 ? 'Enter an amount' : over ? `More than your ${balanceLabel}` : mode === 'hoardrun' ? 'Choose who to pay' : 'Choose an account and recipient'

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href="/home" aria-label="Back to Home" className="hr-focus hr-send-back"><ArrowLeft className="h-4 w-4" strokeWidth={2} /></Link>
          <div>
            <h1 className="text-[22px] font-semibold leading-tight sm:text-[26px]">Send money</h1>
            <p className="text-[12.5px] text-[#8e8e93]">{mode === 'hoardrun' ? 'Instant and free to anyone on Hoardrun' : 'To any US bank account by ACH'}</p>
          </div>
        </div>
        <div className="hr-choice hr-choice-sm" role="radiogroup" aria-label="How to send">
          <button type="button" role="radio" aria-checked={mode === 'hoardrun'} onClick={() => setMode('hoardrun')} className="hr-focus inline-flex items-center justify-center gap-1.5"><Zap className="h-3.5 w-3.5" strokeWidth={2.2} />Hoardrun</button>
          <button type="button" role="radio" aria-checked={mode === 'bank'} onClick={() => setMode('bank')} className="hr-focus inline-flex items-center justify-center gap-1.5"><Landmark className="h-3.5 w-3.5" strokeWidth={2.2} />Bank</button>
        </div>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="hr-send-card" aria-label="Send">
          {/* Who */}
          {mode === 'hoardrun' ? (
            <div className="hr-send-row">
              <span className="hr-send-label">To</span>
              {recipient ? (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={recipient.name} size={36} />
                  <div className="min-w-0 flex-1"><p className="truncate text-[14.5px] font-medium">{recipient.name}</p><p className="truncate text-[12px] text-[#8e8e93]">{recipient.email}</p></div>
                  <button onClick={() => setRecipient(null)} aria-label="Change recipient" className="hr-focus hr-send-icon-btn"><X className="h-4 w-4" strokeWidth={2} /></button>
                </div>
              ) : (
                <div className="min-w-0 flex-1">
                  <label className="relative block">
                    <span className="sr-only">Their email</span>
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" strokeWidth={2} />
                    <input type="email" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Email of a Hoardrun member" className="hr-send-input !pl-10" autoComplete="off" />
                  </label>
                  <AnimatePresence initial={false}>
                    {lookup && lookup !== 'none' && (
                      <motion.button
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        onClick={() => pickRecent({ name: lookup.name, email: lookup.email })}
                        className="hr-focus mt-2 flex w-full items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] p-2.5 text-left hover:border-white/30"
                      >
                        <Avatar name={lookup.name} size={34} />
                        <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{lookup.name}</span><span className="block text-[12px] text-[#8e8e93]">On Hoardrun · tap to choose</span></span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                  {lookup === 'none' && <p className="mt-2 text-[12.5px] text-[#8e8e93]">No one on Hoardrun uses that email. Check it, or switch to Bank.</p>}
                  {recent.length > 0 && !query && (
                    <div className="hr-send-chips mt-2.5" aria-label="Recent">
                      {recent.map((item) => (
                        <button key={item.email} onClick={() => pickRecent(item)} className="hr-focus hr-send-chip">
                          <Avatar name={item.name} size={24} />
                          <span>{item.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="hr-send-row">
                <span className="hr-send-label">From</span>
                <div className="hr-send-chips min-w-0 flex-1" role="radiogroup" aria-label="Bank account to send from">
                  {banks.map((account: any) => (
                    <button key={account.id} type="button" role="radio" aria-checked={account.id === sourceId} onClick={() => setSourceId(account.id)} className="hr-focus hr-send-chip">
                      <span className="hr-bank-chip !h-6 !w-6 !rounded-[7px]" aria-hidden="true"><Building2 className="h-3 w-3" strokeWidth={2.2} /></span>
                      <span>{account.name ?? 'Bank'} ••{account.mask ?? ''}</span>
                    </button>
                  ))}
                  <button type="button" onClick={() => setConnectOpen(true)} className="hr-focus hr-send-chip hr-send-chip-add"><Plus className="h-3.5 w-3.5" strokeWidth={2.2} />{banks.length ? 'Connect' : 'Connect your bank'}</button>
                </div>
              </div>
              <div className="hr-send-row">
                <span className="hr-send-label">To</span>
                <div className="hr-send-chips min-w-0 flex-1" role="radiogroup" aria-label="Recipient">
                  {payees.map((item) => (
                    <button key={item.id} type="button" role="radio" aria-checked={item.id === beneficiaryId} onClick={() => setBeneficiaryId(item.id)} className="hr-focus hr-send-chip">
                      <Avatar name={item.name} size={24} />
                      <span>{item.name.split(' ')[0]} ••{String(item.accountNumber ?? '').slice(-4)}</span>
                    </button>
                  ))}
                  <button type="button" onClick={() => setAddRecipientOpen(true)} className="hr-focus hr-send-chip hr-send-chip-add"><Plus className="h-3.5 w-3.5" strokeWidth={2.2} />{payees.length ? 'Add' : 'Add a recipient'}</button>
                </div>
              </div>
            </>
          )}

          {/* How much */}
          <div className="hr-send-money">
            <AmountField amount={amount} setAmount={setAmount} over={over} compact={compact} />
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${over ? 'bg-[#ff9f95]/10 text-[#ff9f95]' : 'bg-white/[0.05] text-[#a1a1a6]'}`}>
                <Wallet className="h-3.5 w-3.5" strokeWidth={2} />
                {balance === null ? balanceLabel : `${usd(balance)} available`}
              </span>
              {!compact && PRESETS.map((preset) => (
                <button key={preset} type="button" onClick={() => setAmount(String(preset))} className="hr-focus hr-send-preset">${preset}</button>
              ))}
            </div>
            {compact && (
              <div className="mt-2 flex justify-center gap-1.5">
                {PRESETS.map((preset) => (
                  <button key={preset} type="button" onClick={() => setAmount(String(preset))} className="hr-focus hr-send-preset">${preset}</button>
                ))}
              </div>
            )}
          </div>

          {/* Note */}
          {noteOpen || note ? (
            <label className="hr-send-row !py-2.5">
              <span className="hr-send-label">Note</span>
              <input autoFocus={noteOpen && !note} value={note} onChange={(event) => setNote(event.target.value)} maxLength={140} placeholder="What's it for?" className="hr-send-input" />
            </label>
          ) : (
            <button type="button" onClick={() => setNoteOpen(true)} className="hr-focus mx-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-[#a1a1a6] hover:text-white"><PenLine className="h-3.5 w-3.5" strokeWidth={2} />Add a note</button>
          )}

          {mode === 'bank' && quote && <p className="text-center text-[12px] text-[#8e8e93]">Fee {usd(quote.fee)} · total {usd(quote.total)} · arrives in 1–3 business days</p>}

          {cashEmpty && (
            <p className="text-center text-[12.5px] text-[#a1a1a6]">
              Your Hoardrun cash is empty.{' '}
              <button type="button" onClick={() => setDepositOpen(true)} className="hr-focus rounded font-medium text-white underline underline-offset-2">Add money</button>
            </p>
          )}

          <button onClick={() => setReviewing(true)} disabled={!ready} className="hr-focus hr-send-cta">
            {ready && <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />}
            {cta}
          </button>
        </section>

        <TransferPreview
          from={user?.name || 'You'}
          to={toName}
          amount={value}
          mode={mode}
          fee={fee}
          note={note}
        />
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
