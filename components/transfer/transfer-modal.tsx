'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Calendar, Send } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { useFinance } from '@/contexts/FinanceContext'
import { apiClient, Beneficiary } from '@/lib/api-client'

interface TransferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  beneficiary: Beneficiary
  onSuccess?: () => void
}

export function TransferModal({
  open,
  onOpenChange,
  beneficiary,
  onSuccess,
}: TransferModalProps) {
  const { balance } = useFinance()
  const { toast } = useToast()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fee, setFee] = useState<{
    fee: number
    total: number
    breakdown: {
      base: number
      tax?: number
      extra?: number
    }
  } | null>(null)

  // Calculate fee when amount changes
  useEffect(() => {
    const calculateFee = async () => {
      try {
        const numericAmount = parseFloat(amount)
        if (!isNaN(numericAmount) && numericAmount > 0) {
          const response = await apiClient.calculateTransferFee(numericAmount)
          if (response.data) {
            setFee(response.data)
          } else {
            setFee(null)
          }
        } else {
          setFee(null)
        }
      } catch (error) {
        console.error('Fee calculation error:', error)
        setFee(null)
      }
    }

    calculateFee()
  }, [amount])

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const numericAmount = parseFloat(amount)
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Please enter a valid amount')
      }

      if (numericAmount > balance) {
        throw new Error('Insufficient balance')
      }

      if (fee && numericAmount + fee.fee > balance) {
        throw new Error('Insufficient balance to cover transfer fee')
      }

      const response = await apiClient.sendMoney({
        beneficiary_id: beneficiary.id,
        amount: numericAmount,
        description: description || undefined,
        category: category || undefined,
      })

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Transfer Successful",
        description: `Successfully sent $${numericAmount.toLocaleString()} to ${beneficiary.name}`,
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Transfer error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send money')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
          <DialogDescription>
            Send money to {beneficiary.name}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
            {fee && (
              <div className="text-sm text-gray-500">
                Fee: ${fee.fee.toLocaleString()}
                <br />
                Total: ${fee.total.toLocaleString()}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>

          <div className="grid gap-2">
            <Label>Category (Optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BILLS">Bills</SelectItem>
                <SelectItem value="RENT">Rent</SelectItem>
                <SelectItem value="SHOPPING">Shopping</SelectItem>
                <SelectItem value="FOOD">Food</SelectItem>
                <SelectItem value="TRANSPORT">Transport</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="scheduled">Schedule Transfer</Label>
              <Switch
                id="scheduled"
                checked={isScheduled}
                onCheckedChange={setIsScheduled}
              />
            </div>
            {isScheduled && (
              <div className="space-y-4 mt-2">
                <div className="grid gap-2">
                  <Label>Transfer Date</Label>
                  <DatePicker
                    date={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date()}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="recurring">Recurring Transfer</Label>
                    <Switch
                      id="recurring"
                      checked={isRecurring}
                      onCheckedChange={setIsRecurring}
                    />
                  </div>
                  {isRecurring && (
                    <Select value={recurringFrequency} onValueChange={(value: any) => setRecurringFrequency(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Money
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
