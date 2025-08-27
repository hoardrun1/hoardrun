import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  Plus,
  Download,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface SavingsHeaderProps {
  totalSavings: number;
  monthlyGrowth: number;
  onNewGoal: () => void;
}

export function SavingsHeader({ 
  totalSavings, 
  monthlyGrowth, 
  onNewGoal 
}: SavingsHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Savings Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-2xl font-bold">
                  {formatCurrency(totalSavings)}
                </span>
                <div className="ml-3 flex items-center">
                  {monthlyGrowth >= 0 ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center text-gray-600"
                    >
                      <TrendingUp className="h-5 w-5 mr-1" />
                      <span>+{monthlyGrowth}%</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center text-gray-600"
                    >
                      <TrendingDown className="h-5 w-5 mr-1" />
                      <span>{monthlyGrowth}%</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={onNewGoal}>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
