/**
 * Enhanced Dashboard Hook
 * Provides comprehensive dashboard data from multiple sources
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

// Types
export interface DashboardData {
  financial_summary: {
    balances: {
      total_balance: CurrencyAmount;
      available_balance: CurrencyAmount;
      net_worth: CurrencyAmount;
    };
    assets: {
      total_assets: CurrencyAmount;
      cash_and_equivalents: CurrencyAmount;
      investments: CurrencyAmount;
    };
    liabilities: {
      total_liabilities: CurrencyAmount;
    };
  };
  recent_activity: RecentTransaction[];
  notifications_count: number;
  account_alerts: AccountAlert[];
  quick_stats: QuickStats;
}

export interface CurrencyAmount {
  amount: number;
  currency: string;
  formatted: string;
  symbol: string;
}

export interface RecentTransaction {
  transaction_id: string;
  amount: CurrencyAmount;
  type: string;
  merchant?: string;
  category?: string;
  date: string;
  status: string;
}

export interface AccountAlert {
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  account_id?: string;
  action_suggested?: string;
}

export interface QuickStats {
  monthly_spending: CurrencyAmount;
  weekly_spending: CurrencyAmount;
  avg_transaction: CurrencyAmount;
  total_accounts: number;
  active_cards: number;
}

export interface AIGuidanceSummary {
  investment_readiness_score: number;
  top_recommendations: Array<{
    id: string;
    title: string;
    priority: string;
    impact_score: number;
  }>;
  financial_persona: string;
  overall_health: number;
}

export interface SmartNotificationsSummary {
  unread_count: number;
  high_priority_count: number;
  recent_notifications: Array<{
    id: string;
    title: string;
    type: string;
    priority: string;
  }>;
}

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [aiGuidance, setAIGuidance] = useState<AIGuidanceSummary | null>(null);
  const [smartNotifications, setSmartNotifications] = useState<SmartNotificationsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch AI guidance summary
  const fetchAIGuidance = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/ai-guidance/?include_recommendations=true&include_investment_readiness=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAIGuidance({
          investment_readiness_score: result.investment_readiness?.overall_score || 0,
          top_recommendations: result.recommendations?.slice(0, 3).map((rec: any) => ({
            id: rec.id,
            title: rec.title,
            priority: rec.priority,
            impact_score: rec.impact_score,
          })) || [],
          financial_persona: result.financial_persona?.type || 'unknown',
          overall_health: result.overall_financial_health || 0,
        });
      }
    } catch (err) {
      console.error('AI Guidance fetch error:', err);
    }
  }, []);

  // Fetch smart notifications summary
  const fetchSmartNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/smart-notifications/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const notifications = result.notifications || [];
        setSmartNotifications({
          unread_count: notifications.filter((n: any) => !n.is_read).length,
          high_priority_count: notifications.filter((n: any) => n.priority === 'urgent' || n.priority === 'high').length,
          recent_notifications: notifications.slice(0, 3).map((n: any) => ({
            id: n.id,
            title: n.title,
            type: n.type,
            priority: n.priority,
          })),
        });
      }
    } catch (err) {
      console.error('Smart Notifications fetch error:', err);
    }
  }, []);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchDashboard(),
      fetchAIGuidance(),
      fetchSmartNotifications(),
    ]);
  }, [fetchDashboard, fetchAIGuidance, fetchSmartNotifications]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    dashboardData,
    aiGuidance,
    smartNotifications,
    loading,
    error,
    refresh,
  };
}

