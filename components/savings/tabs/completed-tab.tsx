import { GemGraphic } from "@/components/app/home-graphics"
import { SavingsEmpty } from "@/components/savings/savings-empty"
import { GoalsTab } from "./goals-tab"

/** Goals that reached their target, with the same cards as active goals. */
export function CompletedTab({ goals = [], onAddMoney, onEdit }: { goals?: any[]; onAddMoney?: (goal: any) => void; onEdit?: (goal: any) => void }) {
  if (goals.length === 0) {
    return (
      <SavingsEmpty
        graphic={<GemGraphic tone="amber" className="h-full w-full" />}
        title="No completed goals"
        text="Goals you finish show up here, with what you saved."
      />
    )
  }
  return <GoalsTab goals={goals} onNewGoal={() => {}} onAddMoney={onAddMoney} onEdit={onEdit} />
}
