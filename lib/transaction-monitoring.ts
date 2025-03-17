import { prisma } from './prisma';
import { cache } from './cache';
import { AppError, errorCodes } from './error-handling';

export class TransactionMonitoring {
  private readonly VELOCITY_CHECK_WINDOW = 5 * 60; // 5 minutes
  private readonly HIGH_RISK_THRESHOLD = 10000;
  private readonly SUSPICIOUS_PATTERNS = {
    RAPID_SMALL_TRANSACTIONS: 'RAPID_SMALL_TRANSACTIONS',
    LARGE_ROUND_NUMBERS: 'LARGE_ROUND_NUMBERS',
    UNUSUAL_HOURS: 'UNUSUAL_HOURS',
    MULTIPLE_CURRENCIES: 'MULTIPLE_CURRENCIES',
  };

  async monitorTransaction(transaction: {
    userId: string;
    amount: number;
    currency: string;
    beneficiaryId: string;
    type: string;
  }) {
    const riskScore = await this.calculateRiskScore(transaction);
    
    if (riskScore > 80) {
      throw new AppError(
        errorCodes.HIGH_RISK_TRANSACTION,
        'Transaction flagged for review',
        403
      );
    }

    if (riskScore > 50) {
      await this.requireAdditionalVerification(transaction);
    }

    await this.logTransaction({
      ...transaction,
      riskScore,
      timestamp: new Date(),
    });
  }

  private async calculateRiskScore(transaction: any): Promise<number> {
    let score = 0;

    // Check transaction velocity
    const recentTransactions = await this.getRecentTransactions(
      transaction.userId,
      this.VELOCITY_CHECK_WINDOW
    );

    if (recentTransactions.length > 5) score += 20;

    // Check amount patterns
    if (this.isRoundNumber(transaction.amount)) score += 10;
    if (transaction.amount > this.HIGH_RISK_THRESHOLD) score += 30;

    // Check time patterns
    if (this.isUnusualHour(new Date())) score += 15;

    // Check beneficiary history
    const beneficiaryRisk = await this.assessBeneficiaryRisk(
      transaction.beneficiaryId
    );
    score += beneficiaryRisk;

    return Math.min(score, 100);
  }

  private async requireAdditionalVerification(transaction: any) {
    // Implement your verification logic here
    // This could include 2FA, email verification, etc.
  }

  private isRoundNumber(amount: number): boolean {
    return amount % 1000 === 0 || amount % 500 === 0;
  }

  private isUnusualHour(date: Date): boolean {
    const hour = date.getHours();
    return hour >= 23 || hour <= 4;
  }
}