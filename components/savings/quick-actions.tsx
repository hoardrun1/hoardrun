import { motion } from 'framer-motion'
import { 
  Zap,
  PiggyBank,
  ArrowUpRight,
  Repeat,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Activity {
  description: string;
  amount: string;
}

export function QuickActionsPanel({ onAction, recentActivities }: { 
  onAction: (id: string) => void;
  recentActivities?: Activity[];
}) {
  const quickActions = [
    {
      id: 'quick-save',
      icon: Zap,
      label: 'Quick Save',
      description: 'Instantly add to your savings',
      color: 'bg-blue-500'
    },
    {
      id: 'auto-save',
      icon: Repeat,
      label: 'Auto-Save',
      description: 'Set up recurring savings',
      color: 'bg-green-500'
    },
    {
      id: 'round-up',
      icon: PiggyBank,
      label: 'Round-Up',
      description: 'Save your spare change',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {quickActions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onAction(action.id)}
          >
            <div className={`absolute top-0 left-0 w-2 h-full ${action.color}`} />
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${action.color} bg-opacity-10`}>
                  <action.icon className={`h-6 w-6 ${action.color} text-opacity-100`} />
                </div>
                <div>
                  <h3 className="font-semibold">{action.label}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      <div className="md:col-span-3">
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <ScrollArea className="h-[100px]">
              {recentActivities?.map((activity: Activity, index: number) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{activity.description}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {activity.amount}
                  </span>
                </div>
              ))}
            </ScrollArea>
          </div>
        </Card>
      </div>
    </div>
  )
}
