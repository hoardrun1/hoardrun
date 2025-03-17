import { useState } from 'react';
import { CardList } from './CardList';
import { CardControls } from './CardControls';
import { VirtualCardCreator } from './VirtualCardCreator';
import { CardService } from '@/services/core';

export function CardManagement() {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

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
        onCardSelect={setSelectedCard} 
      />
      <CardControls 
        selectedCard={selectedCard}
        onFreeze={handleCardFreeze}
        onLimitChange={handleLimitChange}
      />
      <VirtualCardCreator />
    </div>
  );
}