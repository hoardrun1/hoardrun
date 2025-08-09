import { useState } from 'react';
import { CardList } from './CardList';
import { CardControls } from './CardControls';
import { VirtualCardCreator } from './VirtualCardCreator';
import { CardService } from '@/services/core';

export function CardManagement() {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardFreeze = async (cardId: string) => {
    await CardService.freezeCard(cardId);
    // Update card status
  };

  const handleLimitChange = async (cardId: string, newLimit: number) => {
    await CardService.updateLimit(cardId, newLimit);
    // Update card limits
  };

  return (
    <div className="space-y-8">
      <CardList
        cards={cards}
        onToggleLock={(cardId) => console.log('Toggle lock:', cardId)}
        onViewDetails={setSelectedCard}
      />
      {selectedCard && (
        <CardControls
          cardId={selectedCard}
          isLocked={false}
          spendingLimit={1000}
          onToggleLock={(cardId) => console.log('Toggle lock:', cardId)}
          onUpdateSpendingLimit={handleLimitChange}
          onFreezeCard={handleCardFreeze}
          onReportLost={(cardId) => console.log('Report lost:', cardId)}
        />
      )}
      <VirtualCardCreator
        onCreateCard={(data) => console.log('Create card:', data)}
      />
    </div>
  );
}