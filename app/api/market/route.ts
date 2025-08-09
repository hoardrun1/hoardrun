import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { alphaVantageAPI } from '@/lib/alpha-vantage-client';
import { RateLimiter } from '@/lib/rate-limiter';
import { AppError, ErrorCode } from '@/lib/error-handling';

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
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
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}