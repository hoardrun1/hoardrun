import axios, { AxiosError } from 'axios';
// import { AppError, ErrorCode } from './error-handling';
import { marketCache } from './market-cache';
import { retry } from './api';

const alphaVantageClient = axios.create({
  baseURL: process.env.ALPHA_VANTAGE_BASE_URL,
  params: {
    apikey: process.env.ALPHA_VANTAGE_API_KEY,
  },
});

export interface StockQuote {
  symbol: string;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

class AlphaVantageAPI {
  private async makeRequest<T>(
    params: Record<string, string>,
    cacheKey: string,
    cacheDuration: number
  ): Promise<T> {
    return marketCache.getOrFetch(
      cacheKey,
      async () => {
        try {
          const response = await retry(
            () => alphaVantageClient.get('', { params }),
            { retries: 3, backoff: true }
          );

          if (response.data?.['Error Message']) {
            throw new Error(response.data['Error Message']);
          }

          return response.data;
        } catch (error) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 429) {
              throw new Error('API rate limit exceeded');
            }
          }
          throw new Error('Failed to fetch market data');
        }
      },
      cacheDuration
    );
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    const data = await this.makeRequest(
      {
        function: 'GLOBAL_QUOTE',
        symbol,
      },
      `quote:${symbol}`,
      60 // 1 minute cache
    );

    const quote = (data as any)['Global Quote'];
    if (!quote) {
      throw new Error('No data available for this symbol');
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      volume: parseInt(quote['06. volume']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      timestamp: quote['07. latest trading day'],
    };
  }

  async getDailyPrices(symbol: string) {
    return this.makeRequest(
      {
        function: 'TIME_SERIES_DAILY',
        symbol,
        outputsize: 'compact'
      },
      `daily:${symbol}`,
      300 // 5 minutes cache
    );
  }

  async getCompanyOverview(symbol: string) {
    return this.makeRequest(
      {
        function: 'OVERVIEW',
        symbol,
      },
      `overview:${symbol}`,
      3600 // 1 hour cache
    );
  }

  async getIntradayPrices(symbol: string, interval: string = '5min') {
    return this.makeRequest(
      {
        function: 'TIME_SERIES_INTRADAY',
        symbol,
        interval,
        outputsize: 'compact'
      },
      `intraday:${symbol}:${interval}`,
      60 // 1 minute cache
    );
  }
}

export const alphaVantageAPI = new AlphaVantageAPI();