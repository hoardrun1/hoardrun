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
      <PortfolioOverview value={portfolioValue} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketWatch onAssetSelect={setSelectedAsset} />
        <TradingInterface selectedAsset={selectedAsset} />
      </div>
      <InvestmentAnalytics />
    </div>
  );
}