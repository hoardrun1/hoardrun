'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout';
import { SidebarContent } from '@/components/ui/sidebar-content';
import { SidebarToggle } from '@/components/ui/sidebar-toggle';
import { SectionFooter } from '@/components/ui/section-footer';

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
  const { addToast } = useToast();
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
        
        // Empty data - should be populated from actual API calls
        const emptySummary: FinancialSummary = {
          totalBalance: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          savingsRate: 0,
          changePercentages: {
            balance: 0,
            income: 0,
            expenses: 0,
            savings: 0,
          },
        };

        const emptyStats: OverviewStats = {
          totalAssets: 0,
          totalSavings: 0,
          totalInvestments: 0,
          monthlySpending: 0,
          budgetUtilization: 0,
          savingsGoalProgress: 0,
        };

        const emptyActivity: RecentActivity[] = [];

        setFinancialSummary(emptySummary);
        setOverviewStats(emptyStats);
        setRecentActivity(emptyActivity);
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
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingTransfer(true);
    try {
      // Transfer processing - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      addToast({
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
      addToast({
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
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(goalAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid goal amount",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingGoal(true);
    try {
      // Goal creation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      addToast({
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
      addToast({
        title: "Goal Creation Failed",
        description: "There was an error creating your savings goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingGoal(false);
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-white" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-gray-600" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-white';
    if (change < 0) return 'text-gray-600';
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
      case 'completed': return <CheckCircle className="h-4 w-4 text-black" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded-lg w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl shadow-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-muted rounded-xl shadow-lg"></div>
              <div className="h-96 bg-muted rounded-xl shadow-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-background pt-14 sm:pt-16 pb-20 sm:pb-6 px-3 sm:px-4">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              Financial Overview
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Welcome back, {user?.name || 'User'}! Here's your financial snapshot.
            </p>
          </div>
          <Button
            onClick={() => router.push('/home')}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm px-2 py-1 h-auto"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            View Dashboard
          </Button>
        </div>

        {/* Key Metrics */}
        {financialSummary && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-black to-gray-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                <CardContent className="p-3 sm:p-4 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-xs sm:text-sm font-medium">Total Balance</p>
                      <h3 className="text-xs sm:text-base font-bold mt-1">
                        {formatCurrency(financialSummary.totalBalance)}
                      </h3>
                      <div className={`flex items-center mt-2 ${getChangeColor(financialSummary.changePercentages.balance)}`}>
                        {getChangeIcon(financialSummary.changePercentages.balance)}
                        <span className="text-xs sm:text-sm ml-1 font-medium">
                          {Math.abs(financialSummary.changePercentages.balance)}% from last month
                        </span>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
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
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -translate-y-16 translate-x-16"></div>
                <CardContent className="p-3 sm:p-4 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm font-medium">Monthly Income</p>
                      <h3 className="text-xs sm:text-base font-bold mt-1 text-black">
                        {formatCurrency(financialSummary.monthlyIncome)}
                      </h3>
                      <div className={`flex items-center mt-2 ${getChangeColor(financialSummary.changePercentages.income)}`}>
                        {getChangeIcon(financialSummary.changePercentages.income)}
                        <span className="text-xs sm:text-sm ml-1 font-medium">
                          {Math.abs(financialSummary.changePercentages.income)}% from last month
                        </span>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 rounded-full bg-black/10 backdrop-blur-sm">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
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
              <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                <CardContent className="p-3 sm:p-4 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-xs sm:text-sm font-medium">Monthly Expenses</p>
                      <h3 className="text-xs sm:text-base font-bold mt-1">
                        {formatCurrency(financialSummary.monthlyExpenses)}
                      </h3>
                      <div className={`flex items-center mt-2 ${getChangeColor(-financialSummary.changePercentages.expenses)}`}>
                        {getChangeIcon(-financialSummary.changePercentages.expenses)}
                        <span className="text-xs sm:text-sm ml-1 font-medium">
                          {Math.abs(financialSummary.changePercentages.expenses)}% from last month
                        </span>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm">
                      <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
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
              <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-100 to-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -translate-y-16 translate-x-16"></div>
                <CardContent className="p-3 sm:p-4 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm font-medium">Savings Rate</p>
                      <h3 className="text-xs sm:text-base font-bold mt-1 text-black">
                        {financialSummary.savingsRate}%
                      </h3>
                      <div className={`flex items-center mt-2 ${getChangeColor(financialSummary.changePercentages.savings)}`}>
                        {getChangeIcon(financialSummary.changePercentages.savings)}
                        <span className="text-xs sm:text-sm ml-1 font-medium">
                          {Math.abs(financialSummary.changePercentages.savings)}% from last month
                        </span>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 rounded-full bg-black/10 backdrop-blur-sm">
                      <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Additional Stats and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Additional Financial Stats */}
          {overviewStats && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-xl bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-xs sm:text-base text-foreground">
                    <div className="p-1 sm:p-2 rounded-lg bg-primary">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                    </div>
                    Asset Breakdown
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                    Your financial portfolio at a glance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 rounded-xl bg-primary">
                        <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-xs sm:text-sm">Total Assets</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">All accounts combined</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-base text-foreground">
                      {formatCurrency(overviewStats.totalAssets)}
                    </span>
                  </div>

                  <Separator className="bg-border" />

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 rounded-xl bg-secondary">
                        <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-xs sm:text-sm">Savings</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Emergency & goals</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-base text-foreground">
                      {formatCurrency(overviewStats.totalSavings)}
                    </span>
                  </div>

                  <Separator className="bg-border" />

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 rounded-xl bg-primary">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-xs sm:text-sm">Investments</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Stocks, bonds & funds</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-base text-foreground">
                      {formatCurrency(overviewStats.totalInvestments)}
                    </span>
                  </div>

                  <Separator className="bg-border" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-xs sm:text-sm">Budget Utilization</span>
                      <span className="font-bold text-foreground text-xs sm:text-sm">{overviewStats.budgetUtilization}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${overviewStats.budgetUtilization}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-xs sm:text-sm">Savings Goal Progress</span>
                      <span className="font-bold text-foreground text-xs sm:text-sm">{overviewStats.savingsGoalProgress}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
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
            <Card className="border-0 shadow-xl bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xs sm:text-base text-foreground">
                  <div className="p-1 sm:p-2 rounded-lg bg-primary">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                  </div>
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">
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
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted transition-all duration-300 hover:shadow-md"
                    >
                      <div className="p-3 rounded-xl bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold truncate text-foreground text-xs sm:text-sm">{activity.title}</p>
                          {activity.amount && (
                            <span className={`font-bold text-xs sm:text-sm ${
                              activity.amount > 0 ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {activity.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(activity.amount))}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{activity.description}</p>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(activity.status)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Separator className="my-6 bg-border" />

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push('/transactions')}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    View All Transactions
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push('/savings')}
                    className="border-border text-foreground hover:bg-muted"
                  >
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
          <Card className="border-0 shadow-xl bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xs sm:text-base text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                Common tasks to manage your finances
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
                {/* Add Money Button */}
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-105 shadow-lg"
                  onClick={() => {
                    console.log('Transfer Money button clicked!');
                    setIsTransferModalOpen(true);
                  }}
                >
                  <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm font-medium">Transfer Money</span>
                </Button>

                {/* Transfer Modal */}
                <Dialog open={isTransferModalOpen} onOpenChange={(open) => {
                  console.log('Transfer modal state changing from', isTransferModalOpen, 'to:', open);
                  setIsTransferModalOpen(open);
                }}>
                  <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-black">Send Money</DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Transfer money quickly and securely
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="transfer-method" className="text-black font-medium">Transfer Method</Label>
                        <Select value={transferMethod} onValueChange={setTransferMethod}>
                          <SelectTrigger className="border-2 border-gray-200 focus:border-black">
                            <SelectValue placeholder="Select transfer method" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="card">Card Transfer</SelectItem>
                            <SelectItem value="mobile">Mobile Money</SelectItem>
                            <SelectItem value="contact">Send to Contact</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transfer-amount" className="text-black font-medium">Amount</Label>
                        <Input
                          id="transfer-amount"
                          type="number"
                          placeholder="0.00"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="text-xl font-bold border-2 border-gray-200 focus:border-black"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transfer-recipient" className="text-black font-medium">
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
                          className="border-2 border-gray-200 focus:border-black"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transfer-note" className="text-black font-medium">Note (Optional)</Label>
                        <Textarea
                          id="transfer-note"
                          placeholder="What's this transfer for?"
                          value={transferNote}
                          onChange={(e) => setTransferNote(e.target.value)}
                          rows={2}
                          className="border-2 border-gray-200 focus:border-black"
                        />
                      </div>

                      {transferAmount && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl space-y-2 border border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Amount:</span>
                            <span className="text-black font-semibold">{formatCurrency(parseFloat(transferAmount) || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Fee:</span>
                            <span className="text-black font-semibold">{formatCurrency(2.50)}</span>
                          </div>
                          <Separator className="bg-gray-300" />
                          <div className="flex justify-between font-bold text-lg">
                            <span className="text-black">Total:</span>
                            <span className="text-black">{formatCurrency((parseFloat(transferAmount) || 0) + 2.50)}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsTransferModalOpen(false)}
                          className="flex-1 border-2 border-gray-300 text-black hover:bg-gray-100"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleTransfer}
                          disabled={isProcessingTransfer || !transferAmount || !transferRecipient}
                          className="flex-1 bg-black hover:bg-gray-800 text-white"
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
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-105 shadow-lg"
                  onClick={() => {
                    console.log('Set Goal button clicked!');
                    setIsSavingsModalOpen(true);
                  }}
                >
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm font-medium">Set Goal</span>
                </Button>

                {/* Set Goal Modal */}
                <Dialog open={isSavingsModalOpen} onOpenChange={(open) => {
                  console.log('Savings modal state changing from', isSavingsModalOpen, 'to:', open);
                  setIsSavingsModalOpen(open);
                }}>
                  <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-black">Create Savings Goal</DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Set a new savings goal to track your progress
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="goal-name" className="text-black font-medium">Goal Name</Label>
                        <Input
                          id="goal-name"
                          placeholder="e.g., Emergency Fund, Vacation, New Car"
                          value={goalName}
                          onChange={(e) => setGoalName(e.target.value)}
                          className="border-2 border-gray-200 focus:border-black"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal-amount" className="text-black font-medium">Target Amount</Label>
                        <Input
                          id="goal-amount"
                          type="number"
                          placeholder="0.00"
                          value={goalAmount}
                          onChange={(e) => setGoalAmount(e.target.value)}
                          className="text-xl font-bold border-2 border-gray-200 focus:border-black"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal-deadline" className="text-black font-medium">Target Date</Label>
                        <Input
                          id="goal-deadline"
                          type="date"
                          value={goalDeadline}
                          onChange={(e) => setGoalDeadline(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="border-2 border-gray-200 focus:border-black"
                        />
                      </div>

                      {goalAmount && goalDeadline && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl space-y-2 border border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Target Amount:</span>
                            <span className="font-semibold text-black">{formatCurrency(parseFloat(goalAmount) || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Target Date:</span>
                            <span className="font-semibold text-black">{new Date(goalDeadline).toLocaleDateString()}</span>
                          </div>
                          {(() => {
                            const today = new Date();
                            const target = new Date(goalDeadline);
                            const monthsLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
                            const monthlyTarget = (parseFloat(goalAmount) || 0) / Math.max(monthsLeft, 1);
                            return (
                              <div className="flex justify-between text-sm text-black font-medium">
                                <span>Monthly Target:</span>
                                <span className="font-bold">{formatCurrency(monthlyTarget)}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsSavingsModalOpen(false)}
                          className="flex-1 border-2 border-gray-300 text-black hover:bg-gray-100"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateGoal}
                          disabled={isCreatingGoal || !goalName || !goalAmount || !goalDeadline}
                          className="flex-1 bg-black hover:bg-gray-800 text-white"
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
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-105 shadow-lg"
                  onClick={() => router.push('/investment')}
                >
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm font-medium">Invest</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-105 shadow-lg"
                  onClick={() => router.push('/cards')}
                >
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm font-medium">Manage Cards</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
          </div>
        </div>

        {/* Deposit Modal */}
        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
        <SectionFooter section="main" activePage="/overview" />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  );
}
