'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AIGuidanceSummary, SmartNotificationsSummary } from '@/hooks/useDashboard';
import { 
  Brain, 
  Bell, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InsightsPanelProps {
  aiGuidance: AIGuidanceSummary | null;
  smartNotifications: SmartNotificationsSummary | null;
  loading?: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'critical':
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-blue-100 text-blue-700 border-blue-200';
  }
};

const getReadinessLevel = (score: number) => {
  if (score >= 80) return { label: 'Ready to Invest', color: 'text-green-600', bgColor: 'bg-green-50' };
  if (score >= 60) return { label: 'Nearly Ready', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  if (score >= 40) return { label: 'Building Foundation', color: 'text-orange-600', bgColor: 'bg-orange-50' };
  return { label: 'Getting Started', color: 'text-red-600', bgColor: 'bg-red-50' };
};

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ 
  aiGuidance, 
  smartNotifications, 
  loading 
}) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const readinessLevel = aiGuidance ? getReadinessLevel(aiGuidance.investment_readiness_score) : null;

  return (
    <div className="space-y-4">
      {/* AI Guidance Summary */}
      {aiGuidance && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Financial Guidance
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/ai-guidance')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <CardDescription>Personalized insights and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Investment Readiness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Investment Readiness</span>
                <Badge className={readinessLevel?.bgColor + ' ' + readinessLevel?.color}>
                  {readinessLevel?.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={aiGuidance.investment_readiness_score} className="flex-1 h-2" />
                <span className="text-2xl font-bold text-purple-600">
                  {aiGuidance.investment_readiness_score}
                </span>
              </div>
            </div>

            {/* Financial Health */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Financial Health</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {aiGuidance.overall_health}/100
              </span>
            </div>

            {/* Top Recommendations */}
            {aiGuidance.top_recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  Top Recommendations
                </p>
                {aiGuidance.top_recommendations.map((rec) => (
                  <div 
                    key={rec.id}
                    className="flex items-start gap-2 p-2 bg-white rounded border hover:border-purple-300 transition-colors cursor-pointer"
                    onClick={() => router.push('/ai-guidance')}
                  >
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{rec.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Impact: {rec.impact_score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Financial Persona */}
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
              <div className="p-2 bg-purple-100 rounded-full">
                <Brain className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Financial Persona</p>
                <p className="text-sm font-semibold capitalize">{aiGuidance.financial_persona}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Notifications Summary */}
      {smartNotifications && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Smart Notifications
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/smart-notifications')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <CardDescription>Intelligent financial nudges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border text-center">
                <p className="text-2xl font-bold text-blue-600">{smartNotifications.unread_count}</p>
                <p className="text-xs text-gray-600">Unread</p>
              </div>
              <div className="p-3 bg-white rounded-lg border text-center">
                <p className="text-2xl font-bold text-orange-600">{smartNotifications.high_priority_count}</p>
                <p className="text-xs text-gray-600">High Priority</p>
              </div>
            </div>

            {/* Recent Notifications */}
            {smartNotifications.recent_notifications.length > 0 && (
              <div className="space-y-2">
                {smartNotifications.recent_notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className="flex items-start gap-2 p-2 bg-white rounded border hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => router.push('/smart-notifications')}
                  >
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{notif.title}</p>
                      <Badge variant="secondary" className={`text-xs mt-1 ${getPriorityColor(notif.priority)}`}>
                        {notif.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InsightsPanel;

