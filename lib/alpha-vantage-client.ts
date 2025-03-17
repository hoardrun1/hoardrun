import axios, { AxiosError } from 'axios';
import { AppError, ErrorCode } from './error-handling';
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
            throw new AppError(
              ErrorCode.API_ERROR,
              response.data['Error Message'],
              400
            );
          }

          return response.data;
        } catch (error) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 429) {
              throw new AppError(
                ErrorCode.RATE_LIMIT_EXCEEDED,
                'API rate limit exceeded',
                429
              );
            }
          }
          throw new AppError(
            ErrorCode.API_ERROR,
            'Failed to fetch market data',
            500
          );
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

    const quote = data['Global Quote'];
    if (!quote) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'No data available for this symbol',
        404
      );
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
}

export const alphaVantageAPI = new AlphaVantageAPI();