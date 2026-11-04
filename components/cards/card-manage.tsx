'use client'

import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, BarChart2, ChevronRight, DollarSign, Download, Loader2, Shield, Star, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'

export interface ManagedCard {
  id: string
  lastFourDigits: string
  network: string
  cardholderName: string
  isLocked: boolean
  isContactless: boolean
  onlinePayments: boolean
  isDefault: boolean
  perTransactionLimit: number | null
  monthlyLimit: number | null
  source: string
}

type View = 'menu' | 'transactions' | 'limits' | 'security'
type CardTransaction = { id: string; date: string; description: string; amount: number; direction: string; status: string; reference: string }

const usd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

/** Manage one card: its transactions, limits, security switches and a statement download. */
export function CardManageDialog({ card, onClose, onChanged }: { card: ManagedCard | null; onClose: () => void; onChanged: () => void }) {
  const { toast } = useToast()
  const [view, setView] = useState<View>('menu')
  const [history, setHistory] = useState<{ items: CardTransaction[]; total: number } | null>(null)
  const [limits, setLimits] = useState({ perTransaction: '', monthly: '' })
  const [busy, setBusy] = useState(false)

  // Start over only when a different card is opened; saved changes refresh the card without leaving the screen
  useEffect(() => {
    if (!card) return
    setView('menu')
    setHistory(null)
    setLimits({ perTransaction: card.perTransactionLimit ? String(card.perTransactionLimit) : '', monthly: card.monthlyLimit ? String(card.monthlyLimit) : '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id])

  if (!card) return null
  const label = `${card.network.replace('_', ' ')} •••• ${card.lastFourDigits}`

  const loadHistory = async () => {
    const response = await apiClient.getCardTransactions(card.id)
    if (response.error) {
      toast({ title: "Couldn't load transactions", description: response.error, variant: 'destructive' })
      return null
    }
    const data = { items: response.data?.items ?? [], total: response.data?.total ?? 0 }
    setHistory(data)
    return data
  }

  const update = async (changes: Record<string, unknown>, done: string) => {
    setBusy(true)
    const response = await apiClient.updatePaymentMethod(card.id, changes)
    setBusy(false)
    if (response.error) {
      toast({ title: "Couldn't save", description: response.error, variant: 'destructive' })
      return false
    }
    toast({ title: done, description: label })
    onChanged()
    return true
  }

  const downloadStatement = async () => {
    setBusy(true)
    const data = history ?? (await loadHistory())
    setBusy(false)
    if (!data) return
    if (data.items.length === 0) {
      toast({ title: 'Nothing to put in a statement yet', description: 'Payments made with this card will appear here first.' })
      return
    }
    const cell = (value: unknown) => {
      if (typeof value === 'number') return value.toFixed(2)
      let text = String(value ?? '')
      // A leading =, +, - or @ would run as a formula in a spreadsheet
      if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
      return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
    }
    const rows = data.items.map((t: CardTransaction) => [t.date.slice(0, 10), t.description, t.direction === 'outbound' ? -t.amount : t.amount, t.status, t.reference])
    const csv = [[`Statement for ${label}`], ['Date', 'Description', 'Amount (USD)', 'Status', 'Reference'], ...rows]
      .map((row) => row.map(cell).join(','))
      .join('\r\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `hoardrun-card-${card.lastFourDigits}-statement-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast({ title: 'Statement ready', description: `${data.items.length} payment${data.items.length === 1 ? '' : 's'} saved as CSV.` })
  }

  const saveLimits = async () => {
    const per = limits.perTransaction ? Number(limits.perTransaction) : 0
    const monthly = limits.monthly ? Number(limits.monthly) : 0
    if (Number.isNaN(per) || Number.isNaN(monthly) || per < 0 || monthly < 0) {
      toast({ title: 'Enter amounts in dollars', description: 'Leave a box empty for no limit.', variant: 'destructive' })
      return
    }
    if (await update({ per_transaction_limit: per, monthly_limit: monthly }, 'Limits saved')) setView('menu')
  }

  const removeCard = async () => {
    if (!window.confirm(`Remove ${label} from Hoardrun? You can add it again later.`)) return
    setBusy(true)
    const response = await apiClient.deletePaymentMethod(card.id)
    setBusy(false)
    if (response.error) {
      toast({ title: "Couldn't remove the card", description: response.error, variant: 'destructive' })
      return
    }
    toast({ title: 'Card removed', description: label })
    onChanged()
    onClose()
  }

  const back = (
    <button type="button" onClick={() => setView('menu')} className="hr-focus -ml-1 mb-1 inline-flex items-center gap-1 rounded-full px-1 text-[13px] text-[#a1a1a6] hover:text-white">
      <ArrowLeft className="h-4 w-4" /> Back
    </button>
  )

  return (
    <Dialog open={!!card} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="hr-topup max-h-[92dvh] overflow-y-auto sm:max-w-[440px]">
        {view === 'menu' && (
          <>
            <DialogTitle className="hr-title !text-[26px]">Manage card</DialogTitle>
            <DialogDescription className="capitalize text-[#a1a1a6]">{label}{card.isDefault ? ' · default' : ''}</DialogDescription>
            <div className="mt-2 grid gap-2">
              {[
                { icon: BarChart2, title: 'View Transactions', text: 'Payments made with this card', tone: 'sky', onClick: () => { setView('transactions'); loadHistory() } },
                { icon: DollarSign, title: 'Set Spending Limits', text: card.monthlyLimit || card.perTransactionLimit ? `${card.perTransactionLimit ? `${usd(card.perTransactionLimit)} a payment` : ''}${card.perTransactionLimit && card.monthlyLimit ? ' · ' : ''}${card.monthlyLimit ? `${usd(card.monthlyLimit)} a month` : ''}` : 'No limits set', tone: 'mint', onClick: () => setView('limits') },
                { icon: Shield, title: 'Security Settings', text: card.isLocked ? 'Locked' : 'Lock, contactless and online payments', tone: 'coral', onClick: () => setView('security') },
                { icon: Download, title: 'Download Statement', text: 'Card payments as a CSV file', tone: 'violet', onClick: downloadStatement },
              ].map(({ icon: Icon, title, text, tone, onClick }) => (
                <button key={title} type="button" onClick={onClick} disabled={busy} className="hr-card-option hr-focus text-left">
                  <span className="hr-card-action-icon !h-11 !w-11" data-tone={tone}><Icon className="h-5 w-5" strokeWidth={2} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white">{title}</span>
                    <span className="block truncate text-sm text-[#8e8e93]">{text}</span>
                  </span>
                  {busy && title === 'Download Statement' ? <Loader2 className="h-4 w-4 animate-spin text-[#8e8e93]" /> : <ChevronRight className="h-4 w-4 text-[#8e8e93]" />}
                </button>
              ))}
            </div>
          </>
        )}

        {view === 'transactions' && (
          <>
            {back}
            <DialogTitle className="hr-title !text-[24px]">Card transactions</DialogTitle>
            <DialogDescription className="capitalize text-[#a1a1a6]">{label}</DialogDescription>
            {!history ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#8e8e93]" /></div>
            ) : history.items.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-[#8e8e93]">No payments with this card yet. When you add money with it, they show up here.</p>
            ) : (
              <>
                <p className="text-[13px] text-[#a1a1a6]">{history.items.length} payment{history.items.length === 1 ? '' : 's'} · {usd(history.total)}</p>
                <ul className="divide-y divide-white/[0.06] rounded-2xl bg-[#141416]">
                  {history.items.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 px-3 py-3">
                      <span className="hr-tx-icon" data-tone={t.direction === 'outbound' ? 'coral' : 'mint'}>
                        {t.direction === 'outbound' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] text-white">{t.description}</span>
                        <span className="block text-[12px] text-[#8e8e93]">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                      <span className={`hr-figure text-[15px] ${t.direction === 'outbound' ? 'text-white' : 'text-[#6ee7b7]'}`}>
                        {t.direction === 'outbound' ? '-' : '+'}{usd(t.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        {view === 'limits' && (
          <>
            {back}
            <DialogTitle className="hr-title !text-[24px]">Spending limits</DialogTitle>
            <DialogDescription className="text-[#a1a1a6]">
              Saved now. They apply to card payments once Hoardrun issues this card for spending.
            </DialogDescription>
            {([['perTransaction', 'Most for one payment'], ['monthly', 'Most in a month']] as const).map(([key, title]) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-[13px] text-[#a1a1a6]">{title}</span>
                <span className="flex items-center gap-2 rounded-2xl bg-[#1c1c1f] px-4">
                  <span className="text-[#8e8e93]">$</span>
                  <input
                    inputMode="decimal"
                    value={limits[key]}
                    onChange={(e) => /^\d*(\.\d{0,2})?$/.test(e.target.value) && setLimits({ ...limits, [key]: e.target.value })}
                    placeholder="No limit"
                    className="h-12 w-full bg-transparent text-[16px] text-white outline-none placeholder:text-[#6e6e73]"
                  />
                </span>
              </label>
            ))}
            <button type="button" onClick={saveLimits} disabled={busy} className="hr-topup-continue hr-focus mt-2">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}Save limits
            </button>
          </>
        )}

        {view === 'security' && (
          <>
            {back}
            <DialogTitle className="hr-title !text-[24px]">Security</DialogTitle>
            <DialogDescription className="capitalize text-[#a1a1a6]">{label}</DialogDescription>
            <div className="divide-y divide-white/[0.06] rounded-2xl bg-[#141416]">
              {[
                { title: 'Lock card', text: "Hoardrun won't use it until you unlock it", checked: card.isLocked, change: (v: boolean) => update({ status: v ? 'locked' : 'active' }, v ? 'Card locked' : 'Card unlocked') },
                { title: 'Contactless payments', text: 'Tap to pay', checked: card.isContactless, change: (v: boolean) => update({ contactless: v }, v ? 'Contactless on' : 'Contactless off') },
                { title: 'Online payments', text: 'Paying on websites and in apps', checked: card.onlinePayments, change: (v: boolean) => update({ online_payments: v }, v ? 'Online payments on' : 'Online payments off') },
              ].map((row) => (
                <div key={row.title} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <span>
                    <span className="block text-[15px] text-white">{row.title}</span>
                    <span className="block text-[12.5px] text-[#8e8e93]">{row.text}</span>
                  </span>
                  <Switch checked={row.checked} disabled={busy} onCheckedChange={row.change} />
                </div>
              ))}
            </div>
            {!card.isDefault && (
              <button type="button" disabled={busy} onClick={async () => {
                const response = await apiClient.setDefaultPaymentMethod(card.id)
                if (response.error) toast({ title: "Couldn't set default", description: response.error, variant: 'destructive' })
                else { toast({ title: 'Default card set', description: label }); onChanged() }
              }} className="hr-card-option hr-focus text-left">
                <span className="hr-card-action-icon !h-10 !w-10" data-tone="amber"><Star className="h-[18px] w-[18px]" /></span>
                <span className="flex-1 font-medium text-white">Make this my default card</span>
              </button>
            )}
            <button type="button" onClick={removeCard} disabled={busy} className="inline-flex items-center justify-center gap-1.5 text-[13.5px] text-[#fb7185] hover:underline">
              <Trash2 className="h-4 w-4" /> Remove card from Hoardrun
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
