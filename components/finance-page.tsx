'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Building2, Loader2, Plus, RefreshCcw, Search, Unlink } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { PlaidLink } from '@/components/plaid/PlaidLink'
import { BankMoveDialog, type BankDirection } from '@/components/bank/bank-move-dialog'
import { usePlaid } from '@/hooks/usePlaid'
import { apiClient, type BankTransfer, type PlaidAccount, type PlaidConnection } from '@/lib/api-client'
import { formatCurrency } from '@/lib/banking'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  merchant: string
  status: string
}

const INCOME_TYPES = /deposit|income|credit|refund|interest/i
const PLAID_BUTTON = 'inline-flex h-10 shrink-0 items-center rounded-full border border-white/20 px-4 text-sm font-medium'

const isThisMonth = (value: string) => {
  const date = new Date(value)
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

const sum = (items: Transaction[]) => items.reduce((total, item) => total + item.amount, 0)

const ON_THE_WAY = ['pending', 'posted']

// What an ACH transfer's status means to the person
const transferState = (t: BankTransfer) => {
  if (ON_THE_WAY.includes(t.status)) return 'On the way'
  if (t.status === 'settled' || t.status === 'funds_available') return t.direction === 'deposit' ? 'Added' : 'Arrived'
  if (t.status === 'returned') return t.direction === 'deposit' ? 'Returned by your bank' : 'Returned to your cash'
  if (t.status === 'failed') return t.direction === 'deposit' ? 'Failed' : 'Failed, back in your cash'
  return 'Cancelled'
}

export function FinancePageComponent() {
  const { toast } = useToast()
  const { getAccounts, syncTransactions } = usePlaid()
  const [bankAccounts, setBankAccounts] = useState<PlaidAccount[]>([])
  const [banks, setBanks] = useState<PlaidConnection[]>([])
  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>([])
  const [sandbox, setSandbox] = useState(false)
  const [move, setMove] = useState<{ direction: BankDirection; accountId: string } | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [transactionsFailed, setTransactionsFailed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [plaidAvailable, setPlaidAvailable] = useState(false)
  const [hasPlaidAccounts, setHasPlaidAccounts] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // The linked banks' own balances and activity (Plaid amounts are positive for money out)
  const loadFromPlaid = useCallback(async () => {
    const [accounts, transactionsResponse] = await Promise.all([getAccounts(), apiClient.getPlaidTransactions()])
    setBankAccounts(accounts || [])
    setBalance((accounts || []).reduce((total, account) => total + (account.balances?.current || 0), 0))
    setTransactionsFailed(Boolean(transactionsResponse.error))
    setTransactions((transactionsResponse.data ?? []).map((t: any) => ({
      id: t.transaction_id,
      type: Number(t.amount) > 0 ? 'expense' : 'income', // Plaid: positive means money out
      amount: Math.abs(Number(t.amount)),
      description: t.name,
      category: t.merchant_name || 'General',
      date: t.date,
      merchant: t.merchant_name || t.name,
      status: t.pending ? 'pending' : 'completed',
    })))
  }, [getAccounts])

  const loadFromAccount = useCallback(async () => {
    const [transactionsResponse, dashboardResponse] = await Promise.all([
      apiClient.getTransactions({ limit: 50 }),
      apiClient.getDashboard(),
    ])

    if (dashboardResponse.error || !dashboardResponse.data) {
      setError(true)
      return
    }
    const dashboard = dashboardResponse.data.data ?? dashboardResponse.data
    setBalance(dashboard.financial_summary?.balances?.total_balance?.amount ?? 0)

    setTransactionsFailed(Boolean(transactionsResponse.error))
    const body: any = (transactionsResponse.data as any)?.data ?? transactionsResponse.data
    const list: any[] = Array.isArray(body) ? body : body?.transactions ?? body?.items ?? []
    setTransactions(list.map((t) => ({
      id: t.id,
      type: INCOME_TYPES.test(String(t.type)) ? 'income' : 'expense',
      amount: Math.abs(Number(t.amount) || 0),
      description: t.description || 'Transaction',
      category: t.category || 'General',
      date: t.date || t.created_at,
      merchant: t.beneficiary || t.merchant || '',
      status: String(t.status || 'completed').toLowerCase(),
    })))
  }, [])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(false)
    setTransactionsFailed(false)
    try {
      // Bank linking is optional: if it's unavailable the page still works from the account's own data.
      const [status, connections, transfers] = await Promise.all([
        apiClient.getPlaidStatus(), apiClient.getPlaidConnections(), apiClient.getBankTransfers(),
      ])
      setPlaidAvailable(Boolean(status.data?.configured))
      setSandbox(Boolean(status.data?.sandbox))
      setBanks(Array.isArray(connections.data) ? connections.data : [])
      setBankTransfers(transfers.data?.transfers ?? [])
      const connected = !connections.error && Array.isArray(connections.data) && connections.data.length > 0
      setHasPlaidAccounts(connected)
      if (!connected) setBankAccounts([])
      await (connected ? loadFromPlaid() : loadFromAccount())
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }, [loadFromAccount, loadFromPlaid])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSyncPlaid = async () => {
    setSyncing(true)
    try {
      await syncTransactions()
      await fetchData()
      toast({ title: "Accounts updated", description: "Your latest activity is now showing." })
    } catch {
      toast({ title: "We couldn't update your accounts", description: "Please try again in a moment.", variant: "destructive" })
    } finally {
      setSyncing(false)
    }
  }

  const handlePlaidSuccess = async () => {
    await fetchData()
    toast({ title: "Bank account connected", description: "Your accounts and activity will show here." })
  }

  const unlinkBank = async (bank: PlaidConnection) => {
    if (!window.confirm(`Unlink ${bank.institution_name || 'this bank'}? Transfers already on the way still finish.`)) return
    const response = await apiClient.disconnectPlaidConnection(bank.connection_id)
    if (response.error) {
      toast({ title: "Couldn't unlink the bank", description: response.error, variant: "destructive" })
      return
    }
    toast({ title: "Bank unlinked", description: response.data?.message })
    fetchData()
  }

  // Plaid sandbox only: push a test transfer along to see what happens next
  const simulate = async (transfer: BankTransfer, event: 'settled' | 'failed') => {
    const response = await apiClient.simulateBankTransfer(transfer.transfer_id, event)
    if (response.error) {
      toast({ title: "Test step failed", description: response.error, variant: "destructive" })
      return
    }
    window.dispatchEvent(new Event('hoardrun:balance-changed'))
    fetchData()
  }

  const thisMonth = useMemo(() => transactions.filter((t) => isThisMonth(t.date)), [transactions])
  const income = sum(thisMonth.filter((t) => t.type === 'income'))
  const expenses = sum(thisMonth.filter((t) => t.type === 'expense'))

  const chartData = useMemo(() => {
    const months = new Map<string, { name: string; income: number; expenses: number }>()
    ;[...transactions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((t) => {
        const date = new Date(t.date)
        const key = `${date.getFullYear()}-${date.getMonth()}`
        const month = months.get(key) ?? { name: date.toLocaleDateString(undefined, { month: 'short' }), income: 0, expenses: 0 }
        if (t.type === 'income') month.income += t.amount
        else month.expenses += t.amount
        months.set(key, month)
      })
    return Array.from(months.values()).slice(-6)
  }, [transactions])

  const categories = useMemo(() => {
    const spending = transactions.filter((t) => t.type === 'expense')
    const total = sum(spending)
    const totals = new Map<string, number>()
    spending.forEach((t) => totals.set(t.category, (totals.get(t.category) || 0) + t.amount))
    return Array.from(totals.entries())
      .map(([name, amount]) => ({ name, amount, percentage: total > 0 ? (amount / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [transactions])

  const visibleTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return transactions
    return transactions.filter((t) => `${t.description} ${t.merchant}`.toLowerCase().includes(query))
  }, [transactions, searchQuery])

  const moneyOrDash = (value: number) => (transactionsFailed ? '--' : formatCurrency(value))

  const stats = [
    { label: 'Total balance', value: balance === null ? '--' : formatCurrency(balance) },
    { label: 'Income this month', value: moneyOrDash(income) },
    { label: 'Spent this month', value: moneyOrDash(expenses) },
    { label: 'Saved this month', value: transactionsFailed || income <= 0 ? '--' : `${(((income - expenses) / income) * 100).toFixed(0)}%` },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="hr-title">Finance</h1>
          <p className="mt-1 text-sm text-[#a1a1a6] sm:text-base">{hasPlaidAccounts ? 'Connected to your bank' : 'Your money at a glance'}</p>
        </div>
        {hasPlaidAccounts ? (
          <Button variant="outline" className="rounded-full" onClick={handleSyncPlaid} disabled={syncing}>
            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Update
          </Button>
        ) : plaidAvailable && (
          <PlaidLink onSuccess={handlePlaidSuccess} className={PLAID_BUTTON}>
            <Building2 className="mr-2 h-4 w-4" />
            Connect bank
          </PlaidLink>
        )}
      </header>

      {error && (
        <div role="alert" className="hr-panel flex items-center justify-between gap-3 px-5 py-4 text-sm">
          <span>We couldn't load your finances.</span>
          <button onClick={fetchData} className="hr-focus shrink-0 font-medium underline underline-offset-4">Try again</button>
        </div>
      )}

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => isLoading ? (
          <div key={stat.label} className="hr-skeleton h-[112px] rounded-[24px]" />
        ) : (
          <div key={stat.label} className="hr-panel flex min-w-0 flex-col justify-between gap-6 p-4 sm:p-5">
            <span className="text-sm text-[#a1a1a6]">{stat.label}</span>
            <span className="truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{stat.value}</span>
          </div>
        ))}
      </section>

      {!isLoading && hasPlaidAccounts && (
        <section aria-label="Your banks" className="hr-panel p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Your banks</h2>
            {plaidAvailable && (
              <PlaidLink onSuccess={handlePlaidSuccess} className={PLAID_BUTTON}>
                <Plus className="mr-2 h-4 w-4" />
                Link another
              </PlaidLink>
            )}
          </div>
          <ul className="mt-3 divide-y divide-white/10">
            {banks.map((bank) => (
              <li key={bank.connection_id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4 shrink-0 text-[#a1a1a6]" />
                    <span className="truncate">{bank.institution_name}</span>
                  </span>
                  <button onClick={() => unlinkBank(bank)} className="hr-focus inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[13px] text-[#a1a1a6] hover:text-white">
                    <Unlink className="h-3.5 w-3.5" />
                    Unlink
                  </button>
                </div>
                {bank.status !== 'active' && (
                  <p className="mt-1 text-[13px] text-[#fbbf24]">{bank.error_message || "This bank needs attention. Unlink it and link it again."}</p>
                )}
                <ul className="mt-2 space-y-2">
                  {bankAccounts.filter((a) => a.connection_id === bank.connection_id).map((account) => (
                    <li key={account.account_id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/[.04] px-3 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{account.name}{account.mask ? ` •••• ${account.mask}` : ''}</span>
                        <span className="block text-[13px] tabular-nums text-[#a1a1a6]">
                          {formatCurrency(account.balances?.available ?? account.balances?.current ?? 0)} available
                        </span>
                      </span>
                      {bank.status === 'active' && account.type === 'depository' && (
                        <span className="flex shrink-0 gap-2">
                          <button onClick={() => setMove({ direction: 'deposit', accountId: account.account_id })} className="hr-focus h-9 rounded-full bg-[#2f6bff] px-4 text-[13px] font-medium text-white">
                            Add money
                          </button>
                          <button onClick={() => setMove({ direction: 'withdrawal', accountId: account.account_id })} className="hr-focus h-9 rounded-full bg-white/10 px-4 text-[13px] font-medium">
                            Withdraw
                          </button>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isLoading && bankTransfers.length > 0 && (
        <section aria-label="Bank transfers" className="hr-panel p-4 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">Bank transfers</h2>
          <ul className="mt-2 divide-y divide-white/10">
            {bankTransfers.slice(0, 8).map((t) => (
              <li key={t.transfer_id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[.08]">
                  {t.direction === 'deposit' ? <ArrowDownLeft className="h-[18px] w-[18px]" /> : <ArrowUpRight className="h-[18px] w-[18px]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{t.direction === 'deposit' ? `From ${t.account}` : `To ${t.account}`}</span>
                  <span className="block truncate text-[13px] text-[#a1a1a6]">
                    {new Date(t.created_at).toLocaleDateString()} · {transferState(t)}{t.failure_reason ? ` · ${t.failure_reason}` : ''}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                  {t.direction === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                {sandbox && ON_THE_WAY.includes(t.status) && (
                  <span className="flex w-full justify-end gap-2 sm:w-auto">
                    <button onClick={() => simulate(t, 'settled')} className="hr-focus rounded-full border border-white/20 px-3 py-1 text-[12px]">Test: settle</button>
                    <button onClick={() => simulate(t, 'failed')} className="hr-focus rounded-full border border-white/20 px-3 py-1 text-[12px]">Test: fail</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isLoading && chartData.length >= 2 && (
        <section className="hr-panel p-4 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">Income and spending</h2>
          <div className="mt-4 h-[240px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="financeIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#a1a1a6', fontSize: 12 }} />
                <YAxis width={44} tickLine={false} axisLine={false} tick={{ fill: '#a1a1a6', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12 }} formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#fff" strokeWidth={2} fill="url(#financeIncome)" />
                <Area type="monotone" dataKey="expenses" name="Spending" stroke="#a1a1a6" strokeWidth={2} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="hr-panel p-4 sm:p-6 lg:col-span-5">
          <h2 className="text-lg font-semibold tracking-tight">Where it goes</h2>
          {categories.length > 0 ? (
            <ul className="mt-5 space-y-4">
              {categories.map((category) => (
                <li key={category.name}>
                  <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate">{category.name}</span>
                    <span className="shrink-0 tabular-nums text-[#a1a1a6]">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-white" style={{ width: `${category.percentage}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#a1a1a6]">{isLoading ? 'Loading…' : 'Your spending by category will show here.'}</p>
          )}
        </section>

        <section className="hr-panel min-w-0 p-4 sm:p-6 lg:col-span-7">
          <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
          {transactions.length > 0 && (
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1a6]" />
              <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search" aria-label="Search activity" className="h-11 pl-10" />
            </div>
          )}
          {visibleTransactions.length > 0 ? (
            <ul className="mt-2 divide-y divide-white/10">
              {visibleTransactions.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[.08]">
                    {t.type === 'income' ? <ArrowDownLeft className="h-[18px] w-[18px]" /> : <ArrowUpRight className="h-[18px] w-[18px]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{t.description}</span>
                    <span className="block truncate text-[13px] text-[#a1a1a6]">
                      {new Date(t.date).toLocaleDateString()} · {t.status === 'pending' ? 'Pending' : t.category}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#a1a1a6]">
              {isLoading
                ? 'Loading…'
                : transactionsFailed
                  ? "We couldn't load your activity right now."
                  : searchQuery
                    ? 'Nothing matches that search.'
                    : 'Nothing here yet. Add money to get started.'}
            </p>
          )}
        </section>
      </div>

      {!isLoading && plaidAvailable && !hasPlaidAccounts && (
        <section className="hr-panel flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
          <p className="text-sm text-[#a1a1a6]">Connect a bank account to add money and withdraw by ACH, and see all your money in one place.</p>
          <PlaidLink onSuccess={handlePlaidSuccess} className={PLAID_BUTTON}>
            <Plus className="mr-2 h-4 w-4" />
            Connect now
          </PlaidLink>
        </section>
      )}

      <BankMoveDialog
        direction={move?.direction ?? null}
        accountId={move?.accountId}
        accounts={bankAccounts.filter((a) => a.type === 'depository' && banks.find((b) => b.connection_id === a.connection_id)?.status === 'active')}
        onOpenChange={(open) => { if (!open) setMove(null) }}
        onDone={() => fetchData()}
      />
    </div>
  )
}
