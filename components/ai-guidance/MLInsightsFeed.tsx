'use client';

import React from 'react';
import { MLInsight } from '@/hooks/useAIGuidance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertCircle,
  Lightbulb,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface MLInsightsFeedProps {
  insights: MLInsight[];
}

export const MLInsightsFeed: React.FC<MLInsightsFeedProps> = ({ insights }) => {
  const getInsightConfig = (type: string) => {
    switch (type) {
      case 'spending_pattern':
        return {
          icon: <BarChart3 className="w-5 h-5" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          label: 'Spending Pattern'
        };
      case 'income_trend':
        return {
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Income Trend'
        };
      case 'savings_opportunity':
        return {
          icon: <Lightbulb className="w-5 h-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Savings Opportunity'
        };
      case 'risk_alert':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Risk Alert'
        };
      case 'behavioral_nudge':
        return {
          icon: <Activity className="w-5 h-5" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'Behavioral Insight'
        };
      default:
        return {
          icon: <Activity className="w-5 h-5" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Insight'
        };
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'volatile':
        return <Activity className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No insights available yet. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => {
        const config = getInsightConfig(insight.insight_type);
        
        return (
          <Card key={insight.id} className={`border-l-4 ${config.borderColor}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${config.color} ${config.bgColor} p-2 rounded-lg`}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${config.bgColor} ${config.color}`}>
                        {config.label}
                      </Badge>
                      {insight.trend && (
                        <div className="flex items-center gap-1">
                          {getTrendIcon(insight.trend)}
                          <span className="text-xs text-gray-600 capitalize">{insight.trend}</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getConfidenceColor(insight.confidence_score)}`}>
                    {(insight.confidence_score * 100).toFixed(0)}% confident
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Description */}
              <p className="text-sm text-gray-700">{insight.description}</p>

              {/* Amount if available */}
              {insight.amount && (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  <span>${Number(insight.amount).toFixed(2)}</span>
                </div>
              )}

              {/* Predicted Outcome */}
              {insight.predicted_outcome && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Prediction:</strong> {insight.predicted_outcome}
                  </p>
                </div>
              )}

              {/* Recommendation */}
              {insight.recommendation && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900">
                    <strong>Recommendation:</strong> {insight.recommendation}
                  </p>
                </div>
              )}

              {/* Data Points */}
              {Object.keys(insight.data_points).length > 0 && (
                <details className="text-xs text-gray-600">
                  <summary className="cursor-pointer hover:text-gray-900 font-medium">
                    View Details
                  </summary>
                  <div className="mt-2 p-2 bg-gray-50 rounded space-y-1">
                    {Object.entries(insight.data_points).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-mono">
                          {typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Timestamp */}
              <div className="text-xs text-gray-500">
                Generated: {new Date(insight.created_at).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MLInsightsFeed;

