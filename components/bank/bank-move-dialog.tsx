"use client"

import { useEffect, useState } from "react"
import { Building2, Check, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useFinance } from "@/contexts/FinanceContext"
import { apiClient, type BankTransfer, type PlaidAccount } from "@/lib/api-client"

export type BankDirection = "deposit" | "withdrawal"

interface BankMoveDialogProps {
  direction: BankDirection | null
  accounts: PlaidAccount[]
  accountId?: string | null
  onOpenChange: (open: boolean) => void
  onDone?: (transfer: BankTransfer) => void
}

const MIN = 1
const MAX = 10000
const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
const bankName = (a: PlaidAccount) => `${a.institution_name || a.name}${a.mask ? ` •••• ${a.mask}` : ""}`

/** Add money from a linked bank, or withdraw cash to it, by ACH. Same sheet as Add money. */
export function BankMoveDialog({ direction, accounts, accountId, onOpenChange, onDone }: BankMoveDialogProps) {
  const finance = useFinance()
  const { toast } = useToast()
  const [chosen, setChosen] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [saving, setSaving] = useState(false)
  const [started, setStarted] = useState<BankTransfer | null>(null)

  useEffect(() => {
    if (direction) {
      setChosen(accountId ?? accounts[0]?.account_id ?? null)
      setAmount("")
      setStarted(null)
    }
    // Reset only when the sheet opens, not when balances refresh behind it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, accountId])

  if (!direction) return null
  const deposit = direction === "deposit"
  const cash = finance?.balance ?? 0
  const value = Number(amount) || 0
  const account = accounts.find((a) => a.account_id === chosen) ?? null
  const problem = !value
    ? null
    : value < MIN || value > MAX
      ? `Move between ${usd(MIN)} and ${usd(MAX)} at a time`
      : !deposit && value > cash
        ? `You have ${usd(cash)} in cash`
        : null

  const submit = async () => {
    if (!account || !value || problem || saving) return
    setSaving(true)
    const response = deposit
      ? await apiClient.depositFromBank(account.account_id, value)
      : await apiClient.withdrawToBank(account.account_id, value)
    setSaving(false)
    if (response.error || !response.data) {
      toast({ title: deposit ? "Couldn't start the transfer" : "Couldn't withdraw", description: response.error || "Please try again.", variant: "destructive" })
      return
    }
    setStarted(response.data)
    window.dispatchEvent(new Event("hoardrun:balance-changed"))
    finance?.refreshBalance()
    onDone?.(response.data)
  }

  return (
    <Dialog open={!!direction} onOpenChange={onOpenChange}>
      <DialogContent className="hr-topup max-h-[92dvh] overflow-y-auto sm:max-w-[440px]">
        {started ? (
          <div className="space-y-5 py-8 text-center">
            <div className="hr-sent-orb mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <Check className="h-8 w-8 text-[#065f46]" strokeWidth={2.6} />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="hr-card-title text-[22px]">{deposit ? "Transfer started" : "Withdrawal started"}</DialogTitle>
              <DialogDescription className="text-sm text-[#a1a1a6]">
                {deposit
                  ? `${usd(started.amount)} is on its way from ${started.account}. It's added to your cash when your bank sends it, usually in 1–3 business days.`
                  : `${usd(started.amount)} left your cash and is on its way to ${started.account}, usually in 1–3 business days.`}
              </DialogDescription>
            </div>
            <p className="text-xs text-[#8e8e93]">Reference {started.reference}</p>
            <button type="button" onClick={() => onOpenChange(false)} className="hr-topup-continue hr-focus">Done</button>
          </div>
        ) : (
          <>
            <DialogTitle className="hr-title !text-[28px]">{deposit ? "Add from bank" : "Withdraw to bank"}</DialogTitle>
            <DialogDescription className="text-[14px] text-[#a1a1a6]">
              {deposit ? "By ACH from your linked bank. No fee." : <>You have <span className="text-white">{usd(cash)}</span> in cash</>}
            </DialogDescription>

            <label htmlFor="bank-amount" className="hr-topup-amount mt-5" data-invalid={problem ? true : undefined}>
              <span className="hr-topup-currency">$</span>
              <input
                id="bank-amount"
                inputMode="decimal"
                autoComplete="off"
                value={amount}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^0-9.]/g, "")
                  if (/^\d*(\.\d{0,2})?$/.test(clean)) setAmount(clean)
                }}
                placeholder="0"
                aria-label="Amount in US dollars"
                className="hr-topup-input"
                style={{ width: `${Math.max(1, amount.length || 1) + 0.4}ch` }}
              />
              <span className="hr-topup-chip">USD</span>
            </label>
            <p className={`text-center text-[12.5px] ${problem ? "text-[#fb7185]" : "text-[#8e8e93]"}`}>
              {problem ?? (deposit ? "Usually arrives in 1–3 business days" : "Leaves your cash now, arrives in 1–3 business days")}
            </p>
            {!deposit && cash > 0 && (
              <div className="mt-1 flex justify-center">
                <button type="button" onClick={() => setAmount(String(Math.min(cash, MAX)))} className="hr-topup-preset hr-focus" data-active={value === Math.min(cash, MAX) || undefined}>
                  All
                </button>
              </div>
            )}

            <p className="mt-5 text-[13px] font-medium text-[#a1a1a6]">{deposit ? "From" : "To"}</p>
            <ul className="mt-2 space-y-1.5">
              {accounts.map((a) => (
                <li key={a.account_id}>
                  <button
                    type="button"
                    onClick={() => setChosen(a.account_id)}
                    className="hr-topup-option hr-focus"
                    data-selected={a.account_id === chosen || undefined}
                    aria-pressed={a.account_id === chosen}
                  >
                    <span className="hr-topup-method-icon" style={{ ['--tone' as string]: "52 211 153" }}>
                      <Building2 className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-[14px] font-medium text-white">{bankName(a)}</span>
                      <span className="block truncate text-[12px] text-[#8e8e93]">
                        {a.name}{a.balances?.available != null ? ` · ${usd(a.balances.available)} available` : ""}
                      </span>
                    </span>
                    {a.account_id === chosen && <Check className="h-4 w-4 text-[#5aa9ff]" strokeWidth={2.6} />}
                  </button>
                </li>
              ))}
            </ul>

            <button type="button" onClick={submit} disabled={!account || !value || !!problem || saving} className="hr-topup-continue hr-focus mt-5">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {deposit ? `Add ${value ? usd(value) : "money"}` : `Withdraw ${value ? usd(value) : "money"}`}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
