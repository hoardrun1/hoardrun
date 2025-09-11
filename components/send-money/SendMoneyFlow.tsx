import { useFinanceNavigation } from '@/hooks/useFinanceNavigation';
// TODO: Replace with Python backend API call

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  transactionCount?: number;
}

export function SendMoneyFlow() {
  const { navigateTo, getCurrentPageData } = useFinanceNavigation();

  const handleBeneficiarySelection = async (beneficiary: Beneficiary) => {
    await navigateTo('amount-entry', { beneficiary });
  };

  const handleAmountConfirmation = async (amount: number) => {
    const beneficiary = getCurrentPageData('amount-entry').beneficiary;
    await navigateTo('transfer-confirmation', {
      beneficiary,
      amount,
      date: new Date()
    });
  };

  const handleTransferConfirmation = async () => {
    const transferData = getCurrentPageData('transfer-confirmation');
    try {
      // TODO: Replace with Python backend API call for transfer processing
      console.log('Transfer data:', transferData);
      await navigateTo('transfer-success', {
        transferId: 'generated-id',
        ...transferData
      });
    } catch (error) {
      // Handle error
    }
  };

  // Component JSX
}
