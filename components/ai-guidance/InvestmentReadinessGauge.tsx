'use client';

import React from 'react';
import { InvestmentReadinessScore } from '@/hooks/useAIGuidance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Shield, 
  Wallet, 
  PiggyBank, 
  Target,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface InvestmentReadinessGaugeProps {
  readiness: InvestmentReadinessScore;
}

export const InvestmentReadinessGauge: React.FC<InvestmentReadinessGaugeProps> = ({ readiness }) => {
  const getReadinessConfig = (level: string) => {
    switch (level) {
      case 'highly_ready':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
          label: 'Highly Ready',
          icon: <CheckCircle2 className="w-6 h-6" />
        };
      case 'ready':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
          label: 'Ready',
          icon: <TrendingUp className="w-6 h-6" />
        };
      case 'getting_ready':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          label: 'Getting Ready',
          icon: <Target className="w-6 h-6" />
        };
      case 'not_ready':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          label: 'Not Ready',
          icon: <AlertTriangle className="w-6 h-6" />
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          label: 'Unknown',
          icon: <Target className="w-6 h-6" />
        };
    }
  };

  const config = getReadinessConfig(readiness.readiness_level);

  const componentIcons = {
    emergency_fund: <Shield className="w-5 h-5" />,
    cash_flow_stability: <TrendingUp className="w-5 h-5" />,
    debt_management: <Wallet className="w-5 h-5" />,
    savings_rate: <PiggyBank className="w-5 h-5" />,
    financial_discipline: <Target className="w-5 h-5" />
  };

  const formatComponentName = (name: string) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Card className={`border-l-4 ${config.borderColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Investment Readiness</CardTitle>
            <CardDescription>Your readiness to start investing</CardDescription>
          </div>
          <div className={`${config.color}`}>
            {config.icon}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
          <div className={`text-6xl font-bold ${config.color} mb-2`}>
            {readiness.overall_score}
          </div>
          <div className="text-sm text-gray-600 mb-3">out of 100</div>
          <Badge className={`${config.bgColor} ${config.color} text-lg px-4 py-1`}>
            {config.label}
          </Badge>
        </div>

        {/* Component Scores */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Score Breakdown</h3>
          {Object.entries(readiness.component_scores).map(([key, score]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    {componentIcons[key as keyof typeof componentIcons]}
                  </span>
                  <span className="font-medium">{formatComponentName(key)}</span>
                </div>
                <span className="font-semibold">{score}/100</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          ))}
        </div>

        {/* Strengths */}
        {readiness.strengths.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-green-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Strengths
            </h3>
            <ul className="space-y-1">
              {readiness.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {readiness.weaknesses.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-orange-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Areas to Improve
            </h3>
            <ul className="space-y-1">
              {readiness.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm text-orange-700 flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">!</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Allocation */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-3">Recommended Portfolio</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {(readiness.recommended_allocation.stocks * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Stocks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {(readiness.recommended_allocation.bonds * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Bonds</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {(readiness.recommended_allocation.cash * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Cash</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentReadinessGauge;

