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

import { SectionFooter } from '@/components/ui/section-footer';
import { PageHero, StatPills, HeroAction, CountUp } from '@/components/app/page-hero';
import { VaultGraphic } from '@/components/app/home-graphics';

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
    <div>
      <div className="pb-28 lg:pb-8">
          <div className="w-full space-y-4 sm:space-y-5">
        <PageHero
          title="Financial Overview"
          subtitle={`Welcome back, ${user?.name || 'User'}. Here's your snapshot.`}
          tone="sky"
          graphic={VaultGraphic}
          figureLabel="Total balance"
          figure={financialSummary ? <CountUp value={financialSummary.totalBalance} format={formatCurrency} /> : '…'}
          actions={
            <HeroAction onClick={() => router.push('/home')}>
              <BarChart3 className="h-4 w-4" strokeWidth={2.2} />
              View Dashboard
            </HeroAction>
          }
        >
          {financialSummary && (
            <p className={`mt-3 inline-flex items-center gap-1 rounded-full bg-white/[0.07] px-3 py-1 text-[12.5px] ${getChangeColor(financialSummary.changePercentages.balance)}`}>
              {getChangeIcon(financialSummary.changePercentages.balance)}
              {Math.abs(financialSummary.changePercentages.balance)}% from last month
            </p>
          )}
        </PageHero>

        {financialSummary && (
          <StatPills
            items={[
              { label: 'Monthly income', value: <CountUp value={financialSummary.monthlyIncome} format={formatCurrency} />, note: `${Math.abs(financialSummary.changePercentages.income)}% from last month`, tone: 'mint', icon: TrendingUp },
              { label: 'Monthly expenses', value: <CountUp value={financialSummary.monthlyExpenses} format={formatCurrency} />, note: `${Math.abs(financialSummary.changePercentages.expenses)}% from last month`, tone: 'coral', icon: TrendingDown },
              { label: 'Savings rate', value: `${financialSummary.savingsRate}%`, note: `${Math.abs(financialSummary.changePercentages.savings)}% from last month`, tone: 'violet', icon: PiggyBank },
              { label: 'Total balance', value: <CountUp value={financialSummary.totalBalance} format={formatCurrency} />, note: 'All accounts', tone: 'sky', icon: DollarSign },
            ]}
          />
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
          </div>
        </div>

        {/* Deposit Modal */}
        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
        <SectionFooter section="main" activePage="/overview" />
    </div>
  );
}
