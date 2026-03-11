/**
 * AI Financial Guidance Hook
 * Provides personalized recommendations, investment readiness, and ML insights
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

// Types
export interface PersonalizedRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact_score: number;
  effort_level: 'low' | 'medium' | 'high';
  estimated_savings?: number;
  action_steps: string[];
  reasoning: string;
  category?: string;
  amount?: number;
  deadline?: string;
  is_completed: boolean;
  created_at: string;
  expires_at?: string;
}

export interface InvestmentReadinessScore {
  overall_score: number;
  readiness_level: 'not_ready' | 'getting_ready' | 'ready' | 'highly_ready';
  component_scores: {
    emergency_fund: number;
    cash_flow_stability: number;
    debt_management: number;
    savings_rate: number;
    financial_discipline: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  recommended_allocation: {
    stocks: number;
    bonds: number;
    cash: number;
  };
  minimum_investment_amount: number;
  emergency_fund_status: 'none' | 'insufficient' | 'adequate' | 'excellent';
  debt_to_income_ratio: number;
  cash_flow_stability: number;
  last_calculated: string;
}

export interface MLInsight {
  id: string;
  insight_type: 'spending_pattern' | 'income_trend' | 'savings_opportunity' | 'risk_alert' | 'behavioral_nudge';
  title: string;
  description: string;
  confidence_score: number;
  data_points: Record<string, any>;
  predicted_outcome?: string;
  recommendation?: string;
  category?: string;
  amount?: number;
  trend?: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  created_at: string;
}

export interface FinancialPersonaProfile {
  persona: 'saver' | 'spender' | 'investor' | 'balanced' | 'beginner';
  confidence: number;
  characteristics: string[];
  spending_habits: Record<string, any>;
  savings_habits: Record<string, any>;
  investment_behavior: Record<string, any>;
  financial_goals_alignment: number;
  behavior_trends: string[];
  last_updated: string;
}

export interface AIGuidanceResponse {
  user_id: string;
  recommendations: PersonalizedRecommendation[];
  investment_readiness: InvestmentReadinessScore;
  ml_insights: MLInsight[];
  financial_persona: FinancialPersonaProfile;
  overall_financial_health: number;
  next_review_date: string;
  generated_at: string;
}

export interface AIGuidanceSettings {
  user_id: string;
  enabled: boolean;
  recommendation_frequency: 'daily' | 'weekly' | 'monthly';
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  investment_goals: string[];
  exclude_recommendation_types: string[];
  min_recommendation_priority: 'critical' | 'high' | 'medium' | 'low';
  enable_ml_insights: boolean;
  enable_behavioral_nudges: boolean;
  updated_at: string;
}

export const useAIGuidance = () => {
  const [guidance, setGuidance] = useState<AIGuidanceResponse | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [investmentReadiness, setInvestmentReadiness] = useState<InvestmentReadinessScore | null>(null);
  const [insights, setInsights] = useState<MLInsight[]>([]);
  const [settings, setSettings] = useState<AIGuidanceSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch complete AI guidance
  const fetchGuidance = useCallback(async (
    includeRecommendations = true,
    includeInvestmentReadiness = true,
    includeInsights = true,
    timeHorizonDays = 90
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AIGuidanceResponse>(
        `/ai-guidance/?include_recommendations=${includeRecommendations}&include_investment_readiness=${includeInvestmentReadiness}&include_insights=${includeInsights}&time_horizon_days=${timeHorizonDays}`
      );
      setGuidance(response);
      setRecommendations(response.recommendations);
      setInvestmentReadiness(response.investment_readiness);
      setInsights(response.ml_insights);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI guidance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch recommendations only
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PersonalizedRecommendation[]>('/ai-guidance/recommendations');
      setRecommendations(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recommendations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch investment readiness
  const fetchInvestmentReadiness = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<InvestmentReadinessScore>('/ai-guidance/investment-readiness');
      setInvestmentReadiness(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch investment readiness');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch ML insights
  const fetchInsights = useCallback(async (timeHorizonDays = 90) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<MLInsight[]>(`/ai-guidance/insights?time_horizon_days=${timeHorizonDays}`);
      setInsights(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch insights');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AIGuidanceSettings>('/ai-guidance/settings');
      setSettings(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<AIGuidanceSettings>) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (updates.risk_tolerance) params.append('risk_tolerance', updates.risk_tolerance);
      if (updates.recommendation_frequency) params.append('recommendation_frequency', updates.recommendation_frequency);
      if (updates.min_recommendation_priority) params.append('min_recommendation_priority', updates.min_recommendation_priority);
      if (updates.enable_ml_insights !== undefined) params.append('enable_ml_insights', String(updates.enable_ml_insights));
      if (updates.enable_behavioral_nudges !== undefined) params.append('enable_behavioral_nudges', String(updates.enable_behavioral_nudges));

      const response = await apiClient.put<AIGuidanceSettings>(`/ai-guidance/settings?${params.toString()}`);
      setSettings(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions
  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'highly_ready': return 'text-green-600';
      case 'ready': return 'text-blue-600';
      case 'getting_ready': return 'text-yellow-600';
      case 'not_ready': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPersonaIcon = (persona: string) => {
    switch (persona) {
      case 'saver': return '💰';
      case 'spender': return '💸';
      case 'investor': return '📈';
      case 'balanced': return '⚖️';
      case 'beginner': return '🌱';
      default: return '👤';
    }
  };

  return {
    // State
    guidance,
    recommendations,
    investmentReadiness,
    insights,
    settings,
    loading,
    error,

    // Actions
    fetchGuidance,
    fetchRecommendations,
    fetchInvestmentReadiness,
    fetchInsights,
    fetchSettings,
    updateSettings,

    // Helpers
    getReadinessColor,
    getPriorityColor,
    getPersonaIcon,
  };
};

export default useAIGuidance;

