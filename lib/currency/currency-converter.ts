import { cache } from '../cache';

interface ExchangeRate {
  rate: number;
  timestamp: number;
}

export class CurrencyConverter {
  private static readonly CACHE_TTL = 3600; // 1 hour
  private static readonly SUPPORTED_CURRENCIES = ['EUR', 'GHS', 'UGX', 'XAF', 'XOF'];

  static async getExchangeRate(from: string, to: string): Promise<number> {
    const cacheKey = `exchange_rate:${from}:${to}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      const rate: ExchangeRate = JSON.parse(cached);
      if (Date.now() - rate.timestamp < this.CACHE_TTL * 1000) {
        return rate.rate;
      }
    }

    const rate = await this.fetchExchangeRate(from, to);
    await cache.set(cacheKey, JSON.stringify({
      rate,
      timestamp: Date.now(),
    }), this.CACHE_TTL);

    return rate;
  }

  static async convertAmount(
    amount: number,
    from: string,
    to: string
  ): Promise<number> {
    if (!this.SUPPORTED_CURRENCIES.includes(from) || !this.SUPPORTED_CURRENCIES.includes(to)) {
      throw new Error('Unsupported currency');
    }

    if (from === to) return amount;

    const rate = await this.getExchangeRate(from, to);
    return amount * rate;
  }

  private static async fetchExchangeRate(from: string, to: string): Promise<number> {
    const response = await fetch(
      `${process.env.EXCHANGE_RATE_API_URL}?base=${from}&symbols=${to}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.EXCHANGE_RATE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();
    return data.rates[to];
  }
}