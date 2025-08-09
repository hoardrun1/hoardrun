import { useState, useEffect } from 'react';
import { TransactionList } from './TransactionList';
import { TransactionFilters } from './TransactionFilters';
import { TransactionAnalytics } from './TransactionAnalytics';
import { TransactionService } from '@/services/transaction/TransactionImplementation';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'INVESTMENT';
  amount: number;
  description: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  category?: string;
  beneficiary?: string;
  accountId?: string;
}

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
    // Fetch transactions based on filters
    const fetchTransactions = async () => {
      const service = TransactionService.getInstance();
      const data = await service.getTransactions(filters);
      setTransactions(data);
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