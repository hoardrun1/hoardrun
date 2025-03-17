import { FC } from 'react';

interface TransactionFiltersProps {
  onFilterChange: (filters: {
    dateRange: string;
    category: string;
    type: string;
  }) => void;
}

export const TransactionFilters: FC<TransactionFiltersProps> = ({ onFilterChange }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            onChange={(e) => onFilterChange({
              dateRange: e.target.value,
              category: 'all',
              type: 'all'
            })}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            onChange={(e) => onFilterChange({
              dateRange: 'week',
              category: e.target.value,
              type: 'all'
            })}
          >
            <option value="all">All Categories</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            onChange={(e) => onFilterChange({
              dateRange: 'week',
              category: 'all',
              type: e.target.value
            })}
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="payment">Payment</option>
          </select>
        </div>
      </div>
    </div>
  );
};