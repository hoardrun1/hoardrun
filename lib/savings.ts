// import { SavingsGoal, SavingsContribution, Transaction } from '@prisma/client'
type SavingsGoal = any // Placeholder type
type SavingsContribution = any // Placeholder type
type Transaction = any // Placeholder type

interface InterestRate {
  baseRate: number
  bonusRate: number
  maxRate: number
}

interface GoalRecommendation {
  name: string
  category: string
  targetAmount: number
  monthlyContribution: number
  deadline: Date
  confidence: number
  reasoning: string
  expectedInterest: number
}

interface SavingsAnalysis {
  totalSaved: number
  savingsRate: number
  monthlyAverage: number
  projectedSavings: number
  recommendations: string[]
  riskLevel: 'low' | 'moderate' | 'high'
}

const INTEREST_RATES: Record<string, InterestRate> = {
  DEFAULT: {
    baseRate: 0.02, // 2% base interest
    bonusRate: 0.01, // 1% bonus for consistent savings
    maxRate: 0.04, // 4% maximum interest
  },
  HIGH_BALANCE: {
    baseRate: 0.025,
    bonusRate: 0.015,
    maxRate: 0.05,
  },
  LONG_TERM: {
    baseRate: 0.03,
    bonusRate: 0.02,
    maxRate: 0.06,
  },
}

const GOAL_CATEGORIES = {
  EMERGENCY_FUND: {
    multiplier: 6, // 6 months of expenses
    priority: 1,
    minAmount: 1000,
  },
  RETIREMENT: {
    multiplier: 12, // 1 year of income
    priority: 2,
    minAmount: 5000,
  },
  HOME_DOWN_PAYMENT: {
    multiplier: 0.2, // 20% of home value
    priority: 3,
    minAmount: 10000,
  },
  EDUCATION: {
    multiplier: 1, // 1 year of education cost
    priority: 4,
    minAmount: 5000,
  },
  VACATION: {
    multiplier: 0.1, // 10% of annual income
    priority: 5,
    minAmount: 1000,
  },
}

export const calculateInterest = (
  goal: SavingsGoal,
  contributions: SavingsContribution[]
): number => {
  const rates = determineInterestRates(goal, contributions)
  const baseInterest = goal.currentAmount * rates.baseRate

  // Calculate bonus interest based on consistency
  const consistencyBonus = calculateConsistencyBonus(contributions, rates.bonusRate)

  // Apply maximum rate limit
  const totalInterest = Math.min(
    baseInterest + consistencyBonus,
    goal.currentAmount * rates.maxRate
  )

  return totalInterest
}

const determineInterestRates = (
  goal: SavingsGoal,
  contributions: SavingsContribution[]
): InterestRate => {
  const totalSaved = goal.currentAmount
  const daysToDeadline = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  if (totalSaved >= 50000) {
    return INTEREST_RATES.HIGH_BALANCE
  }

  if (daysToDeadline >= 365) {
    return INTEREST_RATES.LONG_TERM
  }

  return INTEREST_RATES.DEFAULT
}

