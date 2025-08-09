import { motion } from 'framer-motion'
import { Card } from './card'
import { Progress } from './progress'

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onContribute: (goalId: string) => void;
  onEdit: (goalId: string) => void;
  onDelete: (goalId: string) => void;
}

export const SavingsGoalCard = ({
  goal,
  onContribute,
  onEdit,
  onDelete,
}: SavingsGoalCardProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layoutId={`goal-${goal.id}`}
    >
      {/* ... card content ... */}
    </motion.div>
  )
}
