import { useState, useEffect } from 'react';
import { SpendingAnalytics } from './SpendingAnalytics';
import { SavingsProgress } from './SavingsProgress';
import { InvestmentPerformance } from './InvestmentPerformance';
import { FinancialHealth } from './FinancialHealth';
import { AnalyticsService } from '@/services/core';

export function FinancialDashboard() {
  const [analytics, setAnalytics] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    investmentValue: 0,
    investmentGrowth: 0,
    creditScore: 0,
    debtToIncomeRatio: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const data = await AnalyticsService.getFinancialOverview();
      setAnalytics(data);
    };
    
    fetchAnalytics();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SpendingAnalytics />
      <SavingsProgress />
      <InvestmentPerformance />
      <FinancialHealth />
    </div>
  );
}