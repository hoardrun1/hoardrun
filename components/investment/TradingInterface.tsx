import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TradeOrder {
  symbol: string;
  orderType: 'market' | 'limit';
  quantity: number;
  price?: number;
}

interface TradingInterfaceProps {
  onPlaceOrder?: (order: TradeOrder, action: 'buy' | 'sell') => void;
}

export const TradingInterface: React.FC<TradingInterfaceProps> = ({ 
  onPlaceOrder 
}) => {
  const [buyOrder, setBuyOrder] = useState<TradeOrder>({
    symbol: '',
    orderType: 'market',
    quantity: 0,
    price: undefined
  });

  const [sellOrder, setSellOrder] = useState<TradeOrder>({
    symbol: '',
    orderType: 'market',
    quantity: 0,
    price: undefined
  });

  const handlePlaceOrder = (action: 'buy' | 'sell') => {
    const order = action === 'buy' ? buyOrder : sellOrder;
    
    if (order.symbol && order.quantity > 0) {
      onPlaceOrder?.(order, action);
      
      // Reset form
      const resetOrder = {
        symbol: '',
        orderType: 'market' as const,
        quantity: 0,
        price: undefined
      };
      
      if (action === 'buy') {
        setBuyOrder(resetOrder);
      } else {
        setSellOrder(resetOrder);
      }
    }
  };

  const OrderForm: React.FC<{
    order: TradeOrder;
    setOrder: (order: TradeOrder) => void;
    action: 'buy' | 'sell';
  }> = ({ order, setOrder, action }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${action}-symbol`}>Symbol</Label>
        <Input
          id={`${action}-symbol`}
          placeholder="e.g., AAPL"
          value={order.symbol}
          onChange={(e) => setOrder({ ...order, symbol: e.target.value.toUpperCase() })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${action}-type`}>Order Type</Label>
        <Select
          value={order.orderType}
          onValueChange={(value: 'market' | 'limit') => 
            setOrder({ ...order, orderType: value, price: value === 'market' ? undefined : order.price })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market">Market Order</SelectItem>
            <SelectItem value="limit">Limit Order</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${action}-quantity`}>Quantity</Label>
        <Input
          id={`${action}-quantity`}
          type="number"
          min="1"
          value={order.quantity || ''}
          onChange={(e) => setOrder({ ...order, quantity: parseInt(e.target.value) || 0 })}
        />
      </div>

      {order.orderType === 'limit' && (
        <div className="space-y-2">
          <Label htmlFor={`${action}-price`}>Limit Price</Label>
          <Input
            id={`${action}-price`}
            type="number"
            step="0.01"
            min="0"
            value={order.price || ''}
            onChange={(e) => setOrder({ ...order, price: parseFloat(e.target.value) || undefined })}
          />
        </div>
      )}

      <Button
        onClick={() => handlePlaceOrder(action)}
        className={`w-full ${action === 'buy' ? 'bg-black hover:bg-gray-800 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
        disabled={!order.symbol || order.quantity <= 0 || (order.orderType === 'limit' && !order.price)}
      >
        {action === 'buy' ? 'Buy' : 'Sell'} {order.symbol || 'Stock'}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Interface</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="text-black dark:text-white">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="text-gray-600 dark:text-gray-400">Sell</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="mt-4">
            <OrderForm 
              order={buyOrder} 
              setOrder={setBuyOrder} 
              action="buy" 
            />
          </TabsContent>
          
          <TabsContent value="sell" className="mt-4">
            <OrderForm 
              order={sellOrder} 
              setOrder={setSellOrder} 
              action="sell" 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
