/**
 * Financial Health Page Component
 * 
 * Main page for displaying comprehensive financial health score and analysis.
 */

'use client';

import React from 'react';
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { useFinancialHealthScore } from '@/hooks/useFinancialHealthScore';
import { HealthScoreGauge } from './HealthScoreGauge';
import { FactorBreakdown } from './FactorBreakdown';
import { ImprovementPlan } from './ImprovementPlan';
import { ScoreTrendChart } from './ScoreTrendChart';

export function FinancialHealthPage() {
  const {
    score,
    history,
    loading,
    error,
    refreshing,
    recalculateScore,
  } = useFinancialHealthScore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Calculating your financial health score...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Error Loading Health Score
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!score) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Financial Health Score
            </h1>
            <button
              onClick={recalculateScore}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh Score'}
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive analysis of your financial well-being
          </p>
        </div>

        {/* Strengths and Weaknesses Banner */}
        {(score.top_strengths.length > 0 || score.areas_for_improvement.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            {score.top_strengths.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Your Strengths
                  </h3>
                </div>
                <ul className="space-y-2">
                  {score.top_strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {score.areas_for_improvement.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Areas to Improve
                  </h3>
                </div>
                <ul className="space-y-2">
                  {score.areas_for_improvement.map((area, index) => (
                    <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">→</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Gauge - Takes 1 column */}
          <div className="lg:col-span-1">
            <HealthScoreGauge
              score={score.overall_score}
              level={score.level}
              trendDirection={score.trend_direction}
              scoreChange30d={score.score_change_30d}
              percentile={score.percentile}
            />
          </div>

          {/* Factor Breakdown - Takes 2 columns */}
          <div className="lg:col-span-2">
            <FactorBreakdown factors={score.factors} />
          </div>
        </div>

        {/* Trend Chart */}
        {history && history.trends.length > 0 && (
          <div className="mb-8">
            <ScoreTrendChart history={history} />
          </div>
        )}

        {/* Improvement Plan */}
        <div>
          <ImprovementPlan improvements={score.improvements} />
        </div>
      </div>
    </div>
  );
}

