/**
 * Score Trend Chart Component
 * 
 * Displays historical trend of financial health score.
 */

'use client';

import React from 'react';
import { HealthScoreHistory } from '@/hooks/useFinancialHealthScore';

interface ScoreTrendChartProps {
  history: HealthScoreHistory;
}

export function ScoreTrendChart({ history }: ScoreTrendChartProps) {
  const { trends, average_score, highest_score, lowest_score } = history;

  // Calculate chart dimensions
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 40;

  // Find min and max scores for scaling
  const minScore = Math.max(0, Math.floor(lowest_score / 10) * 10 - 10);
  const maxScore = Math.min(100, Math.ceil(highest_score / 10) * 10 + 10);

  // Create path for line chart
  const createPath = () => {
    if (trends.length === 0) return '';

    const points = trends.map((trend, index) => {
      const x = padding + (index / (trends.length - 1)) * (chartWidth - 2 * padding);
      const y = chartHeight - padding - ((trend.score - minScore) / (maxScore - minScore)) * (chartHeight - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Create area path
  const createAreaPath = () => {
    if (trends.length === 0) return '';

    const linePath = createPath();
    const lastPoint = trends.length - 1;
    const lastX = padding + (lastPoint / (trends.length - 1)) * (chartWidth - 2 * padding);
    const bottomY = chartHeight - padding;

    return `${linePath} L ${lastX},${bottomY} L ${padding},${bottomY} Z`;
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
        Score Trend
      </h3>

      {/* Chart */}
      <div className="mb-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
          style={{ minWidth: '400px' }}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((score) => {
            if (score < minScore || score > maxScore) return null;
            const y = chartHeight - padding - ((score - minScore) / (maxScore - minScore)) * (chartHeight - 2 * padding);
            return (
              <g key={score}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {score}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path
            d={createAreaPath()}
            fill="url(#gradient)"
            opacity="0.2"
          />

          {/* Line */}
          <path
            d={createPath()}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {trends.map((trend, index) => {
            const x = padding + (index / (trends.length - 1)) * (chartWidth - 2 * padding);
            const y = chartHeight - padding - ((trend.score - minScore) / (maxScore - minScore)) * (chartHeight - 2 * padding);
            
            // Only show every nth point to avoid clutter
            if (index % Math.ceil(trends.length / 10) !== 0 && index !== trends.length - 1) {
              return null;
            }

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                className="hover:r-6 transition-all cursor-pointer"
              >
                <title>{`${formatDate(trend.date)}: ${trend.score.toFixed(1)}`}</title>
              </circle>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Average
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {average_score.toFixed(1)}
          </div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Highest
          </div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {highest_score.toFixed(1)}
          </div>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Lowest
          </div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">
            {lowest_score.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}

