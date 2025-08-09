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

export class TransactionService {
  private static instance: TransactionService;
  private transactions: Transaction[] = [
    {
      id: '1',
      type: 'DEPOSIT',
      amount: 1500,
      description: 'Salary deposit',
      date: '2024-01-15T10:30:00Z',
      status: 'COMPLETED',
      category: 'Income',
      accountId: 'acc-1'
    },
    {
      id: '2',
      type: 'WITHDRAWAL',
      amount: -250,
      description: 'ATM withdrawal',
      date: '2024-01-14T15:45:00Z',
      status: 'COMPLETED',
      category: 'Cash',
      accountId: 'acc-1'
    },
    {
      id: '3',
      type: 'TRANSFER',
      amount: -500,
      description: 'Transfer to John Doe',
      date: '2024-01-13T09:20:00Z',
      status: 'COMPLETED',
      beneficiary: 'John Doe',
      accountId: 'acc-1'
    },
    {
      id: '4',
      type: 'INVESTMENT',
      amount: -1000,
      description: 'Stock purchase - AAPL',
      date: '2024-01-12T14:15:00Z',
      status: 'PENDING',
      category: 'Investment',
      accountId: 'acc-1'
    }
  ];

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  async getTransactions(filters?: FilterOptions): Promise<Transaction[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredTransactions = [...this.transactions];

    if (filters) {
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredTransactions = filteredTransactions.filter(t =>
          t.description.toLowerCase().includes(searchLower) ||
          t.beneficiary?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.type) {
        filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
      }

      if (filters.status) {
        filteredTransactions = filteredTransactions.filter(t => t.status === filters.status);
      }

      if (filters.category) {
        filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
      }

      if (filters.dateRange) {
        filteredTransactions = filteredTransactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= filters.dateRange!.from && 
                 transactionDate <= filters.dateRange!.to;
        });
      }

      if (filters.amountRange) {
        filteredTransactions = filteredTransactions.filter(t => {
          const absAmount = Math.abs(t.amount);
          return absAmount >= (filters.amountRange!.min || 0) && 
                 absAmount <= (filters.amountRange!.max || Infinity);
        });
      }
    }

    return filteredTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.transactions.find(t => t.id === id) || null;
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'date' | 'status'>): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'PENDING'
    };

    this.transactions.unshift(newTransaction);
    return newTransaction;
  }

  async updateTransactionStatus(id: string, status: Transaction['status']): Promise<Transaction | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const transaction = this.transactions.find(t => t.id === id);
    if (transaction) {
      transaction.status = status;
      return transaction;
    }
    return null;
  }

  async getAnalytics(period: string = 'month'): Promise<TransactionAnalyticsData> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const income = this.transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = Math.abs(this.transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const categoryMap = new Map<string, number>();
    this.transactions
      .filter(t => t.amount < 0 && t.category)
      .forEach(t => {
        const current = categoryMap.get(t.category!) || 0;
        categoryMap.set(t.category!, current + Math.abs(t.amount));
      });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / expenses) * 100,
        color: this.getCategoryColor(category)
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netFlow: income - expenses,
      transactionCount: this.transactions.length,
      averageTransaction: this.transactions.length > 0 
        ? Math.abs(this.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)) / this.transactions.length
        : 0,
      categoryBreakdown,
      monthlyTrend: [
        { month: 'Jan', income: 4800, expenses: 3200 },
        { month: 'Feb', income: 5200, expenses: 3100 },
        { month: 'Mar', income: income, expenses: expenses }
      ]
    };
  }

  private getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Income': 'bg-green-500',
      'Food': 'bg-blue-500',
      'Transport': 'bg-yellow-500',
      'Shopping': 'bg-purple-500',
      'Entertainment': 'bg-orange-500',
      'Investment': 'bg-indigo-500',
      'Cash': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-400';
  }

  async deleteTransaction(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transactions.splice(index, 1);
      return true;
    }
    return false;
  }

  async getRecentTransactions(limit: number = 5): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
}
