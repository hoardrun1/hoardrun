import { NextResponse } from 'next/server';
import { alphaVantageAPI } from '@/lib/alpha-vantage-client';

export async function GET(request: Request) {
  try {
    // Test with a popular stock symbol
    const symbol = 'AAPL';
    
    const quote = await alphaVantageAPI.getStockQuote(symbol);
    
    return NextResponse.json({
      success: true,
      data: quote,
      message: 'API connection successful'
    });

  } catch (error) {
    console.error('Market data test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}