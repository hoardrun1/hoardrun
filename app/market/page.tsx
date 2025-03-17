import StockQuote from '@/components/stock-quote';

export default function MarketPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Market Data</h1>
      <StockQuote />
    </div>
  );
}