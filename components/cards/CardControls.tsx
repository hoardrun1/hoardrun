import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface CardControlsProps {
  cardId: string;
  isLocked: boolean;
  spendingLimit: number;
  onToggleLock: (cardId: string) => void;
  onUpdateSpendingLimit: (cardId: string, limit: number) => void;
  onFreezeCard: (cardId: string) => void;
  onReportLost: (cardId: string) => void;
}

export const CardControls: React.FC<CardControlsProps> = ({
  cardId,
  isLocked,
  spendingLimit,
  onToggleLock,
  onUpdateSpendingLimit,
  onFreezeCard,
  onReportLost
}) => {
  const [currentLimit, setCurrentLimit] = React.useState(spendingLimit);

  const handleLimitChange = (value: number[]) => {
    setCurrentLimit(value[0]);
    onUpdateSpendingLimit(cardId, value[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lock/Unlock Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="card-lock">Card Lock</Label>
            <div className="text-sm text-gray-500">
              Temporarily disable all transactions
            </div>
          </div>
          <Switch
            id="card-lock"
            checked={isLocked}
            onCheckedChange={() => onToggleLock(cardId)}
          />
        </div>

        {/* Spending Limit */}
        <div className="space-y-3">
          <Label>Daily Spending Limit</Label>
          <div className="px-3">
            <Slider
              value={[currentLimit]}
              onValueChange={handleLimitChange}
              max={10000}
              min={100}
              step={100}
              className="w-full"
            />
          </div>
          <div className="text-sm text-gray-500 text-center">
            ${currentLimit.toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onFreezeCard(cardId)}
          >
            Freeze Card
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => onReportLost(cardId)}
          >
            Report Lost/Stolen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
