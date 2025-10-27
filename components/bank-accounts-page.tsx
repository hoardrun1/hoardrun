'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  MoreVertical,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Unlink,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { apiClient, type PlaidAccount, type PlaidConnection, type PlaidTransaction } from '@/lib/api-client'
import { PlaidLink } from '@/components/plaid/PlaidLink'
import { usePlaid } from '@/hooks/usePlaid'
import { formatCurrency } from '@/lib/banking'
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content-unified'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'
import { SectionFooter } from '@/components/ui/section-footer'

interface BankAccount extends PlaidAccount {
  connection_id: string
  institution_name: string
  status: string
}

export function BankAccountsPageComponent() {
  const { toast } = useToast()
  const { getConnections, getAccounts, getTransactions, disconnectConnection } = usePlaid()

  const [connections, setConnections] = useState<PlaidConnection[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [showBalances, setShowBalances] = useState(true)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Load data on mount
  useEffect(() => {
    loadBankData()
  }, [])

  const loadBankData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load connections and accounts in parallel
      const [connectionsData, accountsData] = await Promise.all([
        getConnections(),
        getAccounts()
      ])

      setConnections(connectionsData)

      // Enrich accounts with connection info
      const enrichedAccounts: BankAccount[] = accountsData.map(account => {
        const connection = connectionsData.find(conn => conn.id === account.item_id)
        return {
          ...account,
          connection_id: account.item_id,
          institution_name: connection?.institution_name || 'Unknown Bank',
          status: connection?.status || 'unknown'
        }
      })

      setAccounts(enrichedAccounts)

      // Load recent transactions for the first account
      if (enrichedAccounts.length > 0) {
        const recentTransactions = await getTransactions({
          limit: 10,
          account_id: enrichedAccounts[0].account_id
        })
        setTransactions(recentTransactions)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bank accounts'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSyncTransactions = async () => {
    try {
      setSyncing(true)
      await loadBankData()
      toast({
        title: "Success",
        description: "Bank data synchronized successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to sync bank data",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnectAccount = async (connectionId: string) => {
    try {
      await disconnectConnection(connectionId)
      await loadBankData() // Refresh data
      toast({
        title: "Success",
        description: "Bank account disconnected successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to disconnect bank account",
        variant: "destructive",
      })
    }
  }

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      await loadBankData() // Refresh data after new connection
      toast({
        title: "Success",
        description: "Bank account connected successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load updated bank data",
        variant: "destructive",
      })
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      case 'savings':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
      case 'credit':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
    }
  }

  const getInstitutionLogo = (institutionName: string) => {
    // Simple institution logo mapping - in real app, use actual logos
    const logos: Record<string, string> = {
      'Chase': '🏦',
      'Bank of America': '🏦',
      'Wells Fargo': '🏦',
      'Citibank': '🏦',
      'Capital One': '🏦',
    }
    return logos[institutionName] || '🏦'
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button
            onClick={loadBankData}
            variant="outline"
            className="mt-4"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <LayoutWrapper showBreadcrumbs={false}>
          <div className="min-h-screen bg-background pt-16 pb-20 sm:pb-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Bank Accounts</h1>
                  <p className="text-muted-foreground">Manage your connected bank accounts</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncTransactions}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCcw className="h-4 w-4 mr-2" />
                    )}
                    Sync
                  </Button>
                  <PlaidLink
                    onSuccess={handlePlaidSuccess}
                    className="shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Bank
                  </PlaidLink>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                        <p className="text-2xl font-bold">
                          {showBalances ? formatCurrency(
                            accounts.reduce((sum, acc) => sum + (acc.balances?.current || 0), 0)
                          ) : '••••••'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBalances(!showBalances)}
                      >
                        {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Connected Accounts</p>
                        <p className="text-2xl font-bold">{accounts.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Institutions</p>
                        <p className="text-2xl font-bold">{connections.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Accounts List */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-lg" />
                  ))}
                </div>
              ) : accounts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No bank accounts connected</h3>
                    <p className="text-muted-foreground mb-6">
                      Connect your bank accounts to view balances and manage transactions
                    </p>
                    <PlaidLink onSuccess={handlePlaidSuccess}>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Your First Bank Account
                    </PlaidLink>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  <AnimatePresence>
                    {accounts.map((account, index) => (
                      <motion.div
                        key={account.account_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-2xl">
                                  {getInstitutionLogo(account.institution_name)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground">
                                    {account.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {account.institution_name} •••• {account.mask}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className={cn("mt-1", getAccountTypeColor(account.type))}
                                  >
                                    {account.type}
                                  </Badge>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-2xl font-bold">
                                  {showBalances ? formatCurrency(account.balances?.current || 0) : '••••••'}
                                </p>
                                {account.balances?.available && account.balances.available !== account.balances.current && (
                                  <p className="text-sm text-muted-foreground">
                                    Available: {showBalances ? formatCurrency(account.balances.available) : '••••••'}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Last updated: {new Date(account.updated_at).toLocaleDateString()}</span>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedAccount(account.account_id)}>
                                    View Transactions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDisconnectAccount(account.connection_id)}
                                    className="text-destructive"
                                  >
                                    <Unlink className="h-4 w-4 mr-2" />
                                    Disconnect
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Recent Transactions */}
              {transactions.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest activity from your accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.transaction_id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              transaction.amount > 0
                                ? "bg-green-500/10 text-green-600"
                                : "bg-red-500/10 text-red-600"
                            )}>
                              {transaction.amount > 0 ? (
                                <ArrowDownRight className="h-4 w-4" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-medium",
                              transaction.amount > 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <SectionFooter section="financial" activePage="/bank-accounts" />

          <DepositModal
            open={isDepositModalOpen}
            onOpenChange={setIsDepositModalOpen}
          />
        </LayoutWrapper>
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
