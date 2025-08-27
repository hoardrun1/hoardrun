import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import 'react-circular-progressbar/dist/styles.css'
import { formatCurrency } from '@/lib/utils'
import {
  Target,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react'

interface SavingsAnalytics {
  overallProgress: number;
  monthlyGrowth: number;
  nextMilestone: number;
}

interface SavingsOverviewProps {
  analytics?: SavingsAnalytics;
  className?: string;
}

export function SavingsOverview({ analytics, className }: SavingsOverviewProps) {
  const stats = [
    {
      title: 'Total Progress',
      value: analytics?.overallProgress || 0,
      icon: Target,
      color: 'text-gray-500',
      format: (value: number) => `${value}%`
    },
    {
      title: 'Monthly Growth',
      value: analytics?.monthlyGrowth || 0,
      icon: TrendingUp,
      color: 'text-gray-500',
      format: (value: number) => `${value}%`
    },
    {
      title: 'Next Milestone',
      value: analytics?.nextMilestone || 0,
      icon: Calendar,
      color: 'text-gray-500',
      format: (value: number) => formatCurrency(value)
    }
  ]

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {stat.format(stat.value)}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-full bg-opacity-10 ${stat.color}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>

                {stat.title === 'Total Progress' && (
                  <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gray-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
