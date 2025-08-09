export interface MarketQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  high: number
  low: number
  open: number
  close: number
  timestamp: Date
}

export interface MarketData {
  quotes: MarketQuote[]
  indices: MarketQuote[]
  trending: MarketQuote[]
}

export interface StockInfo {
  symbol: string
  name: string
  sector: string
  industry: string
  description: string
  marketCap: number
  peRatio: number
  dividendYield: number
  beta: number
}
