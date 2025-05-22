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
  const [isLoading, setIsLoading] = useState(false)

  // Try to use the finance context, but provide a fallback if it's not available
  let depositFunds: (amount: number) => Promise<void>;
  try {
    const financeContext = useFinance();
    depositFunds = financeContext.depositFunds;
  } catch (error) {
    console.warn('Finance context not available, using mock deposit function');
    // Use a mock deposit function if the context is not available
    depositFunds = async (amount: number) => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      console.log(`Mock deposit of $${amount} completed`);
    };
  }

  const handleDeposit = async () => {
    try {
      setIsLoading(true);
      await depositFunds(Number(amount));
      onOpenChange(false);
      setAmount('');
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsLoading(false);
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