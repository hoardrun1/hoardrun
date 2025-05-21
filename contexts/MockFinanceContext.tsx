'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface FinanceContextType {
  balance: number;
  isLoading: boolean;
  error: string | null;
  transferToSavings: (amount: number) => Promise<void>;
  transferToInvestment: (amount: number) => Promise<void>;
  depositFunds: (amount: number) => Promise<void>;
  withdrawFunds: (amount: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const MockFinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function MockFinanceProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [balance, setBalance] = useState(5000); // Start with $5000 mock balance
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    // Simulate API call
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
    return;
  }, []);

  const transferToSavings = useCallback(async (amount: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (amount > balance) {
        throw new Error('Insufficient funds');
      }
      
      setBalance(prev => prev - amount);
      
      toast({
        title: 'Success',
        description: `Transferred $${amount.toFixed(2)} to savings`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Transfer failed',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [balance, toast]);

  const transferToInvestment = useCallback(async (amount: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (amount > balance) {
        throw new Error('Insufficient funds');
      }
      
      setBalance(prev => prev - amount);
      
      toast({
        title: 'Success',
        description: `Transferred $${amount.toFixed(2)} to investments`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Transfer failed',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [balance, toast]);

  const depositFunds = useCallback(async (amount: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBalance(prev => prev + amount);
      
      toast({
        title: 'Success',
        description: `Deposited $${amount.toFixed(2)}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Deposit failed',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const withdrawFunds = useCallback(async (amount: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (amount > balance) {
        throw new Error('Insufficient funds');
      }
      
      setBalance(prev => prev - amount);
      
      toast({
        title: 'Success',
        description: `Withdrew $${amount.toFixed(2)}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Withdrawal failed',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [balance, toast]);

  return (
    <MockFinanceContext.Provider
      value={{
        balance,
        isLoading,
        error,
        transferToSavings,
        transferToInvestment,
        depositFunds,
        withdrawFunds,
        refreshBalance,
      }}
    >
      {children}
    </MockFinanceContext.Provider>
  );
}

export function useMockFinance() {
  const context = useContext(MockFinanceContext);
  if (context === undefined) {
    throw new Error('useMockFinance must be used within a MockFinanceProvider');
  }
  return context;
}
