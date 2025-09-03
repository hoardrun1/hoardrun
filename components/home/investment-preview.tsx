'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { navigation } from '@/lib/navigation';
import { Badge } from "@/components/ui/badge";

// Sample investments for preview
const sampleInvestments = [
  {
    id: '1',
    name: 'Tech Growth Fund',
    type: 'ETF',
    value: 3500,
    change: 5.2,
    positive: true,
  },
  {
    id: '2',
    name: 'Sustainable Energy',
    type: 'STOCK', // Fixed to match Prisma InvestmentType enum
    value: 2800,
    change: -1.8,
    positive: false,
  },
];

// Sample recommended investments
const recommendedInvestments = [
  {
    id: '1',
    name: 'Global Index Fund',
    type: 'ETF',
    risk: 'Moderate',
    expectedReturn: 7.5,
  },
];

export function InvestmentPreview() {
  const router = useRouter();

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
    <Card className="bg-gray-800 border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <CardTitle className="text-xl text-white">Investments</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-gray-300"
          onClick={handleNavigateToInvestments}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-4">
          {sampleInvestments.map((investment, index) => (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-white">{investment.name}</h3>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {investment.type}
                  </Badge>
                </div>
                <div className={`flex items-center ${investment.positive ? 'text-gray-400' : 'text-gray-400'}`}>
                  {investment.positive ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  <span>{Math.abs(investment.change)}%</span>
                </div>
              </div>
              <div className="text-lg font-semibold text-white">
                {formatCurrency(investment.value)}
              </div>
            </motion.div>
          ))}

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Recommended for You</h3>
            {recommendedInvestments.map((investment, index) => (
              <motion.div
                key={investment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                className="bg-gray-900/30 border border-blue-800/50 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-white">{investment.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {investment.type}
                      </Badge>
                      <span className="text-xs text-gray-300">
                        {investment.risk} Risk
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-400 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>{investment.expectedReturn}%</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="mt-2 w-full bg-gray-600 hover:bg-gray-700"
                  onClick={handleNavigateToInvestments}
                >
                  Invest Now
                </Button>
              </motion.div>
            ))}
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4 border-dashed border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
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
