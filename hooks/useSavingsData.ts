'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useSavingsData() {
  const { toast } = useToast();
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch savings goals
  const fetchSavingsGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the new API route
      const response = await fetch('/api/v2/savings');

      if (!response.ok) {
        throw new Error('Failed to fetch savings goals');
      }

      const goals = await response.json();
      setSavingsGoals(goals);
    } catch (err) {
      setError('Failed to fetch savings goals');
      toast({
        title: 'Error',
        description: 'Failed to fetch savings goals',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch savings analytics
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);

    try {
      // Use the new API route
      const response = await fetch('/api/v2/savings/analytics');

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch savings analytics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create a new savings goal
  const addSavingsGoal = useCallback(async (goalData) => {
    setIsLoading(true);

    try {
      // Use the new API route
      const response = await fetch('/api/v2/savings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        throw new Error('Failed to create savings goal');
      }

      const newGoal = await response.json();
      setSavingsGoals(prev => [newGoal, ...prev]);

      toast({
        title: 'Success',
        description: 'Savings goal created successfully',
      });

      return newGoal;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create savings goal',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    savingsGoals,
    analytics,
    isLoading,
    error,
    fetchSavingsGoals,
    fetchAnalytics,
    addSavingsGoal,
  };
}
