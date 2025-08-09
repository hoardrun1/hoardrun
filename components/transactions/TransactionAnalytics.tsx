import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface TransactionAnalyticsData {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  transactionCount: number;
  averageTransaction: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
  }[];
}

interface TransactionAnalyticsProps {
  data?: TransactionAnalyticsData;
  isLoading?: boolean;
  period?: string;
}

export const TransactionAnalytics: React.FC<TransactionAnalyticsProps> = ({
  data = {
    totalIncome: 5420,
    totalExpenses: 3280,
    netFlow: 2140,
    transactionCount: 47,
    averageTransaction: 115.32,
    categoryBreakdown: [
      { category: 'Food & Dining', amount: 1200, percentage: 36.6, color: 'bg-blue-500' },
      { category: 'Transportation', amount: 800, percentage: 24.4, color: 'bg-green-500' },
      { category: 'Shopping', amount: 650, percentage: 19.8, color: 'bg-purple-500' },
      { category: 'Entertainment', amount: 430, percentage: 13.1, color: 'bg-orange-500' },
      { category: 'Other', amount: 200, percentage: 6.1, color: 'bg-gray-500' }
    ],
    monthlyTrend: [
      { month: 'Jan', income: 4800, expenses: 3200 },
      { month: 'Feb', income: 5200, expenses: 3100 },
      { month: 'Mar', income: 5420, expenses: 3280 }
    ]
  },
  isLoading = false,
  period = 'This Month'
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getNetFlowColor = (netFlow: number) => {
    return netFlow >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getNetFlowIcon = (netFlow: number) => {
    return netFlow >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.totalIncome)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">{period}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.totalExpenses)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">{period}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Flow</p>
                <p className={`text-2xl font-bold ${getNetFlowColor(data.netFlow)}`}>
                  {formatCurrency(data.netFlow)}
                </p>
              </div>
              {getNetFlowIcon(data.netFlow)}
            </div>
            <p className="text-xs text-gray-500 mt-2">{period}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">{data.transactionCount}</p>
                <p className="text-xs text-gray-500">
                  Avg: {formatCurrency(data.averageTransaction)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">{period}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.categoryBreakdown.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <span className="text-sm font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">
                      {formatCurrency(category.amount)}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {category.percentage}%
                    </Badge>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="font-medium">{month.month}</div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Income</div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(month.income)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Expenses</div>
                    <div className="font-semibold text-red-600">
                      {formatCurrency(month.expenses)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Net</div>
                    <div className={`font-semibold ${getNetFlowColor(month.income - month.expenses)}`}>
                      {formatCurrency(month.income - month.expenses)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
