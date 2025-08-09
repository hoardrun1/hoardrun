// Savings Goal Types
export interface SavingsGoal {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
  category: SavingsCategory
  deadline: string
  isAutoSave: boolean
  isCompleted: boolean
  progress: number
  createdAt: string
  updatedAt: string
  contributions: SavingsContribution[]
}

// Savings Categories with specific purposes
export type SavingsCategory = 
  | 'EMERGENCY_FUND'    // For unexpected expenses
  | 'RETIREMENT'        // Long-term retirement savings
  | 'EDUCATION'         // Education or training expenses
  | 'HOME'             // Home purchase or improvements
  | 'VEHICLE'          // Vehicle purchase or maintenance
  | 'TRAVEL'           // Travel and vacation funds
  | 'WEDDING'          // Wedding expenses
  | 'BUSINESS'         // Business startup or expansion
  | 'TECHNOLOGY'       // Technology purchases
  | 'HEALTHCARE'       // Medical expenses
  | 'DEBT_PAYMENT'     // Debt repayment goals
  | 'INVESTMENT'       // Investment portfolio building
  | 'CHARITY'          // Charitable giving
  | 'GENERAL'          // General savings

// Contribution tracking
export interface SavingsContribution {
  id: string
  goalId: string
  amount: number
  type: ContributionType
  description?: string
  createdAt: string
}

export type ContributionType = 'MANUAL' | 'AUTO' | 'BONUS' | 'INTEREST'

// Analytics and Insights
export interface SavingsAnalytics {
  totalSavings: number
  monthlyGrowth: number
  projectedSavings: number
  nextMilestone: number
  recommendedAllocation: {
    emergency: number    // Percentage for emergency fund
    investment: number   // Percentage for investments
    goals: number       // Percentage for specific goals
  }
  savingsRate: number   // Monthly savings rate
  timeToGoal: number    // Estimated months to reach goal
}

// AI-Powered Recommendations
export interface SavingsRecommendation {
  type: 'GOAL' | 'STRATEGY' | 'ADJUSTMENT'
  title: string
  description: string
  impact: {
    timeframe: number   // Months
    potentialSavings: number
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' // Fixed to match Prisma RiskLevel enum
  }
  confidence: number    // 0-100
  actionSteps: string[]
}

// Behavioral Insights
export interface SavingsBehaviorInsight {
  id: string
  type: 'SPENDING' | 'SAVING' | 'INVESTMENT'
  title: string
  description: string
  impact: number        // -100 to 100
  suggestedActions: {
    action: string
    potentialImpact: number
  }[]
  confidence: number    // 0-100
}

// Goal Templates
export interface SavingsGoalTemplate {
  category: SavingsCategory
  name: string
  suggestedAmount: number
  recommendedDuration: number  // months
  description: string
  tips: string[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' // Fixed to match Prisma RiskLevel enum
  autoSaveRecommended: boolean
  minimumContribution: number
}

// Progress Tracking
export interface SavingsProgress {
  currentAmount: number
  targetAmount: number
  percentageComplete: number
  monthlyAverage: number
  projectedCompletion: string
  milestones: {
    amount: number
    achieved: boolean
    date?: string
  }[]
}

// Form Data
export interface CreateSavingsGoalData {
  name: string
  targetAmount: number
  monthlyContribution: number
  category: SavingsCategory
  deadline: string
  isAutoSave: boolean
}

export interface UpdateSavingsGoalData {
  name?: string
  targetAmount?: number
  monthlyContribution?: number
  category?: SavingsCategory
  deadline?: string
  isAutoSave?: boolean
  isCompleted?: boolean
}

// Component Props
export interface SavingsGoalCardProps {
  goal: SavingsGoal
  onContribute: (amount: number) => Promise<void>
  onEdit: (data: UpdateSavingsGoalData) => Promise<void>
  onDelete: () => Promise<void>
}

export interface SavingsAnalyticsCardProps {
  analytics: SavingsAnalytics
  currency?: string
}

export interface SavingsInsightCardProps {
  insight: SavingsBehaviorInsight
  onActionSelect: (action: string) => void
  onDismiss: () => void
}

// Loading and Error States
export interface SavingsLoadingState {
  isLoading: boolean
  error: string | null
}

// Category Metadata
export const SAVINGS_CATEGORIES: Record<SavingsCategory, {
  label: string
  description: string
  icon: string
  recommendedPercentage: number
  minimumAmount: number
  suggestedDuration: number
}> = {
  EMERGENCY_FUND: {
    label: 'Emergency Fund',
    description: '3-6 months of living expenses for unexpected costs',
    icon: '🚨',
    recommendedPercentage: 30,
    minimumAmount: 1000,
    suggestedDuration: 12
  },
  RETIREMENT: {
    label: 'Retirement',
    description: 'Long-term savings for retirement years',
    icon: '👴',
    recommendedPercentage: 15,
    minimumAmount: 5000,
    suggestedDuration: 360
  },
  EDUCATION: {
    label: 'Education',
    description: 'Savings for education or professional development',
    icon: '🎓',
    recommendedPercentage: 10,
    minimumAmount: 1000,
    suggestedDuration: 48
  },
  HOME: {
    label: 'Home',
    description: 'Savings for home purchase or improvements',
    icon: '🏠',
    recommendedPercentage: 20,
    minimumAmount: 5000,
    suggestedDuration: 60
  },
  VEHICLE: {
    label: 'Vehicle',
    description: 'Savings for vehicle purchase or maintenance',
    icon: '🚗',
    recommendedPercentage: 10,
    minimumAmount: 2000,
    suggestedDuration: 36
  },
  TRAVEL: {
    label: 'Travel',
    description: 'Savings for vacations and travel experiences',
    icon: '✈️',
    recommendedPercentage: 5,
    minimumAmount: 500,
    suggestedDuration: 12
  },
  WEDDING: {
    label: 'Wedding',
    description: 'Savings for wedding expenses',
    icon: '💍',
    recommendedPercentage: 10,
    minimumAmount: 5000,
    suggestedDuration: 24
  },
  BUSINESS: {
    label: 'Business',
    description: 'Savings for business ventures',
    icon: '💼',
    recommendedPercentage: 15,
    minimumAmount: 5000,
    suggestedDuration: 24
  },
  TECHNOLOGY: {
    label: 'Technology',
    description: 'Savings for technology purchases',
    icon: '💻',
    recommendedPercentage: 5,
    minimumAmount: 500,
    suggestedDuration: 12
  },
  HEALTHCARE: {
    label: 'Healthcare',
    description: 'Savings for medical expenses',
    icon: '🏥',
    recommendedPercentage: 10,
    minimumAmount: 1000,
    suggestedDuration: 24
  },
  DEBT_PAYMENT: {
    label: 'Debt Payment',
    description: 'Savings for debt repayment',
    icon: '💰',
    recommendedPercentage: 20,
    minimumAmount: 1000,
    suggestedDuration: 24
  },
  INVESTMENT: {
    label: 'Investment',
    description: 'Savings for investment opportunities',
    icon: '📈',
    recommendedPercentage: 15,
    minimumAmount: 1000,
    suggestedDuration: 36
  },
  CHARITY: {
    label: 'Charity',
    description: 'Savings for charitable giving',
    icon: '🤝',
    recommendedPercentage: 5,
    minimumAmount: 100,
    suggestedDuration: 12
  },
  GENERAL: {
    label: 'General Savings',
    description: 'General purpose savings',
    icon: '🎯',
    recommendedPercentage: 10,
    minimumAmount: 500,
    suggestedDuration: 24
  }
} 