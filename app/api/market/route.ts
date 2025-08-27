import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs';
import { alphaVantageAPI } from '@/lib/alpha-vantage-client';
import { RateLimiter } from '@/lib/rate-limiter';
import { getCustomSession } from '@/lib/auth-session'
// import { AppError, ErrorCode } from '@/lib/error-handling';

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getCustomSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type') || 'quote';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Apply rate limiting
    const rateLimitKey = `market-api:${session.user.id}`;
    if (!await RateLimiter.checkLimit(rateLimitKey, 5)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Get market data based on type
    let data;
    switch (type) {
      case 'quote':
        data = await alphaVantageAPI.getStockQuote(symbol);
        break;
      case 'daily':
        data = await alphaVantageAPI.getDailyPrices(symbol);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid data type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Market API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}