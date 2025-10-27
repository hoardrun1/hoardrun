import { useState, useEffect, useCallback } from 'react';
import { usePlaid } from '@/hooks/usePlaid';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
}

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

interface TransferQuote {
  quote_id: string;
  from_amount: number;
  to_amount: number;
  from_currency: string;
  to_currency: string;
  transfer_fee: number;
  exchange_fee: number;
  total_fees: number;
  total_cost: number;
  expires_at: string;
  transfer_type: string;
}

interface TransferResponse {
  success: boolean;
  message: string;
  data: {
    transfer: {
      transfer_id: string;
      status: string;
      source_amount: number;
      destination_amount: number;
      total_cost: number;
      created_at: string;
    };
  };
}

export function SendMoneyFlow() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Plaid integration - Get actual connected accounts
  const { 
    getAccounts: getPlaidAccounts, 
    getConnections,
    syncTransactions,
    isLoading: plaidLoading 
  } = usePlaid();

  // Beneficiaries
  const { 
    beneficiaries, 
    fetchBeneficiaries,
    isLoading: beneficiariesLoading 
  } = useBeneficiaries();

  // Transfer flow state
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<PlaidAccount | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [hasActiveConnections, setHasActiveConnections] = useState(false);

  // Load Plaid accounts on mount
  useEffect(() => {
    loadPlaidData();
    fetchBeneficiaries();
  }, []);

  const loadPlaidData = async () => {
    try {
      console.log('Loading Plaid data...');
      
      // Check for active Plaid connections
      const connectionsData = await getConnections();
      const activeConnections = connectionsData?.filter(c => c.status === 'active') || [];
      setHasActiveConnections(activeConnections.length > 0);

      if (activeConnections.length === 0) {
        console.log('No active Plaid connections found');
        setPlaidAccounts([]);
        return;
      }

      // Get all Plaid accounts from active connections
      const accountsData = await getPlaidAccounts();
      
      if (accountsData && accountsData.length > 0) {
        console.log(`Loaded ${accountsData.length} Plaid accounts:`, accountsData);
        setPlaidAccounts(accountsData);
        
        // Sync latest transactions in background
        syncTransactions().catch(err => 
          console.warn('Failed to sync transactions:', err)
        );
      } else {
        console.log('No Plaid accounts found');
        setPlaidAccounts([]);
      }
    } catch (error) {
      console.error('Failed to load Plaid data:', error);
      toast({
        title: 'Warning',
        description: 'Unable to load connected bank accounts',
        variant: 'default',
      });
    }
  };

  // Handle beneficiary selection
  const handleBeneficiarySelection = useCallback(async (beneficiary: Beneficiary) => {
    console.log('Beneficiary selected:', beneficiary);
    setSelectedBeneficiary(beneficiary);
  }, []);

  // Handle Plaid account selection
  const handleAccountSelection = useCallback(async (account: PlaidAccount) => {
    console.log('Account selected:', account);
    
    // Verify account has sufficient balance
    const availableBalance = account.balances.available ?? account.balances.current;
    if (availableBalance <= 0) {
      toast({
        title: 'Insufficient Funds',
        description: 'This account has insufficient funds',
        variant: 'destructive',
      });
      return;
    }

    setSelectedAccount(account);
  }, [toast]);

  // Get transfer quote from backend
  const handleAmountConfirmation = useCallback(async (transferAmount: number, desc: string = '') => {
    if (!selectedBeneficiary || !selectedAccount) {
      toast({
        title: 'Error',
        description: 'Please select a beneficiary and account',
        variant: 'destructive',
      });
      return;
    }

    if (transferAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    const availableBalance = selectedAccount.balances.available ?? selectedAccount.balances.current;
    if (transferAmount > availableBalance) {
      toast({
        title: 'Insufficient Funds',
        description: `Available balance: $${availableBalance.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Creating transfer quote with Plaid account:', {
        account_id: selectedAccount.account_id,
        beneficiary_id: selectedBeneficiary.id,
        amount: transferAmount
      });

      // Create transfer quote using Plaid account
      const response = await apiClient.request('/plaid/transfers/quote', {
        method: 'POST',
        body: JSON.stringify({
          source_account_id: selectedAccount.account_id,
          beneficiary_id: selectedBeneficiary.id,
          amount: transferAmount,
          currency: selectedAccount.balances.iso_currency_code || 'USD'
        })
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const quoteData = response.data?.data?.quote || response.data?.quote;
      if (!quoteData) {
        throw new Error('Failed to get transfer quote');
      }

      console.log('Quote received:', quoteData);
      setQuote(quoteData);
      setAmount(transferAmount);
      setDescription(desc);

      toast({
        title: 'Quote Generated',
        description: `Total cost: $${quoteData.total_cost.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Quote failed:', error);
      toast({
        title: 'Quote Failed',
        description: error instanceof Error ? error.message : 'Failed to generate quote',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedBeneficiary, selectedAccount, toast]);

  // Execute the transfer
  const handleTransferConfirmation = useCallback(async (purpose: string, reference?: string) => {
    if (!quote || !selectedBeneficiary || !selectedAccount) {
      toast({
        title: 'Error',
        description: 'Missing required transfer information',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Initiating Plaid transfer:', {
        quote_id: quote.quote_id,
        purpose,
        reference
      });

      // Initiate Plaid transfer
      const response = await apiClient.request('/plaid/transfers/initiate', {
        method: 'POST',
        body: JSON.stringify({
          quote_id: quote.quote_id,
          purpose: purpose || description || `Transfer to ${selectedBeneficiary.name}`,
          reference: reference,
          recipient_message: description
        })
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const transferData = response.data?.data?.transfer || response.data?.transfer;
      if (!transferData) {
        throw new Error('Transfer failed - no transfer data returned');
      }

      console.log('Transfer successful:', transferData);

      toast({
        title: 'Transfer Initiated',
        description: `Transfer of $${amount.toFixed(2)} initiated successfully`,
      });

      // Refresh accounts after transfer
      await loadPlaidData();

      return {
        success: true,
        transferId: transferData.transfer_id,
        ...transferData
      };
    } catch (error) {
      console.error('Transfer failed:', error);
      toast({
        title: 'Transfer Failed',
        description: error instanceof Error ? error.message : 'Failed to complete transfer',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [quote, selectedBeneficiary, selectedAccount, amount, description, toast]);

  // Get available Plaid accounts
  const getAvailableAccounts = useCallback(() => {
    return plaidAccounts;
  }, [plaidAccounts]);

  // Get available beneficiaries
  const getAvailableBeneficiaries = useCallback(() => {
    return beneficiaries || [];
  }, [beneficiaries]);

  // Refresh Plaid connection
  const refreshConnection = useCallback(async () => {
    await loadPlaidData();
  }, []);

  return {
    // Handlers
    handleBeneficiarySelection,
    handleAccountSelection,
    handleAmountConfirmation,
    handleTransferConfirmation,
    
    // Data getters
    getAvailableAccounts,
    getAvailableBeneficiaries,
    refreshConnection,
    
    // State
    selectedBeneficiary,
    selectedAccount,
    amount,
    quote,
    isProcessing,
    hasActiveConnections,
    
    // Loading states
    isLoading: plaidLoading || beneficiariesLoading,
    
    // Account info
    plaidAccounts,
    beneficiaries
  };
}