'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Wallet,
  Send,
  Loader2,
  Plus
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { DepositModal } from '@/components/deposit-modal';
import { Sidebar } from '@/components/ui/sidebar';

interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  changePercentages: {
    balance: number;
    income: number;
    expenses: number;
    savings: number;
  };
}

interface OverviewStats {
  totalAssets: number;
  totalSavings: number;
  totalInvestments: number;
  monthlySpending: number;
  budgetUtilization: number;
  savingsGoalProgress: number;
}

interface RecentActivity {
  id: string;
  type: 'transaction' | 'investment' | 'savings' | 'goal';
  title: string;
  description: string;
  amount?: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function OverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferMethod, setTransferMethod] = useState('bank');
  const [transferNote, setTransferNote] = useState('');
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);

  // Savings goal modal state
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  // Deposit modal state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setIsLoading(true);
        
        // Mock data for now - replace with actual API calls
        const mockSummary: FinancialSummary = {
          totalBalance: 15750.25,
          monthlyIncome: 4500.00,
          monthlyExpenses: 2850.75,
          savingsRate: 36.7,
          changePercentages: {
            balance: 5.2,
            income: 2.1,
            expenses: -1.8,
            savings: 15.3,
          },
        };

        const mockStats: OverviewStats = {
          totalAssets: 25430.50,
          totalSavings: 8750.25,
          totalInvestments: 12500.00,
          monthlySpending: 2850.75,
          budgetUtilization: 78.5,
          savingsGoalProgress: 65.2,
        };

        const mockActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'transaction',
            title: 'Grocery Shopping',
            description: 'Whole Foods Market',
            amount: -125.50,
            date: '2024-01-15',
            status: 'completed'
          },
          {
            id: '2',
            type: 'savings',
            title: 'Emergency Fund',
            description: 'Monthly contribution',
            amount: 500.00,
            date: '2024-01-14',
            status: 'completed'
          },
          {
            id: '3',
            type: 'investment',
            title: 'Portfolio Rebalance',
            description: 'Quarterly adjustment',
            date: '2024-01-13',
            status: 'completed'
          },
          {
            id: '4',
            type: 'goal',
            title: 'Vacation Fund',
            description: 'Goal milestone reached',
            date: '2024-01-12',
            status: 'completed'
          }
        ];

        setFinancialSummary(mockSummary);
        setOverviewStats(mockStats);
        setRecentActivity(mockActivity);
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const handleTransfer = async () => {
    console.log('handleTransfer called!', { transferAmount, transferRecipient, transferMethod, transferNote });
    if (!transferAmount || !transferRecipient) {
      console.log('Validation failed: missing required fields');
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingTransfer(true);
    try {
      // Mock transfer processing - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Transfer Successful",
        description: `Successfully sent ${formatCurrency(amount)} to ${transferRecipient}`,
      });

      // Reset form
      setTransferAmount('');
      setTransferRecipient('');
      setTransferNote('');
      setIsTransferModalOpen(false);

      // Refresh overview data
      // In a real app, you'd refresh the financial data here

    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "There was an error processing your transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingTransfer(false);
    }
  };

  const handleCreateGoal = async () => {
    console.log('handleCreateGoal called!', { goalName, goalAmount, goalDeadline });
    if (!goalName || !goalAmount || !goalDeadline) {
      console.log('Validation failed: missing required fields for goal creation');
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(goalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid goal amount",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingGoal(true);
    try {
      // Mock goal creation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Goal Created",
        description: `Successfully created savings goal "${goalName}" for ${formatCurrency(amount)}`,
      });

      // Reset form
      setGoalName('');
      setGoalAmount('');
      setGoalDeadline('');
      setIsSavingsModalOpen(false);

      // Refresh overview data
      // In a real app, you'd refresh the financial data here

    } catch (error) {
      toast({
        title: "Goal Creation Failed",
        description: "There was an error creating your savings goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingGoal(false);
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <CreditCard className="h-4 w-4" />;
      case 'savings': return <PiggyBank className="h-4 w-4" />;
      case 'investment': return <TrendingUp className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Financial Overview
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome back, {user?.firstName || 'User'}! Here's your financial snapshot.
            </p>
          </div>
          <Button onClick={() => router.push('/home')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Dashboard
          </Button>
        </div>

        {/* Key Metrics */}
        {financialSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {formatCurrency(financialSummary.totalBalance)}
                      </h3>
                      <div className={`flex items-center mt-2 ${getChangeColor(financialSummary.changePercentages.balance)}`}>
                        {getChangeIcon(financialSummary.changePercentages.balance)}
                        <span className="text-sm ml-1">
                          {Math.abs(financialSummary.changePercentages.balance)}% from last month
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Income</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {formatCurrency(financialSummary.monthlyIncome)}
                      </h3>
                      <div className={`flex items-center mt-2 ${getChangeColor(financialSummary.changePercentages.income)}`}>
                        {getChangeIcon(financialSummary.changePercentages.income)}
                        <span className="text-sm ml-1">
                          {Math.abs(financialSummary.changePercentages.income)}% from last month
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Expenses</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {formatCurrency(financialSummary.monthlyExpenses)}
                      </h3>
                      <div className={`flex items-center mt-2 ${getChangeColor(-financialSummary.changePercentages.expenses)}`}>
                        {getChangeIcon(-financialSummary.changePercentages.expenses)}
                        <span className="text-sm ml-1">
                          {Math.abs(financialSummary.changePercentages.expenses)}% from last month
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                      <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Savings Rate</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {financialSummary.savingsRate}%
                      </h3>
                      <div className={`flex items-center mt-2 ${getChangeColor(financialSummary.changePercentages.savings)}`}>
                        {getChangeIcon(financialSummary.changePercentages.savings)}
                        <span className="text-sm ml-1">
                          {Math.abs(financialSummary.changePercentages.savings)}% from last month
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                      <PiggyBank className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Additional Stats and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Additional Financial Stats */}
          {overviewStats && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Asset Breakdown
                  </CardTitle>
                  <CardDescription>
                    Your financial portfolio at a glance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Total Assets</p>
                        <p className="text-sm text-gray-500">All accounts combined</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg">
                      {formatCurrency(overviewStats.totalAssets)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                        <PiggyBank className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">Savings</p>
                        <p className="text-sm text-gray-500">Emergency & goals</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg">
                      {formatCurrency(overviewStats.totalSavings)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                        <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">Investments</p>
                        <p className="text-sm text-gray-500">Stocks, bonds & funds</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg">
                      {formatCurrency(overviewStats.totalInvestments)}
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Budget Utilization</span>
                      <span className="text-sm font-bold">{overviewStats.budgetUtilization}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${overviewStats.budgetUtilization}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Savings Goal Progress</span>
                      <span className="text-sm font-bold">{overviewStats.savingsGoalProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${overviewStats.savingsGoalProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest financial activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{activity.title}</p>
                          {activity.amount && (
                            <span className={`font-bold ${
                              activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {activity.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(activity.amount))}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(activity.status)}
                            <span className="text-xs text-gray-400">
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push('/transactions')}>
                    View All Transactions
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push('/savings')}>
                    Manage Goals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your finances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Add Money Button */}
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => {
                    console.log('Add Money button clicked, opening deposit modal');
                    setIsDepositModalOpen(true);
                  }}
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Add Money</span>
                </Button>
                {/* Transfer Money Button */}
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => {
                    console.log('Transfer Money button clicked!');
                    setIsTransferModalOpen(true);
                  }}
                >
                  <ArrowUpRight className="h-5 w-5" />
                  <span className="text-sm">Transfer Money</span>
                </Button>

                {/* Transfer Modal */}
                <Dialog open={isTransferModalOpen} onOpenChange={(open) => {
                  console.log('Transfer modal state changing from', isTransferModalOpen, 'to:', open);
                  setIsTransferModalOpen(open);
                }}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Send Money</DialogTitle>
                      <DialogDescription>
                        Transfer money quickly and securely
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="transfer-method">Transfer Method</Label>
                        <Select value={transferMethod} onValueChange={setTransferMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transfer method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="card">Card Transfer</SelectItem>
                            <SelectItem value="mobile">Mobile Money</SelectItem>
                            <SelectItem value="contact">Send to Contact</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transfer-amount">Amount</Label>
                        <Input
                          id="transfer-amount"
                          type="number"
                          placeholder="0.00"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="text-lg font-semibold"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transfer-recipient">
                          {transferMethod === 'bank' ? 'Account Number' :
                           transferMethod === 'card' ? 'Card Number' :
                           transferMethod === 'mobile' ? 'Phone Number' : 'Email or Phone'}
                        </Label>
                        <Input
                          id="transfer-recipient"
                          placeholder={
                            transferMethod === 'bank' ? 'Enter account number' :
                            transferMethod === 'card' ? 'Enter card number' :
                            transferMethod === 'mobile' ? 'Enter phone number' : 'Enter email or phone'
                          }
                          value={transferRecipient}
                          onChange={(e) => setTransferRecipient(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transfer-note">Note (Optional)</Label>
                        <Textarea
                          id="transfer-note"
                          placeholder="What's this transfer for?"
                          value={transferNote}
                          onChange={(e) => setTransferNote(e.target.value)}
                          rows={2}
                        />
                      </div>

                      {transferAmount && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Amount:</span>
                            <span>{formatCurrency(parseFloat(transferAmount) || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Fee:</span>
                            <span>{formatCurrency(2.50)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>{formatCurrency((parseFloat(transferAmount) || 0) + 2.50)}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsTransferModalOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleTransfer}
                          disabled={isProcessingTransfer || !transferAmount || !transferRecipient}
                          className="flex-1"
                        >
                          {isProcessingTransfer ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Money
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Set Goal Button */}
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => {
                    console.log('Set Goal button clicked!');
                    setIsSavingsModalOpen(true);
                  }}
                >
                  <Target className="h-5 w-5" />
                  <span className="text-sm">Set Goal</span>
                </Button>

                {/* Set Goal Modal */}
                <Dialog open={isSavingsModalOpen} onOpenChange={(open) => {
                  console.log('Savings modal state changing from', isSavingsModalOpen, 'to:', open);
                  setIsSavingsModalOpen(open);
                }}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Savings Goal</DialogTitle>
                      <DialogDescription>
                        Set a new savings goal to track your progress
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="goal-name">Goal Name</Label>
                        <Input
                          id="goal-name"
                          placeholder="e.g., Emergency Fund, Vacation, New Car"
                          value={goalName}
                          onChange={(e) => setGoalName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal-amount">Target Amount</Label>
                        <Input
                          id="goal-amount"
                          type="number"
                          placeholder="0.00"
                          value={goalAmount}
                          onChange={(e) => setGoalAmount(e.target.value)}
                          className="text-lg font-semibold"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal-deadline">Target Date</Label>
                        <Input
                          id="goal-deadline"
                          type="date"
                          value={goalDeadline}
                          onChange={(e) => setGoalDeadline(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {goalAmount && goalDeadline && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Target Amount:</span>
                            <span className="font-semibold">{formatCurrency(parseFloat(goalAmount) || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Target Date:</span>
                            <span className="font-semibold">{new Date(goalDeadline).toLocaleDateString()}</span>
                          </div>
                          {(() => {
                            const today = new Date();
                            const target = new Date(goalDeadline);
                            const monthsLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
                            const monthlyTarget = (parseFloat(goalAmount) || 0) / Math.max(monthsLeft, 1);
                            return (
                              <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
                                <span>Monthly Target:</span>
                                <span className="font-semibold">{formatCurrency(monthlyTarget)}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsSavingsModalOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateGoal}
                          disabled={isCreatingGoal || !goalName || !goalAmount || !goalDeadline}
                          className="flex-1"
                        >
                          {isCreatingGoal ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Target className="h-4 w-4 mr-2" />
                              Create Goal
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => router.push('/investment')}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">Invest</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => router.push('/cards')}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-sm">Manage Cards</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sidebar */}
      <Sidebar onAddMoney={() => setIsDepositModalOpen(true)} />

      {/* Deposit Modal */}
      <DepositModal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
      />
    </div>
  );
}
