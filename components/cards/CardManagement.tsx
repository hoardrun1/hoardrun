import { useState, useEffect } from 'react';
import { CardList } from './CardList';
import { CardControls } from './CardControls';
import { VirtualCardCreator } from './VirtualCardCreator';
import { apiClient, PaymentMethod } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

export function CardManagement() {
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPaymentMethods();
      // Transform PaymentMethod data to match CardData interface expected by CardList
      const transformedCards = (response.data || []).map((paymentMethod: PaymentMethod) => ({
        id: paymentMethod.id,
        type: paymentMethod.type === 'CARD' ? 'physical' : 'virtual',
        lastFourDigits: paymentMethod.last_four || '0000',
        expiryDate: '12/25', // Default expiry - should come from backend
        cardholderName: paymentMethod.name,
        network: 'visa', // Default network - should come from backend
        status: paymentMethod.status === 'active' ? 'active' : 
                paymentMethod.status === 'locked' ? 'blocked' : 'inactive',
        isLocked: paymentMethod.status === 'locked',
        isContactless: true // Default - should come from backend
      }));
      setCards(transformedCards);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load cards',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardFreeze = async (cardId: string) => {
    try {
      await apiClient.updatePaymentMethod(cardId, { status: 'frozen' });
      toast({
        title: 'Success',
        description: 'Card has been frozen'
      });
      await loadCards();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to freeze card',
        variant: 'destructive'
      });
    }
  };

  const handleLimitChange = async (cardId: string, newLimit: number) => {
    try {
      await apiClient.updatePaymentMethod(cardId, { spending_limit: newLimit });
      toast({
        title: 'Success',
        description: 'Spending limit updated'
      });
      await loadCards();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update spending limit',
        variant: 'destructive'
      });
    }
  };

  const handleToggleLock = async (cardId: string) => {
    try {
      const card = cards.find((c) => c.id === cardId);
      const newStatus = card?.status === 'locked' ? 'active' : 'locked';
      await apiClient.updatePaymentMethod(cardId, { status: newStatus });
      toast({
        title: 'Success',
        description: `Card ${newStatus === 'locked' ? 'locked' : 'unlocked'}`
      });
      await loadCards();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle card lock',
        variant: 'destructive'
      });
    }
  };

  const handleReportLost = async (cardId: string) => {
    try {
      await apiClient.updatePaymentMethod(cardId, { status: 'lost' });
      toast({
        title: 'Success',
        description: 'Card reported as lost'
      });
      await loadCards();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to report card as lost',
        variant: 'destructive'
      });
    }
  };

  const handleCreateCard = async (data: any) => {
    try {
      await apiClient.createPaymentMethod(data);
      toast({
        title: 'Success',
        description: 'Virtual card created successfully'
      });
      await loadCards();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create virtual card',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedCardData = cards.find((c) => c.id === selectedCard);

  return (
    <div className="space-y-8">
      <CardList
        cards={cards}
        onToggleLock={handleToggleLock}
        onViewDetails={setSelectedCard}
      />
      {selectedCard && selectedCardData && (
        <CardControls
          cardId={selectedCard}
          isLocked={selectedCardData.status === 'locked'}
          spendingLimit={selectedCardData.spending_limit || 1000}
          onToggleLock={handleToggleLock}
          onUpdateSpendingLimit={handleLimitChange}
          onFreezeCard={handleCardFreeze}
          onReportLost={handleReportLost}
        />
      )}
      <VirtualCardCreator
        onCreateCard={handleCreateCard}
      />
    </div>
  );
}
