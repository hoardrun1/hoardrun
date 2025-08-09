import { FC } from 'react';

interface FilterOptions {
  dateRange?: {
    from: Date;
    to: Date;
  };
  type?: string;
  status?: string;
  category?: string;
  amountRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export const TransactionFilters: FC<TransactionFiltersProps> = ({ onFilterChange }) => {
  const handleCategoryChange = (category: string) => {
    onFilterChange({
      category: category === 'all' ? undefined : category
    });
  };

  const handleTypeChange = (type: string) => {
    onFilterChange({
      type: type === 'all' ? undefined : type
    });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({
      status: status === 'all' ? undefined : status
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Income">Income</option>
            <option value="Food">Food & Dining</option>
            <option value="Transport">Transportation</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Investment">Investment</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="TRANSFER">Transfers</option>
            <option value="INVESTMENT">Investments</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>
    </div>
  );
};