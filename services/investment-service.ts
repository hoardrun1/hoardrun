import { api } from '@/lib/api-client'
import { cache } from '@/lib/cache'
import { alphaVantageAPI } from '@/lib/alpha-vantage-client'

export interface Investment {
  id: string
  name: string
  type: 'STOCKS' | 'BONDS' | 'REAL_ESTATE' | 'CRYPTO' | 'ETF' | 'MUTUAL_FUND'
  amount: number
  return: number
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
  description: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  startDate: Date
  endDate?: Date
  performance: Array<{
    period: string
    value: number
  }>
  holdings: string[]
  metadata?: Record<string, any>
}

export interface InvestmentCategory {
  id: string
  title: string
  return: number
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
  minInvestment: number
  description: string
  features: string[]
}

export interface MLPrediction {
  assetClass: string
  predictedReturn: number
  confidence: number
  timeframe: string
  factors: Array<{
    name: string
    impact: number
  }>
}

class InvestmentService {
  private readonly CACHE_DURATION = 5 * 60 // 5 minutes

  async getInvestments(filters?: {
    type?: string
    risk?: string
    status?: string
  }): Promise<Investment[]> {
    try {
      const cacheKey = `investments:${JSON.stringify(filters)}`
      const cached = await cache.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const response = await api.get('/investments', { params: filters })
      const investments = response.data

      await cache.set(cacheKey, JSON.stringify(investments), this.CACHE_DURATION)
      return investments
    } catch (error) {
      console.error('Get investments error:', error)
      throw error
    }
  }

  async createInvestment(data: {
    type: string
    amount: number
    risk?: string
    description?: string
  }): Promise<Investment> {
    try {
      const response = await api.post('/investments', data)
      await this.invalidateInvestmentCache()
      return response.data
    } catch (error) {
      console.error('Create investment error:', error)
      throw error
    }
  }

  async getInvestmentCategories(): Promise<InvestmentCategory[]> {
    try {
      const cacheKey = 'investment-categories'
      const cached = await cache.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const response = await api.get('/investments/categories')
      const categories = response.data

      await cache.set(cacheKey, JSON.stringify(categories), this.CACHE_DURATION)
      return categories
    } catch (error) {
      console.error('Get investment categories error:', error)
      throw error
    }
  }

  async getMLPredictions(params: {
    assetClass: string
    timeframe: string
  }): Promise<MLPrediction> {
    try {
      const cacheKey = `ml-predictions:${JSON.stringify(params)}`
      const cached = await cache.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const response = await api.get('/investments/predictions', { params })
      const predictions = response.data

      await cache.set(cacheKey, JSON.stringify(predictions), this.CACHE_DURATION)
      return predictions
    } catch (error) {
      console.error('Get ML predictions error:', error)
      throw error
    }
  }

  async getInvestmentPerformance(investmentId: string): Promise<{
    returns: number
    history: Array<{
      date: string
      value: number
    }>
  }> {
    try {
      const cacheKey = `investment-performance:${investmentId}`
      const cached = await cache.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const response = await api.get(`/investments/${investmentId}/performance`)
      const performance = response.data

      await cache.set(cacheKey, JSON.stringify(performance), this.CACHE_DURATION)
      return performance
    } catch (error) {
      console.error('Get investment performance error:', error)
      throw error
    }
  }

  async getPortfolioAnalytics(): Promise<{
    totalValue: number
    totalReturn: number
    riskScore: number
    diversification: number
    assetAllocation: Record<string, number>
    recommendations: Array<{
      type: string
      message: string
      impact: number
    }>
  }> {
    try {
      const cacheKey = 'portfolio-analytics'
      const cached = await cache.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const response = await api.get('/investments/analytics')
      const analytics = response.data

      await cache.set(cacheKey, JSON.stringify(analytics), this.CACHE_DURATION)
      return analytics
    } catch (error) {
      console.error('Get portfolio analytics error:', error)
      throw error
    }
  }

  async cancelInvestment(investmentId: string): Promise<void> {
    try {
      await api.delete(`/investments/${investmentId}`)
      await this.invalidateInvestmentCache()
    } catch (error) {
      console.error('Cancel investment error:', error)
      throw error
    }
  }

  private async invalidateInvestmentCache(): Promise<void> {
    try {
      await Promise.all([
        cache.delPattern('investments:*'),
        cache.delPattern('investment-performance:*'),
        cache.del('portfolio-analytics'),
      ])
    } catch (error) {
      console.error('Cache invalidation error:', error)
    }
  }

  async getMarketAnalysis(symbol: string) {
    try {
      const [quote, overview] = await Promise.all([
        alphaVantageAPI.getStockQuote(symbol),
        alphaVantageAPI.getCompanyOverview(symbol),
      ]);

      const quoteData = quote as any;
      const overviewData = overview as any;

      return {
        currentPrice: quoteData.price,
        priceChange: quoteData.change,
        priceChangePercent: quoteData.changePercent,
        volume: quoteData.volume,
        companyName: overviewData.Name,
        industry: overviewData.Industry,
        peRatio: parseFloat(overviewData.PERatio || '0'),
        marketCap: parseInt(overviewData.MarketCapitalization || '0'),
        dividendYield: parseFloat(overviewData.DividendYield || '0'),
      };
    } catch (error) {
      console.error('Market analysis error:', error);
      throw error;
    }
  }
}

export const investmentService = new InvestmentService()
export default investmentService 