'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, Target, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Sample savings goals for showcase
const sampleGoals = [
  {
    name: 'Emergency Fund',
    description: 'Build a safety net for unexpected expenses',
    icon: PiggyBank,
    color: 'bg-blue-500',
    progress: 75,
  },
  {
    name: 'Dream Vacation',
    description: 'Save for that perfect getaway',
    icon: Target,
    color: 'bg-purple-500',
    progress: 45,
  },
  {
    name: 'New Car',
    description: 'Save up for your next vehicle purchase',
    icon: Clock,
    color: 'bg-green-500',
    progress: 30,
  },
];

// Sample savings tips
const savingsTips = [
  {
    title: '50/30/20 Rule',
    description: 'Allocate 50% for needs, 30% for wants, and 20% for savings.',
    icon: PiggyBank,
  },
  {
    title: 'Automate Savings',
    description: 'Set up automatic transfers to your savings account.',
    icon: Clock,
  },
  {
    title: 'Set Clear Goals',
    description: 'Define specific savings goals with deadlines.',
    icon: Target,
  },
  {
    title: 'Track Progress',
    description: 'Regularly monitor your savings progress.',
    icon: TrendingUp,
  },
];

export function SavingsShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              Smart Savings Solutions
            </span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Create personalized savings goals with AI-powered recommendations to help you reach your financial targets faster.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {sampleGoals.map((goal, index) => (
            <motion.div
              key={goal.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className={`${goal.color} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                    <goal.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{goal.name}</h3>
                  <p className="text-gray-300 mb-4">{goal.description}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                    <div 
                      className={`${goal.color} h-2.5 rounded-full`} 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 mb-12">
          <h3 className="text-xl font-semibold mb-4 text-center">Savings Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {savingsTips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                <div className="bg-blue-500/20 p-3 rounded-full mb-3">
                  <tip.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="font-medium mb-1">{tip.title}</h4>
                <p className="text-sm text-gray-400">{tip.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Link href="/signup">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg">
              Start Saving Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
