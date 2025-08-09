import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface VirtualCardCreatorProps {
  onCreateCard: (cardData: VirtualCardData) => void;
  isLoading?: boolean;
}

interface VirtualCardData {
  cardholderName: string;
  spendingLimit: number;
  expiryMonths: number;
  purpose: string;
  country: string;
}

export const VirtualCardCreator: React.FC<VirtualCardCreatorProps> = ({
  onCreateCard,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<VirtualCardData>({
    cardholderName: '',
    spendingLimit: 1000,
    expiryMonths: 12,
    purpose: '',
    country: 'US'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCard(formData);
  };

  const handleSpendingLimitChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, spendingLimit: value[0] }));
  };

  const handleExpiryChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, expiryMonths: value[0] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Virtual Card</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              value={formData.cardholderName}
              onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
              placeholder="Enter cardholder name"
              required
            />
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="e.g., Online shopping, subscriptions"
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Spending Limit */}
          <div className="space-y-3">
            <Label>Spending Limit</Label>
            <div className="px-3">
              <Slider
                value={[formData.spendingLimit]}
                onValueChange={handleSpendingLimitChange}
                max={10000}
                min={100}
                step={100}
                className="w-full"
              />
            </div>
            <div className="text-sm text-gray-500 text-center">
              ${formData.spendingLimit.toLocaleString()}
            </div>
          </div>

          {/* Expiry */}
          <div className="space-y-3">
            <Label>Expires in (months)</Label>
            <div className="px-3">
              <Slider
                value={[formData.expiryMonths]}
                onValueChange={handleExpiryChange}
                max={60}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="text-sm text-gray-500 text-center">
              {formData.expiryMonths} month{formData.expiryMonths !== 1 ? 's' : ''}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.cardholderName}
          >
            {isLoading ? 'Creating...' : 'Create Virtual Card'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
