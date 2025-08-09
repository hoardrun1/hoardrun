import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpendingData {
  category: string;
  amount: number;
  percentage: number;
}

interface SpendingAnalyticsProps {
  data?: SpendingData[];
}

export const SpendingAnalytics: React.FC<SpendingAnalyticsProps> = ({ 
  data = [
    { category: 'Food & Dining', amount: 1200, percentage: 35 },
    { category: 'Transportation', amount: 800, percentage: 23 },
    { category: 'Entertainment', amount: 500, percentage: 15 },
    { category: 'Shopping', amount: 600, percentage: 17 },
    { category: 'Utilities', amount: 350, percentage: 10 }
  ]
}) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                />
                <span className="text-sm font-medium">{item.category}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">${item.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{item.percentage}%</div>
              </div>
            </div>
          ))}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Spending</span>
              <span className="font-bold text-lg">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
