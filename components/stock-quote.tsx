'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketData } from '@/hooks/useMarketData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MarketQuote } from '@/types/market';

export default function StockQuote() {
  const { user, loading } = useAuth();
  const [symbol, setSymbol] = useState('');
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const { fetchStockQuote, isLoading, error } = useMarketData();

  // Handle unauthenticated state (unless bypass is enabled)
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  if (!bypassAuth && !user && !loading) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Please sign in to access market data
        </AlertDescription>
      </Alert>
    );
  }

  // Handle loading auth state
  if (loading) {
    return <StockQuoteSkeleton />;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    const data = await fetchStockQuote(symbol);
    if (data) {
      setQuote(data);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol (e.g., AAPL)"
          className="max-w-xs"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && <StockQuoteSkeleton />}

      {quote && !isLoading && (
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Symbol</h3>
              <p className="text-lg font-semibold">{quote.symbol}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Price</h3>
              <p className="text-lg font-semibold">${quote.price.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Change</h3>
              <p className={`text-lg font-semibold ${quote.change >= 0 ? 'text-gray-600' : 'text-gray-600'}`}>
                {quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Volume</h3>
              <p className="text-lg font-semibold">{quote.volume.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
function StockQuoteSkeleton() {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}