const calculateConsistencyBonus = (
  contributions: SavingsContribution[],
  bonusRate: number
): number => {
  if (contributions.length < 3) return 0

  // Sort contributions by date
  const sortedContributions = [...contributions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  // Check last 3 months for consistent contributions
  let consistentMonths = 0
  for (let i = 1; i < sortedContributions.length; i++) {
    const monthDiff = getMonthDifference(
      sortedContributions[i-1].createdAt,
      sortedContributions[i].createdAt
    )
    if (monthDiff === 1) consistentMonths++
  }

  // Calculate bonus based on consistency
  return (consistentMonths / 3) * bonusRate * sortedContributions[0].amount
}

export const generateGoalRecommendations = (
  monthlyIncome: number,
  monthlyExpenses: number,
  existingGoals: SavingsGoal[],
  transactions: Transaction[]
): GoalRecommendation[] => {
  const recommendations: GoalRecommendation[] = []
  const disposableIncome = monthlyIncome - monthlyExpenses
  const existingCategories = new Set(existingGoals.map(g => g.category))

  // Calculate optimal savings distribution
  const emergencyFundNeeded = monthlyExpenses * GOAL_CATEGORIES.EMERGENCY_FUND.multiplier
  const retirementNeeded = monthlyIncome * GOAL_CATEGORIES.RETIREMENT.multiplier
  const homeDownPaymentNeeded = calculateHomeDownPaymentTarget(monthlyIncome, transactions)

  // Generate recommendations based on missing essential goals
  if (!existingCategories.has('EMERGENCY_FUND')) {
    recommendations.push(createGoalRecommendation(
      'Emergency Fund',
      'EMERGENCY_FUND',
      emergencyFundNeeded,
      disposableIncome * 0.5, // 50% of disposable income
      6, // 6 months target
      0.9, // 90% confidence
      'Essential safety net for unexpected expenses'
    ))
  }

  if (!existingCategories.has('RETIREMENT')) {
    recommendations.push(createGoalRecommendation(
      'Retirement Savings',
      'RETIREMENT',
      retirementNeeded,
      disposableIncome * 0.3, // 30% of disposable income
      36, // 3 years initial target
      0.85,
      'Long-term financial security'
    ))
  }

  if (!existingCategories.has('HOME_DOWN_PAYMENT')) {
    recommendations.push(createGoalRecommendation(
      'Home Down Payment',
      'HOME_DOWN_PAYMENT',
      homeDownPaymentNeeded,
      disposableIncome * 0.2, // 20% of disposable income
      24, // 2 years target
      0.8,
      'Investment in real estate'
    ))
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence)
}

export const analyzeSavingsPattern = (
  goals: SavingsGoal[],
  contributions: SavingsContribution[],
  transactions: Transaction[]
): SavingsAnalysis => {
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const monthlyContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
  const monthlyExpenses = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const savingsRate = (monthlyContributions / monthlyExpenses) * 100
  const monthlyAverage = monthlyContributions / Math.max(contributions.length, 1)

  // Project savings based on current rate
  const projectedSavings = calculateProjectedSavings(
    totalSaved,
    monthlyAverage,
    savingsRate
  )

  // Generate recommendations
  const recommendations = generateSavingsRecommendations(
    savingsRate,
    monthlyAverage,
    goals
  )

  // Determine risk level
  const riskLevel = determineRiskLevel(savingsRate, goals)

  return {
    totalSaved,
    savingsRate,
    monthlyAverage,
    projectedSavings,
    recommendations,
    riskLevel,
  }
}

const getMonthDifference = (date1: Date, date2: Date): number => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return (
    (d1.getFullYear() - d2.getFullYear()) * 12 +
    (d1.getMonth() - d2.getMonth())
  )
}

const calculateHomeDownPaymentTarget = (
  monthlyIncome: number,
  transactions: Transaction[]
): number => {
  const annualIncome = monthlyIncome * 12
  const averageRent = Math.abs(
    transactions
      .filter(t => t.category === 'RENT' || t.category === 'HOUSING')
      .reduce((sum, t) => sum + t.amount, 0)
  ) / Math.max(transactions.length, 1)

  // Estimate home value based on income and rent
  const estimatedHomeValue = Math.max(
    annualIncome * 3, // 3x annual income
    averageRent * 200 // 200x monthly rent
  )

  return estimatedHomeValue * 0.2 // 20% down payment
}

const createGoalRecommendation = (
  name: string,
  category: string,
  targetAmount: number,
  monthlyContribution: number,
  durationMonths: number,
  confidence: number,
  reasoning: string
): GoalRecommendation => {
  const deadline = new Date()
  deadline.setMonth(deadline.getMonth() + durationMonths)

  return {
    name,
    category,
    targetAmount,
    monthlyContribution,
    deadline,
    confidence,
    reasoning,
    expectedInterest: calculateExpectedInterest(targetAmount, durationMonths),
  }
}

const calculateExpectedInterest = (
  targetAmount: number,
  durationMonths: number
): number => {
  const rates = INTEREST_RATES.DEFAULT
  const monthlyRate = rates.baseRate / 12
  return targetAmount * monthlyRate * durationMonths
}

const calculateProjectedSavings = (
  currentSavings: number,
  monthlyContribution: number,
  savingsRate: number
): number => {
  const annualInterestRate = INTEREST_RATES.DEFAULT.baseRate
  const monthlyInterestRate = annualInterestRate / 12
  const months = 12 // Project for 1 year

  return currentSavings * Math.pow(1 + monthlyInterestRate, months) +
    monthlyContribution * ((Math.pow(1 + monthlyInterestRate, months) - 1) / monthlyInterestRate)
}

const generateSavingsRecommendations = (
  savingsRate: number,
  monthlyAverage: number,
  goals: SavingsGoal[]
): string[] => {
  const recommendations: string[] = []

  if (savingsRate < 20) {
    recommendations.push('Consider increasing your savings rate to at least 20% of your income')
  }

  if (goals.length === 0) {
    recommendations.push('Start by setting up an emergency fund goal')
  }

  if (monthlyAverage < 100) {
    recommendations.push('Try to save at least $100 per month to build good habits')
  }

  return recommendations
}

const determineRiskLevel = (
  savingsRate: number,
  goals: SavingsGoal[]
): 'low' | 'moderate' | 'high' => {
  if (savingsRate < 10 || goals.length === 0) return 'high'
  if (savingsRate < 20 || !goals.some(g => g.category === 'EMERGENCY_FUND')) return 'moderate'
  return 'low'
}

export default {
  calculateInterest,
  generateGoalRecommendations,
  analyzeSavingsPattern,
} 