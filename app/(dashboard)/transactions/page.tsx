'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'
import { SectionFooter } from '@/components/ui/section-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

// Mock transaction data
const transactions = [
  {
    id: '1',
    type: 'income',
    description: 'Salary Deposit',
    amount: 5000,
    date: '2024-01-15',
    category: 'Salary',
    status: 'completed'
  },
  {
    id: '2',
    type: 'expense',
    description: 'Grocery Shopping',
    amount: -120.50,
    date: '2024-01-14',
    category: 'Food',
    status: 'completed'
  },
  {
    id: '3',
    type: 'expense',
    description: 'Gas Station',
    amount: -45.00,
    date: '2024-01-13',
    category: 'Transportation',
    status: 'completed'
  },
  {
    id: '4',
    type: 'income',
    description: 'Freelance Payment',
    amount: 800,
    date: '2024-01-12',
    category: 'Freelance',
    status: 'completed'
  },
  {
    id: '5',
    type: 'expense',
    description: 'Netflix Subscription',
    amount: -15.99,
    date: '2024-01-11',
    category: 'Entertainment',
    status: 'completed'
  }
]

export default function TransactionsPage() {
  const { theme } = useTheme()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory
    const matchesType = selectedType === 'all' || transaction.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))
  const netAmount = totalIncome - totalExpenses

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-background pt-16 pb-32 px-4 sm:pt-20 sm:pb-32 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Transactions
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  View and manage your transaction history
                </p>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                <Receipt className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    ${totalIncome.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ${totalExpenses.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netAmount >= 0 ? 'text-foreground' : 'text-foreground'}`}>
                    ${Math.abs(netAmount).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {netAmount >= 0 ? 'Positive' : 'Negative'} balance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {transactions.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Total count</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
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
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
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
              </CardContent>
            </Card>

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {filteredTransactions.length} transactions found
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className={`p-1.5 sm:p-2 rounded-full ${
                          transaction.type === 'income'
                            ? 'bg-muted'
                            : 'bg-muted'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4 text-foreground" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm sm:text-base truncate">{transaction.description}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <p className={`font-bold text-sm sm:text-base ${
                          transaction.type === 'income' ? 'text-foreground' : 'text-foreground'
                        }`}>
                          {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
        <SectionFooter section="financial" activePage="/transactions" />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
