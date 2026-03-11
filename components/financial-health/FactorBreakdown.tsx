/**
 * Factor Breakdown Component
 * 
 * Displays detailed breakdown of individual health factors.
 */

'use client';

import React from 'react';
import { Wallet, TrendingDown, PiggyBank, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { HealthFactor } from '@/hooks/useFinancialHealthScore';

interface FactorBreakdownProps {
  factors: HealthFactor[];
}

export function FactorBreakdown({ factors }: FactorBreakdownProps) {
  const getIcon = (category: string) => {
    switch (category) {
      case 'emergency_fund':
        return <Wallet className="w-5 h-5" />;
      case 'debt':
        return <TrendingDown className="w-5 h-5" />;
      case 'savings':
        return <PiggyBank className="w-5 h-5" />;
      case 'spending':
        return <ShoppingCart className="w-5 h-5" />;
      case 'income':
        return <DollarSign className="w-5 h-5" />;
      case 'investments':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 86) return 'text-green-500';
    if (score >= 76) return 'text-blue-500';
    if (score >= 61) return 'text-yellow-500';
    if (score >= 41) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 86) return 'bg-green-500';
    if (score >= 76) return 'bg-blue-500';
    if (score >= 61) return 'bg-yellow-500';
    if (score >= 41) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
        Factor Breakdown
      </h3>

      <div className="space-y-6">
        {factors.map((factor, index) => (
          <div key={index} className="space-y-2">
            {/* Factor Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`${getScoreColor(factor.score)}`}>
                  {getIcon(factor.category)}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {factor.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Weight: {(factor.weight * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(factor.score)}`}>
                {factor.score.toFixed(0)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(factor.score)}`}
                style={{ width: `${factor.score}%` }}
              />
            </div>

            {/* Current vs Target */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                Current: <span className="font-medium text-gray-900 dark:text-white">
                  {factor.current_value.toFixed(1)}{factor.unit}
                </span>
              </div>
              {factor.target_value !== null && (
                <div className="text-gray-600 dark:text-gray-400">
                  Target: <span className="font-medium text-gray-900 dark:text-white">
                    {factor.target_value.toFixed(1)}{factor.unit}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {factor.description}
            </div>

            {/* Impact */}
            <div className="text-xs text-gray-500 dark:text-gray-500 italic">
              💡 {factor.impact}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">
              {factors.filter(f => f.score >= 76).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Strong Factors
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">
              {factors.filter(f => f.score >= 61 && f.score < 76).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Fair Factors
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">
              {factors.filter(f => f.score < 61).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Needs Work
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

