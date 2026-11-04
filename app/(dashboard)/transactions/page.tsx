'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { DepositModal } from '@/components/deposit-modal'
import { SectionFooter } from '@/components/ui/section-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTransactions } from '@/hooks/useTransactions'
import { useToast } from '@/components/ui/use-toast'
import { PageHero, StatPills, HeroAction, CountUp, usd } from '@/components/app/page-hero'
import { HexCoinGraphic, CoinsGraphic } from '@/components/app/home-graphics'
import { 
  Receipt, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

export default function TransactionsPage() {
  const { theme } = useTheme()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  
  const transactionHook = useTransactions()
  const { transactions, isLoading, error, fetchTransactionHistory } = transactionHook

  // Fetch transactions on component mount
  useEffect(() => {
    const loadTransactions = async () => {
      if (fetchTransactionHistory) {
        await fetchTransactionHistory()
      }
    }
    loadTransactions()
  }, [fetchTransactionHistory])

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory
    const matchesType = selectedType === 'all' || 
      (selectedType === 'income' && transaction.type === 'DEPOSIT') ||
      (selectedType === 'expense' && transaction.type !== 'DEPOSIT')
    return matchesSearch && matchesCategory && matchesType
  })

  const { toast } = useToast()

  // Downloads what's on screen, filters included, as a CSV that opens in Excel, Numbers or Sheets
  const exportTransactions = () => {
    if (filteredTransactions.length === 0) {
      toast({ title: 'Nothing to export yet', description: 'Transactions you make will appear here first.' })
      return
    }
    const cell = (value: unknown) => {
      // Amounts stay numbers so spreadsheets can add them up
      if (typeof value === 'number') return value.toFixed(2)
      let text = String(value ?? '')
      // A leading =, +, - or @ would run as a formula in a spreadsheet
      if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
      return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
    }
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toISOString().slice(0, 10),
      t.description,
      t.category,
      t.type === 'DEPOSIT' ? 'Money in' : 'Money out',
      t.type === 'DEPOSIT' ? Math.abs(t.amount) : -Math.abs(t.amount),
      'USD',
      t.id,
    ])
    const csv = [['Date', 'Description', 'Category', 'Type', 'Amount', 'Currency', 'Reference'], ...rows]
      .map(row => row.map(cell).join(','))
      .join('\r\n')
    // The byte-order mark makes Excel read the file as UTF-8
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `hoardrun-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast({ title: 'Export ready', description: `${filteredTransactions.length} transaction${filteredTransactions.length === 1 ? '' : 's'} saved as CSV.` })
  }

  const totalIncome = transactions.filter(t => t.type === 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(transactions.filter(t => t.type !== 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0))
  const netAmount = totalIncome - totalExpenses

  return (
    <div className="w-full">
      <div className="w-full space-y-4 pb-28 sm:space-y-5 lg:pb-8">
            <PageHero
              title="Transactions"
              subtitle="Every dollar in and out of your account."
              tone="amber"
              graphic={HexCoinGraphic}
              figureLabel="Net this month"
              figure={<CountUp value={netAmount} format={(n) => (n < 0 ? '-' : '') + usd(Math.abs(n))} />}
              actions={
                <HeroAction onClick={exportTransactions}>
                  <Receipt className="h-4 w-4" strokeWidth={2.2} />
                  Export
                </HeroAction>
              }
            />

            <StatPills
              items={[
                { label: 'Money in', value: <CountUp value={totalIncome} format={(n) => usd(n, 0)} />, note: 'This month', tone: 'mint', icon: ArrowDownLeft },
                { label: 'Money out', value: <CountUp value={totalExpenses} format={(n) => usd(n, 0)} />, note: 'This month', tone: 'coral', icon: ArrowUpRight },
                { label: 'Net amount', value: <CountUp value={Math.abs(netAmount)} format={(n) => usd(n, 0)} />, note: `${netAmount >= 0 ? 'Positive' : 'Negative'} balance`, tone: 'sky', icon: DollarSign },
                { label: 'Transactions', value: transactions.length, note: 'Total count', tone: 'iris', icon: Receipt },
              ]}
            />

            {/* Filters */}
            <div className="hr-filter-bar hr-rise" style={{ animationDelay: '120ms' }}>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Transaction Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Salary">Salary</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Transportation">Transportation</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            </div>

            {/* Transactions List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Transactions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {filteredTransactions.length} transactions found
                </p>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 && (
                  <div className="hr-promo !min-h-[170px]" style={{ ['--tone' as string]: '251 191 36' }}>
                    <span className="hr-promo-art"><CoinsGraphic tone="amber" className="h-full w-full" /></span>
                    <div className="relative max-w-[62%]">
                      <h3 className="hr-card-title text-[21px]">{transactions.length === 0 ? 'No transactions yet' : 'Nothing matches'}</h3>
                      <p className="hr-sub mt-1.5 !text-[#aeaeb2]">{transactions.length === 0 ? 'Add money or send some and it will show up here.' : 'Try another search or filter.'}</p>
                    </div>
                  </div>
                )}
                <div className="divide-y divide-white/[0.06]">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="hr-tx-row"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="hr-tx-icon" data-tone={transaction.type === 'DEPOSIT' ? 'mint' : 'coral'}>
                          {transaction.type === 'DEPOSIT' ? (
                            <ArrowDownLeft className="h-4 w-4" strokeWidth={2.2} />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm sm:text-base truncate">{transaction.description}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <p className={`hr-figure text-[16px] ${transaction.type === 'DEPOSIT' ? 'text-[#6ee7b7]' : 'text-white'}`}>
                          {transaction.type === 'DEPOSIT' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
        <SectionFooter section="financial" activePage="/transactions" />
      </div>
    </div>
  )
}
