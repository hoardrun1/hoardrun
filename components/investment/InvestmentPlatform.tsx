import { useState } from 'react';
import { PortfolioOverview } from './PortfolioOverview';
import { MarketWatch } from './MarketWatch';
import { TradingInterface } from './TradingInterface';
import { InvestmentAnalytics } from './InvestmentAnalytics';

export function InvestmentPlatform() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  
  return (
    <div className="space-y-6">
      <PortfolioOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketWatch onAddToWatchlist={(symbol) => console.log('Add to watchlist:', symbol)} />
        <TradingInterface onPlaceOrder={(order, action) => console.log('Place order:', order, action)} />
      </div>
      <InvestmentAnalytics />
    </div>
  );
}