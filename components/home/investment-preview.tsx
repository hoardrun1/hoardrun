'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { navigation } from '@/lib/navigation';
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from "@/components/ui/use-toast";

export function InvestmentPreview() {
  const router = useRouter();
  const { toast } = useToast();
  const [investments, setInvestments] = useState<any[]>([]);
  const [recommendedInvestments, setRecommendedInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Replace with actual API call when investment endpoints are available
        // For now, we'll simulate an API call that returns empty data
        const response = await new Promise(resolve => 
          setTimeout(() => resolve({ data: [], success: true }), 500)
        );
        
        setInvestments([]);
        setRecommendedInvestments([]);
      } catch (err) {
        console.error('Error fetching investments:', err);
        setError('Failed to load investments');
        toast({
          title: "Error",
          description: "Failed to load investment data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [toast]);

  const handleNavigateToInvestments = () => {
    navigation.connect('home', 'investment');
    router.push('/investment');
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
        <CardTitle className="text-xl text-foreground">Investments</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground"
          onClick={handleNavigateToInvestments}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading investments...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : investments.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No investments yet</p>
              <Button onClick={handleNavigateToInvestments}>
                Start Investing
              </Button>
            </div>
          ) : (
            investments.map((investment: any, index: number) => (
              <motion.div
                key={investment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-secondary rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-foreground">{investment.name}</h3>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {investment.type}
                    </Badge>
                  </div>
                  <div className={`flex items-center ${investment.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {investment.positive ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    <span>{Math.abs(investment.change)}%</span>
                  </div>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {formatCurrency(investment.value)}
                </div>
              </motion.div>
            ))
          )}

          {!loading && !error && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Recommended for You</h3>
              {recommendedInvestments.length === 0 ? (
                <div className="bg-accent/30 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    Investment recommendations will appear here based on your profile and goals.
                  </p>
                </div>
              ) : (
                recommendedInvestments.map((investment: any, index: number) => (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                    className="bg-accent/30 border border-primary/20 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-foreground">{investment.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {investment.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {investment.risk} Risk
                          </span>
                        </div>
                      </div>
                      <div className="text-muted-foreground flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>{investment.expectedReturn}%</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={handleNavigateToInvestments}
                    >
                      Invest Now
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          )}

          <Button 
            variant="outline" 
            className="w-full mt-4 border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={handleNavigateToInvestments}
          >
            <Plus className="mr-2 h-4 w-4" />
            Explore More Investments
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
