import { useState, useEffect } from 'react';
import { usePlaid } from '@/hooks/usePlaid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Loader2,
  AlertCircle,
  Building2,
  Check,
  ArrowLeft,
  Plus,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/lib/banking';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { PlaidLink } from '@/components/plaid/PlaidLink';

interface PlaidAccount {
  id: string;
  account_id: string;
  connection_id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  official_name?: string;
  balances: {
    available?: number;
    current: number;
    limit?: number;
    iso_currency_code?: string;
  };
}

interface AccountSelectionStepProps {
  onAccountSelect: (account: PlaidAccount) => void;
  onBack?: () => void;
  selectedBeneficiary?: {
    id: string;
    name: string;
    accountNumber: string;
    bankName: string;
  };
}

export function AccountSelectionStep({
  onAccountSelect,
  onBack,
  selectedBeneficiary
}: AccountSelectionStepProps) {
  const { toast } = useToast();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use Plaid hook to get real connected accounts
  const {
    getAccounts,
    getConnections,
    syncTransactions,
    isLoading,
    error
  } = usePlaid();

  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasConnections, setHasConnections] = useState(false);

  // Load Plaid accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      console.log('Loading Plaid accounts...');
      
      // Check for active connections first
      const connections = await getConnections();
      const activeConnections = connections?.filter(c => c.status === 'active') || [];
      setHasConnections(activeConnections.length > 0);

      if (activeConnections.length === 0) {
        console.log('No active Plaid connections');
        setPlaidAccounts([]);
        return;
      }

      // Get all accounts from Plaid
      const accounts = await getAccounts();
      
      if (accounts && Array.isArray(accounts)) {
        console.log(`Loaded ${accounts.length} Plaid accounts`);
        setPlaidAccounts(accounts);
      } else {
        console.log('No accounts returned or invalid format');
        setPlaidAccounts([]);
      }
    } catch (err) {
      console.error('Failed to load Plaid accounts:', err);
      toast({
        title: 'Error',
        description: 'Failed to load connected bank accounts',
        variant: 'destructive',
      });
    }
  };

  // Handle account refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Sync latest data from Plaid
      await syncTransactions();
      await loadAccounts();
      toast({
        title: 'Refreshed',
        description: 'Account balances updated',
      });
    } catch (err) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh account data',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle account selection
  const handleAccountSelect = async (account: PlaidAccount) => {
    setSelectedAccountId(account.account_id);
    setIsProcessing(true);

    try {
      // Validate account has sufficient balance
      const availableBalance = account.balances.available ?? account.balances.current;
      if (availableBalance <= 0) {
        toast({
          title: 'Insufficient Funds',
          description: 'This account has no available balance',
          variant: 'destructive',
        });
        setSelectedAccountId(null);
        return;
      }

      console.log('Account selected:', account);
      await onAccountSelect(account);
    } catch (error) {
      console.error('Account selection failed:', error);
      toast({
        title: 'Selection Failed',
        description: 'Failed to select account. Please try again.',
        variant: 'destructive',
      });
      setSelectedAccountId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Plaid connection success
  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    console.log('Plaid connection successful');
    toast({
      title: 'Bank Connected',
      description: 'Loading your accounts...',
    });
    
    // Wait a moment for backend to process
    setTimeout(async () => {
      await loadAccounts();
    }, 2000);
  };

  // Loading skeleton
  if (isLoading && plaidAccounts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Select Account</h2>
            <p className="text-muted-foreground">
              Choose the account to send money from
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Select Account</h2>
            <p className="text-muted-foreground">
              Choose the account to send money from
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Failed to load accounts. Please try again.'}
          </AlertDescription>
        </Alert>

        <Button onClick={loadAccounts} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Select Account</h2>
            <p className="text-muted-foreground">
              Choose your connected bank account
            </p>
            {selectedBeneficiary && (
              <p className="text-sm text-muted-foreground mt-1">
                Sending to: {selectedBeneficiary.name}
              </p>
            )}
          </div>
        </div>
        
        {/* Refresh button */}
        {plaidAccounts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        )}
      </div>

      {/* No accounts / Connect Plaid */}
      {!hasConnections || plaidAccounts.length === 0 ? (
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {!hasConnections ? 'Connect Your Bank' : 'No Accounts Found'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {!hasConnections 
              ? 'Connect your bank account securely with Plaid to send money.'
              : 'No accounts found in your connected banks. Try reconnecting.'}
          </p>
          
          <PlaidLink
            onSuccess={handlePlaidSuccess}
            className="w-full"
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Connect Bank Account
            </div>
          </PlaidLink>

          {hasConnections && (
            <Button
              variant="outline"
              onClick={loadAccounts}
              className="w-full mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Accounts
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* Plaid Accounts List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Connected Bank Accounts ({plaidAccounts.length})
            </h3>
            <div className="space-y-2">
              {plaidAccounts.map((account) => {
                const isSelected = selectedAccountId === account.account_id;
                const balance = account.balances.available ?? account.balances.current;
                const currency = account.balances.iso_currency_code || 'USD';

                return (
                  <Card
                    key={account.account_id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      isSelected && "ring-2 ring-primary",
                      isProcessing && "opacity-50 pointer-events-none",
                      balance <= 0 && "opacity-60"
                    )}
                    onClick={() => balance > 0 && !isProcessing && handleAccountSelect(account)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {account.official_name || account.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ••••{account.mask} • {account.subtype || account.type}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(balance, currency)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Available
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-primary mt-1 ml-auto" />
                          )}
                        </div>
                      </div>
                      
                      {balance <= 0 && (
                        <div className="mt-2 text-xs text-destructive">
                          Insufficient funds
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Add another account */}
          <div className="pt-4 border-t">
            <PlaidLink
              onSuccess={handlePlaidSuccess}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                Connect Another Bank
              </div>
            </PlaidLink>
          </div>
        </>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Processing selection...</span>
        </div>
      )}
    </div>
  );
}