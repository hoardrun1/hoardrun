import { useState, useEffect } from 'react';
import { SpendingAnalytics } from './SpendingAnalytics';
import { SavingsProgress } from './SavingsProgress';
import { InvestmentPerformance } from './InvestmentPerformance';
import { FinancialHealth } from './FinancialHealth';
import { apiClient } from '@/lib/api-client';

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
      try {
        // Use the correct analytics methods from the API client
        const [cashFlowResponse, healthResponse] = await Promise.all([
          apiClient.getCashFlowAnalysis({
            period: 'monthly'
          }),
          apiClient.getFinancialHealthScore()
        ]);
        
        if (cashFlowResponse.data || healthResponse.data) {
          setAnalytics({
            totalBalance: cashFlowResponse.data?.total_balance || 0,
            monthlyIncome: cashFlowResponse.data?.total_income || 0,
            monthlyExpenses: cashFlowResponse.data?.total_expenses || 0,
            savingsRate: cashFlowResponse.data?.savings_rate || 0,
            investmentValue: healthResponse.data?.investment_value || 0,
            investmentGrowth: healthResponse.data?.investment_growth || 0,
            creditScore: healthResponse.data?.credit_score || 0,
            debtToIncomeRatio: healthResponse.data?.debt_to_income_ratio || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Keep default values on error
      }
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
