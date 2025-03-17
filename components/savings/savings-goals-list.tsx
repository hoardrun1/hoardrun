import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight,
  Clock,
  Target,
  Repeat
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function SavingsGoalsList({
  goals,
  isLoading,
  error,
  onGoalSelect,
  onGoalDelete,
  onGoalUpdate
}: {
  goals: Array<{
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    progress: number;
    deadline: Date;
    isAutoSave?: boolean;
  }>;
  isLoading: boolean;
  error: string | null;
  onGoalSelect: (goal: any) => void;
  onGoalDelete: (id: string) => void;
  onGoalUpdate: (goal: any) => void;
}) {
  if (isLoading) {
    return <div>Loading goals...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Target className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{goal.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onGoalSelect(goal)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onGoalDelete(goal.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4">
                  <Progress value={goal.progress} className="h-2" />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(goal.deadline)}
                    </div>
                    <span>{goal.progress}% Complete</span>
                  </div>
                </div>

                {goal.isAutoSave && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <Repeat className="h-4 w-4 mr-1" />
                    Auto-save enabled
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
