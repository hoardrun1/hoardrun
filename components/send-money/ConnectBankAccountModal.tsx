import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PlaidLink } from '@/components/plaid/PlaidLink'
import { Building2, X } from 'lucide-react'

interface ConnectBankAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (publicToken: string, metadata: any) => void
}

export function ConnectBankAccountModal({ open, onOpenChange, onSuccess }: ConnectBankAccountModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Connect Bank Account
          </DialogTitle>
          <DialogDescription>
            Securely connect your bank account to send and receive money. Your financial data is protected with bank-level security.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Secure Bank Connection</h3>
              <p className="text-sm text-muted-foreground">
                Connect your bank account to enable instant transfers and view your account balances.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Bank-level security encryption</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Read-only access to your accounts</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Instant transfers between accounts</span>
            </div>
          </div>

          <PlaidLink
            onSuccess={(publicToken, metadata) => {
              onSuccess?.(publicToken, metadata)
              onOpenChange(false)
            }}
            className="w-full h-12"
          >
            <div className="flex items-center justify-center gap-2">
              <Building2 className="h-4 w-4" />
              Connect Bank Account
            </div>
          </PlaidLink>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
