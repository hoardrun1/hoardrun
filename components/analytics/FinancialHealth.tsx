import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface FinancialHealthMetric {
  name: string;
  value: number;
  target: number;
  status: 'good' | 'warning' | 'poor';
  description: string;
}

interface FinancialHealthProps {
  metrics?: FinancialHealthMetric[];
}

export const FinancialHealth: React.FC<FinancialHealthProps> = ({ 
  metrics = [
    {
      name: 'Emergency Fund',
      value: 6,
      target: 6,
      status: 'good',
      description: 'Months of expenses covered'
    },
    {
      name: 'Debt-to-Income Ratio',
      value: 25,
      target: 30,
      status: 'good',
      description: 'Lower is better'
    },
    {
      name: 'Savings Rate',
      value: 20,
      target: 20,
      status: 'good',
      description: 'Percentage of income saved'
    },
    {
      name: 'Investment Allocation',
      value: 15,
      target: 20,
      status: 'warning',
      description: 'Percentage of net worth invested'
    }
  ]
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-gray-800 dark:text-gray-200';
      case 'warning': return 'text-gray-600 dark:text-gray-400';
      case 'poor': return 'text-gray-500 dark:text-gray-500';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-gray-800';
      case 'warning': return 'bg-gray-600';
      case 'poor': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  const overallScore = metrics.reduce((sum, metric) => {
    const score = Math.min((metric.value / metric.target) * 100, 100);
    return sum + score;
  }, 0) / metrics.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Health Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{overallScore.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Overall Health Score</div>
            <div className="mt-2">
              <Progress value={overallScore} className="h-2" />
            </div>
          </div>

          {/* Individual Metrics */}
          <div className="space-y-4">
            {metrics.map((metric, index) => {
              const progress = Math.min((metric.value / metric.target) * 100, 100);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-gray-500">{metric.description}</div>
                    </div>
                    <div className={`text-right ${getStatusColor(metric.status)}`}>
                      <div className="font-semibold">
                        {metric.name === 'Debt-to-Income Ratio' ? `${metric.value}%` : 
                         metric.name === 'Emergency Fund' ? `${metric.value} months` :
                         `${metric.value}%`}
                      </div>
                      <div className="text-xs capitalize">{metric.status}</div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Progress value={progress} className="h-2" />
                    <div 
                      className={`absolute top-0 left-0 h-2 rounded-full ${getProgressColor(metric.status)}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Target: {metric.name === 'Debt-to-Income Ratio' ? `${metric.target}%` : 
                            metric.name === 'Emergency Fund' ? `${metric.target} months` :
                            `${metric.target}%`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
