'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/hooks/useDashboard';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Activity,
  PieChart
} from 'lucide-react';

interface FinancialSnapshotProps {
  data: DashboardData | null;
  loading?: boolean;
}

export const FinancialSnapshot: React.FC<FinancialSnapshotProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { quick_stats, financial_summary } = data;

  // Calculate spending vs income ratio
  const monthlySpending = quick_stats.monthly_spending.amount;
  const totalAssets = financial_summary.assets.total_assets.amount;
  const spendingRatio = totalAssets > 0 ? (monthlySpending / totalAssets) * 100 : 0;

  // Calculate asset allocation
  const cashAmount = financial_summary.assets.cash_and_equivalents.amount;
  const investmentAmount = financial_summary.assets.investments.amount;
  const totalAmount = cashAmount + investmentAmount;
  const cashPercentage = totalAmount > 0 ? (cashAmount / totalAmount) * 100 : 50;
  const investmentPercentage = totalAmount > 0 ? (investmentAmount / totalAmount) * 100 : 50;

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-600" />
          Financial Snapshot
        </CardTitle>
        <CardDescription>Your financial overview at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Spending */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Monthly Spending</span>
            </div>
            <span className="text-sm font-bold">{quick_stats.monthly_spending.formatted}</span>
          </div>
          <Progress value={Math.min(spendingRatio, 100)} className="h-2" />
          <p className="text-xs text-gray-500">
            {spendingRatio.toFixed(1)}% of total assets
          </p>
        </div>

        {/* Weekly Spending */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Weekly Spending</span>
            </div>
            <span className="text-sm font-bold">{quick_stats.weekly_spending.formatted}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Avg per transaction:</span>
            <span className="font-semibold">{quick_stats.avg_transaction.formatted}</span>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Asset Allocation</span>
          </div>
          
          {/* Cash */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Cash & Equivalents</span>
              <span className="font-semibold">{cashPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={cashPercentage} className="h-2 bg-blue-100" />
          </div>

          {/* Investments */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Investments</span>
              <span className="font-semibold">{investmentPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={investmentPercentage} className="h-2 bg-purple-100" />
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
            <div>
              <p className="text-xs text-gray-500">Cash</p>
              <p className="text-sm font-bold text-blue-600">
                {financial_summary.assets.cash_and_equivalents.formatted}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Investments</p>
              <p className="text-sm font-bold text-purple-600">
                {financial_summary.assets.investments.formatted}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{quick_stats.total_accounts}</p>
            <p className="text-xs text-gray-600">Total Accounts</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{quick_stats.active_cards}</p>
            <p className="text-xs text-gray-600">Active Cards</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSnapshot;

