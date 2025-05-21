'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, Target, Clock, Plus } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useRouter } from 'next/navigation';
import { navigation } from '@/lib/navigation';

// Sample savings goals for preview
const sampleGoals = [
  {
    id: '1',
    name: 'Emergency Fund',
    description: 'For unexpected expenses',
    icon: PiggyBank,
    color: 'bg-blue-500',
    progress: 75,
    amount: 7500,
    target: 10000,
  },
  {
    id: '2',
    name: 'Vacation',
    description: 'Summer trip to Europe',
    icon: Target,
    color: 'bg-purple-500',
    progress: 45,
    amount: 2250,
    target: 5000,
  },
];

export function SavingsPreview() {
  const router = useRouter();

  const handleNavigateToSavings = () => {
    navigation.connect('home', 'savings');
    router.push('/savings');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="bg-gray-800 border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <CardTitle className="text-xl text-white">Savings Goals</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-400 hover:text-blue-300"
          onClick={handleNavigateToSavings}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-4">
          {sampleGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`${goal.color} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <goal.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{goal.name}</h3>
                  <p className="text-sm text-gray-300">{goal.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{formatCurrency(goal.amount)}</span>
                  <span className="text-gray-300">{formatCurrency(goal.target)}</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
              </div>
            </motion.div>
          ))}
          <Button 
            variant="outline" 
            className="w-full mt-4 border-dashed border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={handleNavigateToSavings}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Goal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
