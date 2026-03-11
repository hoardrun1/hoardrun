'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  Download, 
  PiggyBank, 
  TrendingUp, 
  CreditCard,
  Repeat,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export const QuickActions: React.FC = () => {
  const router = useRouter();

  const actions = [
    {
      icon: Send,
      label: 'Send Money',
      description: 'Transfer to anyone',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      onClick: () => router.push('/send-money'),
    },
    {
      icon: Download,
      label: 'Receive',
      description: 'Get paid easily',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      onClick: () => router.push('/receive-money'),
    },
    {
      icon: PiggyBank,
      label: 'Save',
      description: 'Create savings goal',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      onClick: () => router.push('/savings'),
    },
    {
      icon: TrendingUp,
      label: 'Invest',
      description: 'Grow your wealth',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      onClick: () => router.push('/investments'),
    },
    {
      icon: CreditCard,
      label: 'Cards',
      description: 'Manage cards',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-100',
      onClick: () => router.push('/cards'),
    },
    {
      icon: Repeat,
      label: 'Recurring',
      description: 'Auto payments',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      onClick: () => router.push('/recurring-payments'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common tasks at your fingertips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg ${action.bgColor} ${action.hoverColor} transition-all duration-200 hover:shadow-md group`}
              >
                <div className={`p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;

