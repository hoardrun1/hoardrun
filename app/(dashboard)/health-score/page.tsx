/**
 * Financial Health Score Page Route
 * 
 * Main route for the Financial Health Score feature.
 */

import { FinancialHealthPage } from '@/components/financial-health';

export const metadata = {
  title: 'Financial Health Score | HoardRun',
  description: 'Comprehensive analysis of your financial well-being with personalized recommendations',
};

export default function HealthScorePage() {
  return <FinancialHealthPage />;
}

