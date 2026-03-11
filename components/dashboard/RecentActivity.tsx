'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardData } from '@/hooks/useDashboard';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  ExternalLink,
  ShoppingCart,
  Coffee,
  Home,
  Car,
  Smartphone
} from 'lucide-react';

interface RecentActivityProps {
  data: DashboardData | null;
  loading?: boolean;
}

const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'groceries':
    case 'shopping':
      return ShoppingCart;
    case 'food':
    case 'dining':
      return Coffee;
    case 'housing':
    case 'rent':
      return Home;
    case 'transportation':
    case 'gas':
      return Car;
    case 'utilities':
    case 'phone':
      return Smartphone;
    default:
      return ArrowDownRight;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'failed':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { recent_activity } = data;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            View All
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recent_activity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recent_activity.map((transaction) => {
              const Icon = getCategoryIcon(transaction.category);
              const isDebit = transaction.type.toLowerCase() === 'debit';
              
              return (
                <div 
                  key={transaction.transaction_id} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`p-2 rounded-full ${isDebit ? 'bg-red-100' : 'bg-green-100'}`}>
                    <Icon className={`w-4 h-4 ${isDebit ? 'text-red-600' : 'text-green-600'}`} />
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {transaction.merchant || transaction.category || 'Transaction'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {transaction.category && (
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Amount and Status */}
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                      {isDebit ? '-' : '+'}{transaction.amount.formatted}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs mt-1 ${getStatusColor(transaction.status)}`}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;

