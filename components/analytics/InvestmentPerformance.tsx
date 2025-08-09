import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  currentValue: number;
  change: number;
  changePercent: number;
}

interface InvestmentPerformanceProps {
  investments?: Investment[];
}

export const InvestmentPerformance: React.FC<InvestmentPerformanceProps> = ({ 
  investments = [
    {
      id: '1',
      name: 'S&P 500 ETF',
      type: 'ETF',
      amount: 10000,
      currentValue: 11200,
      change: 1200,
      changePercent: 12.0
    },
    {
      id: '2',
      name: 'Tech Stocks',
      type: 'STOCK',
      amount: 5000,
      currentValue: 5800,
      change: 800,
      changePercent: 16.0
    },
    {
      id: '3',
      name: 'Bond Fund',
      type: 'BOND',
      amount: 3000,
      currentValue: 3150,
      change: 150,
      changePercent: 5.0
    }
  ]
}) => {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGain = totalValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Invested</div>
                <div className="text-lg font-semibold">${totalInvested.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Current Value</div>
                <div className="text-lg font-semibold">${totalValue.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Gain/Loss</div>
                <div className={`text-lg font-semibold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Return</div>
                <div className={`text-lg font-semibold ${totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Individual Investments */}
          <div className="space-y-3">
            {investments.map((investment) => (
              <div key={investment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{investment.name}</div>
                  <div className="text-sm text-gray-500">{investment.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${investment.currentValue.toLocaleString()}</div>
                  <div className={`text-sm ${investment.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {investment.change >= 0 ? '+' : ''}${investment.change.toLocaleString()} ({investment.changePercent >= 0 ? '+' : ''}{investment.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
