'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardData } from '@/hooks/useDashboard';
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface AccountsOverviewProps {
  data: DashboardData | null;
  loading?: boolean;
}

export const AccountsOverview: React.FC<AccountsOverviewProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { financial_summary, quick_stats } = data;

  const cards = [
    {
      title: 'Total Balance',
      value: financial_summary.balances.total_balance.formatted,
      description: 'Across all accounts',
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+2.5%',
      trendUp: true,
    },
    {
      title: 'Available Balance',
      value: financial_summary.balances.available_balance.formatted,
      description: 'Ready to spend',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+1.2%',
      trendUp: true,
    },
    {
      title: 'Total Assets',
      value: financial_summary.assets.total_assets.formatted,
      description: 'Cash + Investments',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+5.8%',
      trendUp: true,
    },
    {
      title: 'Net Worth',
      value: financial_summary.balances.net_worth.formatted,
      description: 'Assets - Liabilities',
      icon: PiggyBank,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '+3.4%',
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">
                  {card.title}
                </CardDescription>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${card.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {card.trendUp ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {card.trend}
                  </Badge>
                  <span className="text-xs text-gray-500">{card.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AccountsOverview;

