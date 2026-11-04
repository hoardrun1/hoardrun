"use client"

interface PageHeaderProps {
  onNewGoal: () => void
  onFixedDeposit: () => void
  onAutoSave: () => void
}

// The actions live on the savings hero below, next to the balance they change
export function PageHeader(_: PageHeaderProps) {
  return (
    <div>
      <h1 className="hr-title">Savings</h1>
      <p className="hr-sub mt-2">Goals, fixed deposits and automatic saving, all in one place.</p>
    </div>
  )
}
