import { useState, useEffect } from 'react';
import { TransactionList } from './TransactionList';
import { TransactionFilters } from './TransactionFilters';
import { TransactionAnalytics } from './TransactionAnalytics';
import { TransactionService } from '@/services/transaction/TransactionImplementation';

export function TransactionCenter() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'week',
    category: 'all',
    type: 'all'
  });

  useEffect(() => {
    // Fetch transactions based on filters
    const fetchTransactions = async () => {
      const data = await TransactionService.getTransactions(filters);
      setTransactions(data);
    };
    
    fetchTransactions();
  }, [filters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <TransactionFilters onFilterChange={setFilters} />
      <TransactionList transactions={transactions} />
      <TransactionAnalytics transactions={transactions} />
    </div>
  );
}