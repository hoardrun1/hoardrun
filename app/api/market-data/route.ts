import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs';
import { alphaVantageAPI } from '@/lib/alpha-vantage-client';
import { cache } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type') || 'quote';

    if (!symbol) {
      return new NextResponse('Symbol is required', { status: 400 });
    }

    const cacheKey = `market-data:${symbol}:${type}`;
    const cachedData = await cache.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    let data;
    switch (type) {
      case 'quote':
        data = await alphaVantageAPI.getStockQuote(symbol);
        break;
      case 'overview':
        data = await alphaVantageAPI.getCompanyOverview(symbol);
        break;
      case 'intraday':
        data = await alphaVantageAPI.getIntradayPrices(symbol);
        break;
      default:
        return new NextResponse('Invalid data type', { status: 400 });
    }

    // Cache the data for 5 minutes
    await cache.set(cacheKey, JSON.stringify(data), 300);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Market data error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}