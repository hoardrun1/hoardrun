import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface MarketStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface MarketWatchProps {
  watchlist?: MarketStock[];
  onAddToWatchlist?: (symbol: string) => void;
}

export const MarketWatch: React.FC<MarketWatchProps> = ({ 
  watchlist = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.50,
      change: 2.50,
      changePercent: 1.44,
      volume: 45000000
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 2800.00,
      change: -15.00,
      changePercent: -0.53,
      volume: 1200000
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      price: 420.00,
      change: 8.50,
      changePercent: 2.07,
      volume: 28000000
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 250.00,
      change: -12.00,
      changePercent: -4.58,
      volume: 85000000
    }
  ],
  onAddToWatchlist
}) => {
  const [searchSymbol, setSearchSymbol] = useState('');

  const handleAddToWatchlist = () => {
    if (searchSymbol.trim() && onAddToWatchlist) {
      onAddToWatchlist(searchSymbol.trim().toUpperCase());
      setSearchSymbol('');
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Watch</CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter symbol (e.g., AAPL)"
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddToWatchlist()}
          />
          <Button onClick={handleAddToWatchlist} size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {watchlist.map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{stock.symbol}</span>
                  <span className="text-sm text-gray-500 truncate">{stock.name}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Vol: {formatVolume(stock.volume)}
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold">${stock.price.toFixed(2)}</div>
                <div className="flex items-center space-x-1">
                  <Badge 
                    variant={stock.change >= 0 ? "default" : "destructive"}
                    className={`text-xs ${stock.change >= 0 ? "bg-green-100 text-green-800" : ""}`}
                  >
                    {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}
                  </Badge>
                  <span className={`text-xs ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
