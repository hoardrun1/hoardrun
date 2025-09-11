'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, Target, Plus } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useRouter } from 'next/navigation';
import { navigation } from '@/lib/navigation';
import { apiClient } from '@/lib/api-client';

export function SavingsPreview() {
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSavingsGoals();
  }, []);

  const loadSavingsGoals = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSavings();
      setSavingsGoals(response.data || []);
    } catch (error) {
      console.error('Failed to load savings goals:', error);
      setSavingsGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToSavings = () => {
    // Connect the navigation flow
    navigation.connect('home', 'savings');

    // Use the dashboard route to avoid conflicts
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
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <CardTitle className="text-xl text-foreground">Savings Goals</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={handleNavigateToSavings}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : savingsGoals.length > 0 ? (
            savingsGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-secondary rounded-lg p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`${goal.color} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <goal.icon className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{goal.name}</h3>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{formatCurrency(goal.amount)}</span>
                  <span className="text-muted-foreground">{formatCurrency(goal.target)}</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
              </div>
            </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-sm font-medium text-foreground mb-2">No Savings Goals</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Start saving for your future by creating your first goal.
              </p>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full mt-4 border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
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
