'use client';

import React, { useState } from 'react';
import { PersonalizedRecommendation } from '@/hooks/useAIGuidance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Target,
  DollarSign
} from 'lucide-react';

interface RecommendationCardProps {
  recommendation: PersonalizedRecommendation;
  onComplete?: (id: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  onComplete 
}) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { 
          color: 'bg-red-100 text-red-800 border-red-300', 
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Critical'
        };
      case 'high':
        return { 
          color: 'bg-orange-100 text-orange-800 border-orange-300', 
          icon: <TrendingUp className="w-4 h-4" />,
          label: 'High Priority'
        };
      case 'medium':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
          icon: <Target className="w-4 h-4" />,
          label: 'Medium'
        };
      case 'low':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-300', 
          icon: <Clock className="w-4 h-4" />,
          label: 'Low Priority'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-300', 
          icon: <Target className="w-4 h-4" />,
          label: 'Normal'
        };
    }
  };

  const getEffortBadge = (effort: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[effort as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const priorityConfig = getPriorityConfig(recommendation.priority);

  return (
    <Card className={`border-l-4 ${recommendation.is_completed ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={priorityConfig.color}>
                {priorityConfig.icon}
                <span className="ml-1">{priorityConfig.label}</span>
              </Badge>
              <Badge className={getEffortBadge(recommendation.effort_level)}>
                {recommendation.effort_level} effort
              </Badge>
              {recommendation.is_completed && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
            <CardDescription className="mt-1">{recommendation.description}</CardDescription>
          </div>
          <div className="text-right ml-4">
            <div className="text-sm font-semibold text-purple-600">
              Impact: {recommendation.impact_score}/100
            </div>
            {recommendation.estimated_savings && (
              <div className="text-xs text-green-600 flex items-center justify-end mt-1">
                <DollarSign className="w-3 h-3" />
                Save ${recommendation.estimated_savings}/mo
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Reasoning */}
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Why:</strong> {recommendation.reasoning}
          </p>
        </div>

        {/* Action Steps - Expandable */}
        {recommendation.action_steps.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              <span>Action Steps ({recommendation.action_steps.length})</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {expanded && (
              <ol className="mt-2 space-y-2 list-decimal list-inside">
                {recommendation.action_steps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-700 pl-2">
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex gap-4">
            {recommendation.category && (
              <span>Category: {recommendation.category}</span>
            )}
            {recommendation.deadline && (
              <span>Deadline: {new Date(recommendation.deadline).toLocaleDateString()}</span>
            )}
          </div>
          {!recommendation.is_completed && onComplete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onComplete(recommendation.id)}
              className="text-xs"
            >
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;

