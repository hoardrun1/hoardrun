import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'INVESTMENT';
  amount: number;
  description: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  category?: string;
  beneficiary?: string;
}

interface TransactionListProps {
  transactions?: Transaction[];
  isLoading?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions = [
    {
      id: '1',
      type: 'DEPOSIT',
      amount: 1500,
      description: 'Salary deposit',
      date: '2024-01-15T10:30:00Z',
      status: 'COMPLETED',
      category: 'Income'
    },
    {
      id: '2',
      type: 'WITHDRAWAL',
      amount: -250,
      description: 'ATM withdrawal',
      date: '2024-01-14T15:45:00Z',
      status: 'COMPLETED',
      category: 'Cash'
    },
    {
      id: '3',
      type: 'TRANSFER',
      amount: -500,
      description: 'Transfer to John Doe',
      date: '2024-01-13T09:20:00Z',
      status: 'COMPLETED',
      beneficiary: 'John Doe'
    },
    {
      id: '4',
      type: 'INVESTMENT',
      amount: -1000,
      description: 'Stock purchase - AAPL',
      date: '2024-01-12T14:15:00Z',
      status: 'PENDING',
      category: 'Investment'
    }
  ],
  isLoading = false,
  onTransactionClick
}) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-4 w-4 text-gray-600" />;
      case 'WITHDRAWAL':
      case 'TRANSFER':
      case 'INVESTMENT':
        return <ArrowUpRight className="h-4 w-4 text-gray-600" />;
      default:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'FAILED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    return (
      <span className={isNegative ? 'text-gray-600' : 'text-gray-600'}>
        {isNegative ? '-' : '+'}${absAmount.toLocaleString()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onTransactionClick?.(transaction)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <span>{formatDate(transaction.date)}</span>
                      {transaction.category && (
                        <>
                          <span>•</span>
                          <span>{transaction.category}</span>
                        </>
                      )}
                      {transaction.beneficiary && (
                        <>
                          <span>•</span>
                          <span>To: {transaction.beneficiary}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="font-semibold">
                    {formatAmount(transaction.amount)}
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
        
        {transactions.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="outline">
              View All Transactions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
