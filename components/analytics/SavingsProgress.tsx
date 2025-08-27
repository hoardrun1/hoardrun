import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

interface SavingsProgressProps {
  goals?: SavingsGoal[];
}

export const SavingsProgress: React.FC<SavingsProgressProps> = ({ 
  goals = [
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 6500,
      deadline: '2024-12-31'
    },
    {
      id: '2', 
      name: 'Vacation',
      targetAmount: 5000,
      currentAmount: 2800,
      deadline: '2024-08-15'
    },
    {
      id: '3',
      name: 'New Car',
      targetAmount: 25000,
      currentAmount: 8500,
      deadline: '2025-06-30'
    }
  ]
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{goal.name}</h4>
                  <span className="text-sm text-gray-500">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
                
                <Progress value={progress} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                  </span>
                  <span className="font-medium text-gray-600">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                
                {remaining > 0 && (
                  <div className="text-xs text-gray-500">
                    ${remaining.toLocaleString()} remaining
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
