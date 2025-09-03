// import { Investment } from '@prisma/client'
type Investment = any // Placeholder type

type InvestmentType = 'STOCK' | 'BOND' | 'REAL_ESTATE' | 'CRYPTO' | 'ETF' | 'MUTUAL_FUND' // Fixed to match Prisma enum
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' // Fixed to match Prisma enum

interface RiskProfile {
  overallRisk: RiskLevel
  diversification: number // 0 to 1
  volatility: number // 0 to 1
  confidence: number // 0 to 1
  suggestions: string[]
}

// Base return rates for different investment types
const baseReturnRates: Record<InvestmentType, number> = {
  STOCK: 0.10, // 10% annual return (fixed from STOCKS)
  BOND: 0.05, // 5% annual return (fixed from BONDS)
  REAL_ESTATE: 0.08, // 8% annual return
  CRYPTO: 0.15, // 15% annual return (high risk)
  ETF: 0.09, // 9% annual return
  MUTUAL_FUND: 0.07, // 7% annual return
}

// Risk multipliers for different risk levels
const riskMultipliers: Record<RiskLevel, number> = {
  LOW: 0.8, // 20% lower returns, but safer
  MEDIUM: 1.0, // Base return rate (fixed from MODERATE)
  HIGH: 1.2, // 20% higher returns, but riskier
}

export const calculateInvestmentReturn = (
  type: InvestmentType,
  amount: number,
  risk: RiskLevel
): number => {
  const baseReturn = baseReturnRates[type]
  const riskMultiplier = riskMultipliers[risk]
  
  // Calculate expected annual return
  const expectedReturn = amount * baseReturn * riskMultiplier

  // Add some randomness to simulate market volatility
  const volatility = getVolatilityFactor(risk)
  const randomFactor = 1 + (Math.random() * 2 - 1) * volatility

  return expectedReturn * randomFactor
}

const getVolatilityFactor = (risk: RiskLevel): number => {
  switch (risk) {
    case 'LOW':
      return 0.05 // 5% volatility
    case 'MEDIUM': // Fixed from MODERATE
      return 0.10 // 10% volatility
    case 'HIGH':
      return 0.20 // 20% volatility
    default:
      return 0.10
  }
}

export const analyzeRisk = (investments: Investment[]): RiskProfile => {
  if (!investments.length) {
    return {
      overallRisk: 'MEDIUM', // Fixed from MODERATE
      diversification: 0,
      volatility: 0,
      confidence: 1,
      suggestions: ['Start with a balanced portfolio across different investment types'],
    }
  }

  // Calculate total investment amount
  const totalAmount = investments.reduce((sum, inv) => sum + inv.amount, 0)

  // Calculate type distribution
  const typeDistribution = investments.reduce((dist, inv) => {
    dist[inv.type] = (dist[inv.type] || 0) + inv.amount
    return dist
  }, {} as Record<string, number>)

  // Calculate risk distribution
  const riskDistribution = investments.reduce((dist, inv) => {
    dist[inv.risk] = (dist[inv.risk] || 0) + inv.amount
    return dist
  }, {} as Record<string, number>)

  // Calculate diversification score (0-1)
  const typeCount = Object.keys(typeDistribution).length
  const maxTypes = Object.keys(baseReturnRates).length
  const diversification = typeCount / maxTypes

  // Calculate volatility based on risk distribution
  const volatility = Object.entries(riskDistribution).reduce((total, [risk, amount]) => {
    const weight = (amount as number) / totalAmount
    const riskFactor = getRiskFactor(risk as RiskLevel)
    return total + (weight * riskFactor)
  }, 0)

  // Determine overall risk level
  const overallRisk = getOverallRiskLevel(volatility)

  // Generate suggestions
  const suggestions = generateSuggestions(
    typeDistribution,
    riskDistribution,
    totalAmount,
    diversification
  )

  return {
    overallRisk,
    diversification,
    volatility,
    confidence: 0.8 + (diversification * 0.2), // Higher confidence with better diversification
    suggestions,
  }
}

const getRiskFactor = (risk: RiskLevel): number => {
  switch (risk) {
    case 'LOW':
      return 0.2
    case 'MEDIUM': // Fixed from MODERATE
      return 0.4
    case 'HIGH':
      return 0.7
    default:
      return 0.4
  }
}

const getOverallRiskLevel = (volatility: number): RiskLevel => {
  if (volatility <= 0.3) return 'LOW'
  if (volatility <= 0.5) return 'MEDIUM' // Fixed from MODERATE
  return 'HIGH' // Simplified since VERY_HIGH doesn't exist in Prisma enum
}

const generateSuggestions = (
  typeDistribution: Record<string, number>,
  riskDistribution: Record<string, number>,
  totalAmount: number,
  diversification: number
): string[] => {
  const suggestions: string[] = []

  // Check diversification
  if (diversification < 0.5) {
    suggestions.push('Consider diversifying your portfolio across more investment types')
  }

  // Check risk balance
  const highRiskAmount = (riskDistribution['HIGH'] || 0) + (riskDistribution['VERY_HIGH'] || 0)
  const highRiskPercentage = highRiskAmount / totalAmount

  if (highRiskPercentage > 0.6) {
    suggestions.push('Your portfolio has a high concentration of risky investments. Consider adding some stable investments.')
  }

  // Check investment type balance
  Object.entries(typeDistribution).forEach(([type, amount]) => {
    const percentage = amount / totalAmount
    if (percentage > 0.4) {
      suggestions.push(`Consider reducing exposure to ${type} as it represents ${Math.round(percentage * 100)}% of your portfolio`)
    }
  })

  // Add general suggestions
  if (!typeDistribution['BONDS'] && totalAmount > 10000) {
    suggestions.push('Consider adding bonds to your portfolio for stability')
  }

  if (!typeDistribution['ETF']) {
    suggestions.push('ETFs can provide good diversification with lower fees')
  }

  return suggestions
}

export const calculatePortfolioValue = (investments: Investment[]): number => {
  return investments.reduce((total, investment) => {
    if (investment.status === 'ACTIVE') {
      return total + investment.amount + (investment.return || 0)
    }
    return total
  }, 0)
}

export default {
  calculateInvestmentReturn,
  analyzeRisk,
  calculatePortfolioValue,
}
