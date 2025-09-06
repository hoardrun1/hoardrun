'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { navigation } from '@/lib/navigation';

export function FeatureNavigation() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(`/${path}`);
  };

  const features = [
    {
      title: 'Savings',
      description: 'Create personalized savings goals with AI-powered recommendations',
      icon: PiggyBank,
      color: 'bg-muted-foreground',
      path: 'savings'
    },
    {
      title: 'Investments',
      description: 'Grow your wealth with smart investment opportunities',
      icon: TrendingUp,
      color: 'bg-muted-foreground',
      path: 'investment'
    }
  ];

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full group cursor-pointer"
                  onClick={() => handleNavigate(feature.path)}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`${feature.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                    <feature.icon className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors duration-300">
                      {feature.description}
                    </p>
                    <div className="flex justify-end">
                      <Button variant="ghost" className="text-muted-foreground group-hover:text-foreground p-0 h-auto">
                        <span className="mr-1">Explore</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
