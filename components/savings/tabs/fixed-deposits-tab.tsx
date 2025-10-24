"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, DollarSign, Repeat } from "lucide-react"

interface FixedDepositsTabProps {
  deposits: any[]
  onNewDeposit: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const calculateFixedDepositInterest = (amount: number, term: number, rate = 4.5) => {
  const interest = (amount * rate * (term / 12)) / 100
  const maturityAmount = amount + interest
  return { interest, maturityAmount, rate }
}

export function FixedDepositsTab({ deposits, onNewDeposit }: FixedDepositsTabProps) {
  if (deposits.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <div className="rounded-full bg-muted p-3 sm:p-4 mb-3 sm:mb-4">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold mb-1">No Fixed Deposits Yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4 max-w-xs">
            Start earning guaranteed returns with fixed deposits
          </p>
          <Button onClick={onNewDeposit} size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
            <Shield className="h-3.5 w-3.5 mr-1" />
            Create FD
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
      {deposits.map((fd) => {
        const { interest, maturityAmount } = calculateFixedDepositInterest(fd.amount, fd.term, fd.interestRate)

        return (
          <Card key={fd.id} className="border-border/50 hover:shadow-sm transition-shadow overflow-hidden">
            <div className="h-1 bg-foreground/30" />
            <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1 flex-1 min-w-0">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                    FD #{fd.id.slice(-4)}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-muted text-xs font-medium mr-1">
                      {fd.term}mo
                    </span>
                    <span className="font-semibold">{fd.interestRate}% APY</span>
                  </CardDescription>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs sm:text-sm font-bold">{formatCurrency(fd.amount)}</div>
                  <div className="text-xs font-medium">{fd.status}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3 space-y-2 sm:space-y-3">
              <div className="grid grid-cols-2 gap-2 p-2 sm:p-3 rounded-lg bg-muted/50 border border-border/50 text-xs">
                <div>
                  <p className="text-muted-foreground mb-0.5">Maturity</p>
                  <p className="font-medium">
                    {fd.maturityDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Returns</p>
                  <p className="font-bold">{formatCurrency(maturityAmount)}</p>
                </div>
              </div>

              <div className="space-y-1">
                {fd.roundupEnabled && (
                  <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-lg bg-muted/50 border border-border/50 text-xs">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-medium">Roundup enabled</span>
                  </div>
                )}
                {fd.autoRenew && (
                  <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-lg bg-muted/50 border border-border/50 text-xs">
                    <Repeat className="h-3 w-3" />
                    <span className="font-medium">Auto-renewal enabled</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
