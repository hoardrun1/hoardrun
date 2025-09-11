import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { MarketQuote } from '@/types/market';

export function useMarketData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockQuote = async (symbol: string): Promise<MarketQuote | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the Python backend API client
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/market-data?symbol=${symbol}&type=quote`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock quote');
      }

      const data = await response.json();
      return data;

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

      // Use the Python backend API client
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/market-data?symbol=${symbol}&type=daily`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily prices');
      }

      const data = await response.json();
      return data;

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
