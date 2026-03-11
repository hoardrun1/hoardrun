/**
 * Improvement Plan Component
 * 
 * Displays personalized recommendations for improving financial health.
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Target, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { ScoreImprovement } from '@/hooks/useFinancialHealthScore';

interface ImprovementPlanProps {
  improvements: ScoreImprovement[];
}

export function ImprovementPlan({ improvements }: ImprovementPlanProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'border-red-500';
    if (priority === 2) return 'border-orange-500';
    if (priority === 3) return 'border-yellow-500';
    return 'border-gray-300';
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (improvements.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Improvement Plan
        </h3>
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Great job! Your financial health is excellent across all factors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
        Personalized Improvement Plan
      </h3>

      <div className="space-y-4">
        {improvements.map((improvement, index) => (
          <div
            key={index}
            className={`border-l-4 ${getPriorityColor(improvement.priority)} bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all`}
          >
            {/* Header */}
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    PRIORITY #{improvement.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(improvement.difficulty)}`}>
                    {improvement.difficulty.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {improvement.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {improvement.description}
                </p>
              </div>
              <button className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-6 mt-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Target className="w-4 h-4" />
                <span>+{improvement.potential_impact.toFixed(1)} points</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{improvement.timeframe}</span>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedIndex === index && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Action Steps
                  </span>
                </div>
                <ul className="space-y-2">
                  {improvement.action_steps.map((step, stepIndex) => (
                    <li
                      key={stepIndex}
                      className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-semibold">
                        {stepIndex + 1}
                      </span>
                      <span className="flex-1 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Potential Score Increase
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Following these recommendations could increase your score by up to{' '}
              <span className="font-bold">
                +{improvements.reduce((sum, imp) => sum + imp.potential_impact, 0).toFixed(1)} points
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

