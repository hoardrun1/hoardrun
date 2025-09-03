// Core services exports for the application

export class AnalyticsService {
  static async getFinancialMetrics(userId: string) {
    // Mock implementation
    return {
      totalBalance: 10000,
      monthlySpending: 2500,
      savingsRate: 0.25,
      investmentGrowth: 0.08
    }
  }

  static async getFinancialOverview() {
    // Mock implementation for financial overview
    return {
      totalBalance: 15000,
      monthlyIncome: 5000,
      monthlyExpenses: 3500,
      savingsRate: 30,
      investmentValue: 25000,
      investmentGrowth: 8.5,
      creditScore: 750,
      debtToIncomeRatio: 25
    }
  }

  static async getSpendingAnalytics(userId: string) {
    return {
      categories: [
        { name: 'Food', amount: 800, percentage: 32 },
        { name: 'Transport', amount: 400, percentage: 16 },
        { name: 'Entertainment', amount: 300, percentage: 12 }
      ],
      trends: []
    }
  }
}

export class CardService {
  static async getCards(userId: string) {
    return [
      {
        id: '1',
        type: 'VISA',
        lastFourDigits: '1234',
        expiryDate: '12/25',
        cardholderName: 'John Doe',
        network: 'VISA',
        status: 'ACTIVE',
        isLocked: false,
        isContactless: true
      }
    ]
  }

  static async createVirtualCard(data: any) {
    return {
      id: 'new-card-id',
      type: 'VIRTUAL',
      ...data
    }
  }

  static async freezeCard(cardId: string) {
    // Mock implementation
    return { success: true, message: 'Card frozen successfully' }
  }

  static async reportLostCard(cardId: string) {
    // Mock implementation
    return { success: true, message: 'Card reported as lost' }
  }

  static async updateSpendingLimit(cardId: string, limit: number) {
    // Mock implementation
    return { success: true, limit }
  }

  static async updateLimit(cardId: string, limit: number) {
    // Alias for updateSpendingLimit
    return this.updateSpendingLimit(cardId, limit)
  }
}

export class InvestmentService {
  static async getPortfolio(userId: string) {
    return {
      totalValue: 50000,
      totalGain: 5000,
      gainPercentage: 10,
      investments: []
    }
  }
}
