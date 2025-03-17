import { useState, useEffect } from 'react';
import { SpendingAnalytics } from './SpendingAnalytics';
import { SavingsProgress } from './SavingsProgress';
import { InvestmentPerformance } from './InvestmentPerformance';
import { FinancialHealth } from './FinancialHealth';
import { AnalyticsService } from '@/services/core';

export function FinancialDashboard() {
  const [analytics, setAnalytics] = useState({
    spending: {},
    savings: {},
    investments: {},
    health: {}
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
      <SpendingAnalytics data={analytics.spending} />
      <SavingsProgress data={analytics.savings} />
      <InvestmentPerformance data={analytics.investments} />
      <FinancialHealth data={analytics.health} />
    </div>
  );
}