'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Building2, Check, Delete, Landmark, Plus, Search, Wallet, Zap } from 'lucide-react'
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

function Avatar({ name, size = 44, muted = false }: { name: string; size?: number; muted?: boolean }) {
  return (
    <span className="hr-avatar" style={{ width: size, height: size, fontSize: size * 0.36, opacity: muted ? 0.75 : 1 }} aria-hidden="true">
      {initials(name) || '?'}
    </span>
  )
}

/** Cash App style: one big number, typed or tapped on the keypad. */
function AmountStage({ amount, setAmount, balance, balanceLabel, over }: { amount: string; setAmount: (value: string) => void; balance: number | null; balanceLabel: string; over: boolean }) {
  const press = useCallback((key: string) => {
    const current = amount
    if (key === 'back') return setAmount(current.slice(0, -1))
    if (key === '.') return current.includes('.') ? undefined : setAmount((current || '0') + '.')
    if (current.includes('.') && current.split('.')[1].length >= 2) return
    if (current === '0' && key !== '.') return setAmount(key)
    if (current.replace('.', '').length >= 7) return
    setAmount(current + key)
  }, [amount, setAmount])

  // Typing works too on a computer
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, [role=dialog]')) return
      if (/^[0-9]$/.test(event.key) || event.key === '.') press(event.key)
      else if (event.key === 'Backspace') press('back')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  const [whole, cents] = (amount || '0').split('.')
  const size = whole.length > 5 ? 'text-[60px] sm:text-[72px]' : 'text-[76px] sm:text-[96px]'

  return (
    <section className="hr-send-stage">
      <div className="flex flex-1 flex-col items-center justify-center py-6">
        <motion.p key={amount.length} initial={{ scale: 0.97 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }} className={`hr-figure leading-none ${size} ${over ? 'text-[#ff9f95]' : amount ? 'text-white' : 'text-[#48484a]'}`} aria-live="polite" aria-label={`Amount ${usd(Number(amount) || 0)}`}>
          <span className="text-[0.55em] align-top">$</span>{Number(whole).toLocaleString('en-US')}{amount.includes('.') && <span>.{cents}</span>}
        </motion.p>
        <span className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] ${over ? 'border-[#ff9f95]/40 text-[#ff9f95]' : 'border-white/12 text-[#a1a1a6]'}`}>
          <Wallet className="h-3.5 w-3.5" strokeWidth={2} />
          {over ? `More than your ${balanceLabel}` : balance === null ? balanceLabel : `${balanceLabel} ${usd(balance)}`}
        </span>
        <div className="mt-4 flex gap-2">
          {[20, 50, 100].map((preset) => (
            <button key={preset} type="button" onClick={() => setAmount(String(preset))} className="hr-focus rounded-full border border-white/12 px-3.5 py-1.5 text-[13px] text-[#d1d1d6] hover:border-white/30">${preset}</button>
          ))}
        </div>
      </div>
      <div className="hr-keypad" role="group" aria-label="Amount keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'].map((key) => (
          <button key={key} type="button" onClick={() => press(key)} className="hr-focus" aria-label={key === 'back' ? 'Delete' : key === '.' ? 'Decimal point' : key}>
            {key === 'back' ? <Delete className="mx-auto h-6 w-6" strokeWidth={1.8} /> : key}
          </button>
        ))}
      </div>
    </section>
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
  const over = balance !== null && value > balance
  const ready = value >= 1 && !over && (mode === 'hoardrun' ? !!recipient : !!source && !!payee)
  const toName = mode === 'hoardrun' ? recipient?.name : payee?.name

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

  const pickRecent = (item: Recipient) => {
    setRecipient(item)
    setQuery('')
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <Link href="/home" className="hr-focus -ml-1 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[14px] text-[#a1a1a6] hover:text-white"><ArrowLeft className="h-4 w-4" strokeWidth={2} />Home</Link>
        <h1 className="hr-title mt-2">Send money</h1>
        <p className="hr-sub mt-2">Instantly to anyone on Hoardrun, or to a US bank account by ACH.</p>
      </div>

      <div className="hr-choice max-w-md" role="radiogroup" aria-label="How to send">
        <button type="button" role="radio" aria-checked={mode === 'hoardrun'} onClick={() => setMode('hoardrun')} className="hr-focus inline-flex items-center justify-center gap-1.5"><Zap className="h-3.5 w-3.5" strokeWidth={2.2} />Hoardrun · instant</button>
        <button type="button" role="radio" aria-checked={mode === 'bank'} onClick={() => setMode('bank')} className="hr-focus inline-flex items-center justify-center gap-1.5"><Landmark className="h-3.5 w-3.5" strokeWidth={2.2} />Bank · ACH</button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <AmountStage amount={amount} setAmount={setAmount} balance={balance} balanceLabel={mode === 'hoardrun' ? 'Hoardrun cash' : source ? `${source.name ?? 'Bank'} ••${source.mask ?? ''}` : 'Pick a bank account'} over={over} />

        <div className="space-y-4">
          {mode === 'hoardrun' ? (
            <section className="hr-panel p-5">
              <h2 className="text-[15px] font-medium">To</h2>
              {recipient ? (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.05] p-3">
                  <Avatar name={recipient.name} />
                  <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-medium">{recipient.name}</p><p className="truncate text-[12.5px] text-[#8e8e93]">{recipient.email}</p></div>
                  <button onClick={() => setRecipient(null)} className="hr-focus rounded-full border border-white/15 px-3 py-1 text-[12.5px]">Change</button>
                </div>
              ) : (
                <>
                  <label className="relative mt-3 block">
                    <span className="sr-only">Their email</span>
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e93]" strokeWidth={2} />
                    <input type="email" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Their email address" className="hr-field !rounded-full !pl-10" autoComplete="off" />
                  </label>
                  <AnimatePresence>
                    {lookup && lookup !== 'none' && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 p-3">
                        <Avatar name={lookup.name} />
                        <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-medium">{lookup.name}</p><p className="text-[12.5px] text-[#8e8e93]">On Hoardrun</p></div>
                        <button onClick={() => pickRecent({ name: lookup.name, email: lookup.email })} className="hr-focus rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-black">Send</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {lookup === 'none' && <p className="mt-3 text-[13px] text-[#8e8e93]">No one on Hoardrun uses that email yet. Check it, or send to their bank instead.</p>}
                  {recent.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8e8e93]">Recent</p>
                      <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
                        {recent.map((item) => (
                          <button key={item.email} onClick={() => pickRecent(item)} className="hr-focus flex w-16 shrink-0 flex-col items-center gap-1.5 rounded-xl">
                            <Avatar name={item.name} size={48} />
                            <span className="w-full truncate text-center text-[12px] text-[#c7c7cc]">{item.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          ) : (
            <>
              <section className="hr-panel p-5">
                <div className="flex items-center justify-between"><h2 className="text-[15px] font-medium">From</h2><button onClick={() => setConnectOpen(true)} className="hr-focus inline-flex items-center gap-1 rounded-full text-[13px] text-[#c7c7cc] hover:text-white"><Plus className="h-3.5 w-3.5" />Connect a bank</button></div>
                {banks.length ? (
                  <div className="mt-3 space-y-2" role="radiogroup" aria-label="Bank account to send from">
                    {banks.map((account: any) => (
                      <button key={account.id} type="button" role="radio" aria-checked={account.id === sourceId} onClick={() => setSourceId(account.id)} className="hr-bank-option hr-focus">
                        <span className="hr-bank-chip" aria-hidden="true"><Building2 className="h-4 w-4" strokeWidth={2} /></span>
                        <span className="min-w-0 flex-1 text-left"><span className="block truncate text-[14px] font-medium">{account.name ?? 'Bank account'}</span><span className="block text-[12px] opacity-70">•• {account.mask ?? '----'} · {account.subtype ?? account.type ?? 'checking'}</span></span>
                        <span className="text-[13px] tabular-nums">{usd(Number(account.balance) || 0)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => setConnectOpen(true)} className="hr-focus mt-3 flex w-full items-center gap-3 rounded-2xl border border-dashed border-white/20 p-4 text-left hover:border-white/40">
                    <span className="hr-bank-chip" aria-hidden="true"><Landmark className="h-4 w-4" strokeWidth={2} /></span>
                    <span><span className="block text-[14px] font-medium">Connect your bank</span><span className="block text-[12.5px] text-[#8e8e93]">Chase, Bank of America, Wells Fargo and thousands more, securely through Plaid.</span></span>
                  </button>
                )}
              </section>
              <section className="hr-panel p-5">
                <div className="flex items-center justify-between"><h2 className="text-[15px] font-medium">To</h2><button onClick={() => setAddRecipientOpen(true)} className="hr-focus inline-flex items-center gap-1 rounded-full text-[13px] text-[#c7c7cc] hover:text-white"><Plus className="h-3.5 w-3.5" />Add recipient</button></div>
                {payees.length ? (
                  <div className="mt-3 space-y-2" role="radiogroup" aria-label="Recipient">
                    {payees.map((item) => (
                      <button key={item.id} type="button" role="radio" aria-checked={item.id === beneficiaryId} onClick={() => setBeneficiaryId(item.id)} className="hr-bank-option hr-focus">
                        <Avatar name={item.name} size={36} />
                        <span className="min-w-0 flex-1 text-left"><span className="block truncate text-[14px] font-medium">{item.name}</span><span className="block truncate text-[12px] opacity-70">{item.bankName} •• {String(item.accountNumber ?? '').slice(-4)}</span></span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[13px] text-[#8e8e93]">Add someone's US bank details (routing and account number) to send to them.</p>
                )}
              </section>
            </>
          )}

          <section className="hr-panel p-5">
            <label className="block">
              <span className="text-[15px] font-medium">Note</span>
              <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={140} placeholder="What's it for?" className="hr-field mt-3" />
            </label>
            {mode === 'bank' && quote && <p className="mt-3 text-[12.5px] text-[#8e8e93]">Fee {usd(quote.fee)} · total {usd(quote.total)} · arrives in 1–3 business days</p>}
          </section>

          {mode === 'hoardrun' && cash !== null && cash < 1 && (
            <button onClick={() => setDepositOpen(true)} className="hr-focus flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
              <span className="text-[13.5px] text-[#c7c7cc]">Your Hoardrun cash is empty. Add money to send.</span>
              <span className="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-black">Add money</span>
            </button>
          )}

          <button onClick={() => setReviewing(true)} disabled={!ready} className="hr-focus h-14 w-full rounded-full bg-white text-[16px] font-medium text-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#8e8e93]">
            {ready ? `Send ${usd(value)}${toName ? ` to ${toName.split(' ')[0]}` : ''}` : value < 1 ? 'Enter an amount' : mode === 'hoardrun' ? 'Choose who to pay' : 'Choose an account and recipient'}
          </button>
        </div>
      </div>

      <Sheet open={reviewing} onClose={() => setReviewing(false)} label="Review">
        <SheetHeader title="Review" onClose={() => setReviewing(false)} />
        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8">
          <div className="flex flex-col items-center pt-2 text-center">
            <Avatar name={toName ?? '?'} size={72} />
            <p className="mt-4 text-[14px] text-[#a1a1a6]">You're sending</p>
            <p className="hr-figure text-[52px] leading-none">{usd(value)}</p>
            <p className="mt-2 text-[15px]">to {toName}</p>
          </div>
          <dl className="divide-y divide-white/[0.07] rounded-[20px] border border-white/[0.08] text-[14px]">
            <div className="flex justify-between px-4 py-3"><dt className="text-[#8e8e93]">From</dt><dd>{mode === 'hoardrun' ? 'Hoardrun cash' : `${source?.name ?? 'Bank'} ••${source?.mask ?? ''}`}</dd></div>
            <div className="flex justify-between px-4 py-3"><dt className="text-[#8e8e93]">Speed</dt><dd>{mode === 'hoardrun' ? 'Instant' : '1–3 business days'}</dd></div>
            <div className="flex justify-between px-4 py-3"><dt className="text-[#8e8e93]">Fee</dt><dd>{mode === 'hoardrun' ? 'Free' : quote ? usd(quote.fee) : '—'}</dd></div>
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
