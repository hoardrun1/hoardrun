import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AssetAllocation {
  category: string;
  percentage: number;
  value: number;
  color: string;
}

interface PerformanceMetric {
  period: string;
  return: number;
  benchmark: number;
}

interface InvestmentAnalyticsProps {
  allocation?: AssetAllocation[];
  performance?: PerformanceMetric[];
}

export const InvestmentAnalytics: React.FC<InvestmentAnalyticsProps> = ({ 
  allocation = [
    { category: 'Stocks', percentage: 65, value: 32500, color: '#3B82F6' },
    { category: 'Bonds', percentage: 20, value: 10000, color: '#10B981' },
    { category: 'ETFs', percentage: 10, value: 5000, color: '#F59E0B' },
    { category: 'Cash', percentage: 5, value: 2500, color: '#6B7280' }
  ],
  performance = [
    { period: '1 Month', return: 2.5, benchmark: 1.8 },
    { period: '3 Months', return: 8.2, benchmark: 6.5 },
    { period: '6 Months', return: 15.7, benchmark: 12.3 },
    { period: '1 Year', return: 22.4, benchmark: 18.9 },
    { period: '3 Years', return: 45.6, benchmark: 38.2 }
  ]
}) => {
  const totalValue = allocation.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allocation.map((asset, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="font-medium">{asset.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${asset.value.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{asset.percentage}%</div>
                  </div>
                </div>
                <Progress value={asset.percentage} className="h-2" />
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Portfolio</span>
                <span className="font-bold text-lg">${totalValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performance.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{metric.period}</span>
                  <div className="text-right">
                    <div className={`font-semibold ${metric.return >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                      {metric.return >= 0 ? '+' : ''}{metric.return.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Benchmark: {metric.benchmark >= 0 ? '+' : ''}{metric.benchmark.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Your Return</div>
                    <Progress
                      value={Math.abs(metric.return)}
                      className={`h-2 ${metric.return >= 0 ? '' : 'bg-muted'}`}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Benchmark</div>
                    <Progress
                      value={Math.abs(metric.benchmark)}
                      className="h-2 bg-muted"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-center">
                  <span className={metric.return > metric.benchmark ? 'text-status-success' : 'text-status-warning'}>
                    {metric.return > metric.benchmark ? 'Outperforming' : 'Underperforming'} by{' '}
                    {Math.abs(metric.return - metric.benchmark).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
