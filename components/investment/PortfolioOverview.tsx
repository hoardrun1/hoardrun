import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  totalValue: number;
  gain: number;
  gainPercent: number;
}

interface PortfolioOverviewProps {
  portfolio?: PortfolioItem[];
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ 
  portfolio = [
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 10,
      currentPrice: 175.50,
      totalValue: 1755,
      gain: 255,
      gainPercent: 17.0
    },
    {
      id: '2',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 5,
      currentPrice: 2800.00,
      totalValue: 14000,
      gain: 2000,
      gainPercent: 16.7
    },
    {
      id: '3',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      shares: 8,
      currentPrice: 250.00,
      totalValue: 2000,
      gain: -400,
      gainPercent: -16.7
    }
  ]
}) => {
  const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
  const totalGain = portfolio.reduce((sum, item) => sum + item.gain, 0);
  const totalGainPercent = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Value</div>
              <div className="text-xl font-bold">${totalValue.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Gain/Loss</div>
              <div className={`text-xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Return</div>
              <div className={`text-xl font-bold ${totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Holdings */}
          <div className="space-y-3">
            <h4 className="font-semibold">Holdings</h4>
            {portfolio.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium">{item.symbol}</div>
                    <div className="text-sm text-gray-500">{item.name}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">${item.totalValue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">
                    {item.shares} shares @ ${item.currentPrice}
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge 
                    variant={item.gain >= 0 ? "default" : "destructive"}
                    className={item.gain >= 0 ? "bg-green-100 text-green-800" : ""}
                  >
                    {item.gain >= 0 ? '+' : ''}${item.gain.toLocaleString()}
                  </Badge>
                  <div className={`text-sm ${item.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.gainPercent >= 0 ? '+' : ''}{item.gainPercent.toFixed(2)}%
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
