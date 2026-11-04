/**
 * Financial Health Page Component
 *
 * Shows the score, the five things behind it, and what to do next.
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface HealthScore {
  overall_score: number;
  spending_score: number;
  savings_score: number;
  budget_adherence_score: number;
  debt_management_score: number;
  emergency_fund_score: number;
  recommendations: string[];
}

const RADIUS = 86;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const levelFor = (score: number) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs attention';
};

export function FinancialHealthPage() {
  const [score, setScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    const response = await apiClient.getFinancialHealthScore();
    if (response.error || !response.data) {
      setError(true);
    } else {
      setScore(response.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const factors = score
    ? [
        { label: 'Spending', value: score.spending_score },
        { label: 'Savings', value: score.savings_score },
        { label: 'Budgets', value: score.budget_adherence_score },
        { label: 'Debt', value: score.debt_management_score },
        { label: 'Emergency fund', value: score.emergency_fund_score },
      ]
    : [];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="hr-title">Health Score</h1>
          <p className="mt-1 text-sm text-[#a1a1a6] sm:text-base">How your money looks today, and what to do next.</p>
        </div>
        <button onClick={load} disabled={loading} aria-label="Refresh score" className="hr-icon-btn hr-focus shrink-0">
          <RefreshCw className={`h-[18px] w-[18px] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {error ? (
        <div role="alert" className="hr-panel flex items-center justify-between gap-3 px-5 py-4 text-sm">
          <span>We couldn't load your score.</span>
          <button onClick={load} className="hr-focus shrink-0 font-medium underline underline-offset-4">Try again</button>
        </div>
      ) : !score ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="hr-skeleton h-[340px] rounded-[24px] lg:col-span-5" />
          <div className="hr-skeleton h-[340px] rounded-[24px] lg:col-span-7" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-12">
            <section className="hr-panel flex flex-col items-center justify-center p-6 lg:col-span-5">
              <div className="relative h-[220px] w-[220px]">
                <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" role="img" aria-label={`Score ${score.overall_score} out of 100`}>
                  <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r={RADIUS}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    initial={{ strokeDashoffset: CIRCUMFERENCE }}
                    animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - score.overall_score / 100) }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[64px] font-semibold leading-none tracking-tight tabular-nums">{score.overall_score}</span>
                  <span className="mt-2 text-sm text-[#a1a1a6]">out of 100</span>
                </div>
              </div>
              <p className="mt-4 text-lg font-semibold">{levelFor(score.overall_score)}</p>
              <p className="mt-1 text-center text-sm text-[#a1a1a6]">Based on the activity in your account so far.</p>
            </section>

            <section className="hr-panel p-5 sm:p-6 lg:col-span-7">
              <h2 className="text-lg font-semibold tracking-tight">What's behind it</h2>
              <ul className="mt-5 space-y-5">
                {factors.map((factor, index) => (
                  <li key={factor.label}>
                    <div className="mb-2 flex items-baseline justify-between text-sm">
                      <span>{factor.label}</span>
                      <span className="font-medium tabular-nums">{factor.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.value}%` }}
                        transition={{ duration: 0.8, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {score.recommendations.length > 0 && (
            <section className="hr-panel p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight">What to do next</h2>
              <ol className="mt-4 divide-y divide-white/10">
                {score.recommendations.map((recommendation, index) => (
                  <li key={recommendation} className="flex gap-4 py-3.5 text-sm leading-relaxed first:pt-0 last:pb-0">
                    <span className="w-4 shrink-0 font-medium tabular-nums text-[#a1a1a6]">{index + 1}</span>
                    {recommendation}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
    </div>
  );
}
