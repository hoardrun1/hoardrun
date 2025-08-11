interface SavingsTip {
  type: string;
  title: string;
  description: string;
  action?: string;
  category?: string;
  potentialSavings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  priority?: string;
}

export const getProgressColor = (progress: number): string => {
  if (progress >= 90) return 'bg-green-500'
  if (progress >= 70) return 'bg-emerald-500'
  if (progress >= 50) return 'bg-blue-500'
  if (progress >= 30) return 'bg-yellow-500'
  return 'bg-gray-500'
}

export const calculateProjectedSavings = (
  currentAmount: number,
  monthlyContribution: number,
  monthsLeft: number,
  interestRate: number = 0.05
): number => {
  const monthlyRate = interestRate / 12
  return currentAmount * Math.pow(1 + monthlyRate, monthsLeft) +
    monthlyContribution * ((Math.pow(1 + monthlyRate, monthsLeft) - 1) / monthlyRate)
}

export const generateSavingsTips = (
  savingsData: any,
  userProfile: any
): SavingsTip[] => {
  const tips: SavingsTip[] = []
  
  // Analyze spending patterns
  if (savingsData.monthlyExpenses > savingsData.monthlyIncome * 0.7) {
    tips.push({
      type: 'warning',
      title: 'High Expense Ratio',
      description: 'Your expenses are over 70% of income. Consider reviewing non-essential spending.',
      action: 'Review Budget',
      priority: 'high'
    })
  }

  // Check emergency fund
  const emergencyFund = savingsData.goals?.find((g: any) => g.category === 'EMERGENCY')
  if (!emergencyFund || emergencyFund.progress < 50) {
    tips.push({
      type: 'suggestion',
      title: 'Build Emergency Fund',
      description: 'Aim to save 3-6 months of expenses for emergencies.',
      action: 'Start Emergency Fund',
      priority: 'high'
    })
  }

  return tips
}