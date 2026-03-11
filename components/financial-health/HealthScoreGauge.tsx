/**
 * Health Score Gauge Component
 * 
 * Visual gauge displaying the overall financial health score.
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HealthScoreGaugeProps {
  score: number;
  level: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
  trendDirection: 'improving' | 'stable' | 'declining';
  scoreChange30d: number;
  percentile?: number | null;
}

export function HealthScoreGauge({
  score,
  level,
  trendDirection,
  scoreChange30d,
  percentile
}: HealthScoreGaugeProps) {
  // Color mapping
  const getColor = () => {
    if (score >= 86) return 'text-green-500';
    if (score >= 76) return 'text-blue-500';
    if (score >= 61) return 'text-yellow-500';
    if (score >= 41) return 'text-orange-500';
    return 'text-red-500';
  };

  const getBgColor = () => {
    if (score >= 86) return 'bg-green-500';
    if (score >= 76) return 'bg-blue-500';
    if (score >= 61) return 'bg-yellow-500';
    if (score >= 41) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getLevelText = () => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const getTrendIcon = () => {
    if (trendDirection === 'improving') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trendDirection === 'declining') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  // Calculate gauge rotation (0-180 degrees)
  const rotation = (score / 100) * 180;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
        Financial Health Score
      </h3>

      {/* Gauge Visualization */}
      <div className="relative w-64 h-32 mx-auto mb-6">
        {/* Background arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Background segments */}
          <path
            d="M 10 90 A 80 80 0 0 1 190 90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Colored segments */}
          <path
            d="M 10 90 A 80 80 0 0 1 46 30"
            fill="none"
            stroke="#ef4444"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M 46 30 A 80 80 0 0 1 82 10"
            fill="none"
            stroke="#f97316"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M 82 10 A 80 80 0 0 1 118 10"
            fill="none"
            stroke="#eab308"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M 118 10 A 80 80 0 0 1 154 30"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M 154 30 A 80 80 0 0 1 190 90"
            fill="none"
            stroke="#22c55e"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Needle */}
          <line
            x1="100"
            y1="90"
            x2="100"
            y2="20"
            stroke="#1f2937"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation - 90} 100 90)`}
          />
          <circle cx="100" cy="90" r="6" fill="#1f2937" />
        </svg>

        {/* Score display */}
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getColor()}`}>
              {score}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              out of 100
            </div>
          </div>
        </div>
      </div>

      {/* Level and Trend */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
          <div className={`text-lg font-semibold ${getColor()}`}>
            {getLevelText()}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">30-Day Change</div>
            <div className={`text-lg font-semibold ${scoreChange30d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {scoreChange30d >= 0 ? '+' : ''}{scoreChange30d.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Percentile */}
      {percentile !== null && percentile !== undefined && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Your Ranking
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Top {(100 - percentile).toFixed(0)}% of users
          </div>
        </div>
      )}
    </div>
  );
}

