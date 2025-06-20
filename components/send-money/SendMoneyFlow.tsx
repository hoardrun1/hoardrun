import { useFinanceNavigation } from '@/hooks/useFinanceNavigation';
import { transferService } from '@/services/transfer-service';

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
      // Process transfer
      await transferService.sendMoney(transferData);
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