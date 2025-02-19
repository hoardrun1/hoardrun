'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SavingsGoalTemplate, SavingsCategory, SAVINGS_CATEGORIES } from '@/types/savings'
import { ArrowRight, Lightbulb, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Predefined templates for different savings goals
const SAVINGS_TEMPLATES: SavingsGoalTemplate[] = [
  {
    category: 'EMERGENCY_FUND',
    name: '6-Month Emergency Fund',
    suggestedAmount: 15000,
    recommendedDuration: 24,
    description: 'Build a safety net for unexpected expenses',
    tips: [
      'Start with small, regular contributions',
      'Keep funds easily accessible',
      'Aim for 6 months of living expenses'
    ],
    riskLevel: 'LOW',
    autoSaveRecommended: true,
    minimumContribution: 500
  },
  {
    category: 'RETIREMENT',
    name: 'Early Retirement Fund',
    suggestedAmount: 500000,
    recommendedDuration: 360,
    description: 'Secure your financial future with long-term savings',
    tips: [
      'Start saving early for compound growth',
      'Consider tax-advantaged accounts',
      'Diversify your retirement portfolio'
    ],
    riskLevel: 'MODERATE',
    autoSaveRecommended: true,
    minimumContribution: 1000
  },
  {
    category: 'HOME',
    name: 'Home Down Payment',
    suggestedAmount: 50000,
    recommendedDuration: 60,
    description: 'Save for your dream home down payment',
    tips: [
      'Research local housing markets',
      'Consider additional costs like closing fees',
      'Maintain good credit score'
    ],
    riskLevel: 'LOW',
    autoSaveRecommended: true,
    minimumContribution: 800
  },
  {
    category: 'EDUCATION',
    name: 'Education Fund',
    suggestedAmount: 25000,
    recommendedDuration: 48,
    description: 'Invest in your future through education',
    tips: [
      'Research education costs and programs',
      'Consider scholarships and grants',
      'Plan for additional expenses'
    ],
    riskLevel: 'LOW',
    autoSaveRecommended: true,
    minimumContribution: 400
  },
  {
    category: 'BUSINESS',
    name: 'Business Startup',
    suggestedAmount: 75000,
    recommendedDuration: 36,
    description: 'Fund your entrepreneurial journey',
    tips: [
      'Create a detailed business plan',
      'Research market opportunities',
      'Consider additional funding sources'
    ],
    riskLevel: 'HIGH',
    autoSaveRecommended: false,
    minimumContribution: 1500
  },
  {
    category: 'TRAVEL',
    name: 'Dream Vacation',
    suggestedAmount: 10000,
    recommendedDuration: 12,
    description: 'Save for your perfect getaway',
    tips: [
      'Research destination costs',
      'Plan for peak vs. off-season travel',
      'Include emergency travel funds'
    ],
    riskLevel: 'LOW',
    autoSaveRecommended: true,
    minimumContribution: 300
  }
]

interface SavingsTemplatesProps {
  onSelectTemplate: (template: SavingsGoalTemplate) => void
  selectedCategory?: SavingsCategory
}

export function SavingsTemplates({ onSelectTemplate, selectedCategory }: SavingsTemplatesProps) {
  const filteredTemplates = selectedCategory
    ? SAVINGS_TEMPLATES.filter(template => template.category === selectedCategory)
    : SAVINGS_TEMPLATES

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Recommended Savings Templates</h2>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {filteredTemplates.map((template) => (
          <motion.div key={`${template.category}-${template.name}`} variants={itemVariants}>
            <Card className="cursor-pointer hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {SAVINGS_CATEGORIES[template.category].icon}
                    </span>
                    <CardTitle>{template.name}</CardTitle>
                  </div>
                  <Badge variant={
                    template.riskLevel === 'LOW' ? 'secondary' :
                    template.riskLevel === 'MODERATE' ? 'default' :
                    'destructive'
                  }>
                    {template.riskLevel}
                  </Badge>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Suggested Amount:</span>
                      <span className="font-medium">
                        ${template.suggestedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {template.recommendedDuration} months
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Contribution:</span>
                      <span className="font-medium">
                        ${template.minimumContribution.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Tips:</div>
                    <ul className="text-sm space-y-1">
                      {template.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <Target className="w-4 h-4 mr-2 mt-0.5 text-primary" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => onSelectTemplate(template)}
                  >
                    Use Template
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
} 