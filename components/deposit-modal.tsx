import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import { useFinance } from '@/contexts/FinanceContext'

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [amount, setAmount] = useState('')
  const { updateBalance, isLoading } = useFinance()

  const handleDeposit = async () => {
    try {
      await updateBalance(Number(amount))
      onOpenChange(false)
      setAmount('')
    } catch (error) {
      console.error('Deposit failed:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make a Deposit</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleDeposit}
            disabled={isLoading || !amount || Number(amount) <= 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Deposit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 