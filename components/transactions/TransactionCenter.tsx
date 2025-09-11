import { useState, useEffect } from 'react';
import { TransactionList } from './TransactionList';
import { TransactionFilters } from './TransactionFilters';
import { TransactionAnalytics } from './TransactionAnalytics';
import { apiClient, Transaction } from '@/lib/api-client';

export function TransactionCenter() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<{
    dateRange?: { from: Date; to: Date; };
    type?: string;
    status?: string;
    category?: string;
    amountRange?: { min: number; max: number; };
    searchTerm?: string;
  }>({});

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await apiClient.getTransactions({
          limit: 50,
          offset: 0,
          type: filters.type,
          status: filters.status,
        });
        setTransactions(response.data || []);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setTransactions([]);
      }
    };

    fetchTransactions();
  }, [filters]);

  return (
    <div className="space-y-6">
      <TransactionFilters onFilterChange={setFilters} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionList transactions={transactions} />
        <TransactionAnalytics />
      </div>
    </div>
  );
}
