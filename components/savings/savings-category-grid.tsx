'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SAVINGS_CATEGORIES, SavingsCategory } from '@/types/savings'
import { Plus } from 'lucide-react'

interface SavingsCategoryGridProps {
  onSelectCategory: (category: SavingsCategory) => void
  selectedCategory?: SavingsCategory
}

export function SavingsCategoryGrid({ onSelectCategory, selectedCategory }: SavingsCategoryGridProps) {
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {Object.entries(SAVINGS_CATEGORIES).map(([key, category]) => (
        <motion.div key={key} variants={itemVariants}>
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCategory === key ? 'border-primary ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectCategory(key as SavingsCategory)}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">{category.icon}</span>
                <span>{category.label}</span>
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Recommended:</span>
                  <span>{category.recommendedPercentage}% of savings</span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum:</span>
                  <span>${category.minimumAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{category.suggestedDuration} months</span>
                </div>
                <Button 
                  className="w-full mt-4"
                  variant={selectedCategory === key ? "default" : "outline"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
} 