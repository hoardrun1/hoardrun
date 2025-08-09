import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CardData {
  id: string;
  type: 'physical' | 'virtual';
  lastFourDigits: string;
  expiryDate: string;
  cardholderName: string;
  network: 'visa' | 'mastercard';
  status: 'active' | 'inactive' | 'blocked';
  isLocked: boolean;
  isContactless: boolean;
}

interface CardListProps {
  cards: CardData[];
  onToggleLock: (cardId: string) => void;
  onViewDetails: (cardId: string) => void;
}

export const CardList: React.FC<CardListProps> = ({ 
  cards, 
  onToggleLock, 
  onViewDetails 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <Card key={card.id} className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {card.network.toUpperCase()} •••• {card.lastFourDigits}
              </CardTitle>
              <Badge className={getStatusColor(card.status)}>
                {card.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 capitalize">{card.type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Expires:</span>
                  <span className="ml-2">{card.expiryDate}</span>
                </div>
                <div>
                  <span className="text-gray-500">Cardholder:</span>
                  <span className="ml-2">{card.cardholderName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Contactless:</span>
                  <span className="ml-2">{card.isContactless ? 'Yes' : 'No'}</span>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleLock(card.id)}
                  className={card.isLocked ? 'text-red-600' : 'text-green-600'}
                >
                  {card.isLocked ? 'Unlock' : 'Lock'} Card
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(card.id)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
