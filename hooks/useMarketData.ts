import { useState } from 'react';
import { api } from '@/lib/api-client';
import { MarketQuote } from '@/types/market';

export function useMarketData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockQuote = async (symbol: string): Promise<MarketQuote | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/market', {
        params: {
          symbol,
          type: 'quote'
        }
      });

      return response.data.data;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stock quote';
      setError(message);
      return null;

    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyPrices = async (symbol: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/market', {
        params: {
          symbol,
          type: 'daily'
        }
      });

      return response.data.data;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch daily prices';
      setError(message);
      return null;

    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchStockQuote,
    fetchDailyPrices,
    isLoading,
    error
  };
}