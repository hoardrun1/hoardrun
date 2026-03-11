/**
 * Financial Health Score Hook
 * 
 * Custom hook for managing financial health score data and state.
 */

import { useState, useEffect, useCallback } from 'react';

// Types
export interface HealthFactor {
  category: string;
  name: string;
  score: number;
  weight: number;
  current_value: number;
  target_value: number | null;
  unit: string;
  status: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
  description: string;
  impact: string;
}

export interface ScoreImprovement {
  factor: string;
  title: string;
  description: string;
  potential_impact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
  action_steps: string[];
  priority: number;
}

export interface FinancialHealthScore {
  user_id: string;
  overall_score: number;
  level: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
  factors: HealthFactor[];
  trend_direction: 'improving' | 'stable' | 'declining';
  score_change_30d: number;
  score_change_90d: number;
  percentile: number | null;
  top_strengths: string[];
  areas_for_improvement: string[];
  improvements: ScoreImprovement[];
  calculated_at: string;
  next_update: string | null;
}

export interface HealthScoreTrend {
  date: string;
  score: number;
  level: string;
  factors: Record<string, number>;
}

export interface HealthScoreHistory {
  user_id: string;
  trends: HealthScoreTrend[];
  period_start: string;
  period_end: string;
  average_score: number;
  highest_score: number;
  lowest_score: number;
}

export interface HealthScoreSettings {
  user_id: string;
  custom_weights: Record<string, number> | null;
  excluded_factors: string[];
  notification_threshold: number;
  auto_update_frequency: string;
}

export function useFinancialHealthScore() {
  const [score, setScore] = useState<FinancialHealthScore | null>(null);
  const [history, setHistory] = useState<HealthScoreHistory | null>(null);
  const [settings, setSettings] = useState<HealthScoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch current health score
  const fetchScore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/financial-health/score', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch health score');
      }

      const data = await response.json();
      setScore(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch score history
  const fetchHistory = useCallback(async (days: number = 90) => {
    try {
      const response = await fetch(`/api/v1/financial-health/history?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch score history');
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/financial-health/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<HealthScoreSettings>) => {
    try {
      const response = await fetch('/api/v1/financial-health/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...settings, ...newSettings }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      setSettings(data);
      
      // Recalculate score with new settings
      await recalculateScore();
    } catch (err) {
      throw err;
    }
  }, [settings]);

  // Force recalculation
  const recalculateScore = useCallback(async () => {
    try {
      setRefreshing(true);

      const response = await fetch('/api/v1/financial-health/recalculate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to recalculate score');
      }

      const data = await response.json();
      setScore(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchScore();
    fetchHistory();
    fetchSettings();
  }, [fetchScore, fetchHistory, fetchSettings]);

  return {
    score,
    history,
    settings,
    loading,
    error,
    refreshing,
    refetch: fetchScore,
    fetchHistory,
    updateSettings,
    recalculateScore,
  };
}

