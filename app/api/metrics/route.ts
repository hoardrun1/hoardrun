import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '24h';

  const rangeMap = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };

  const startDate = new Date(Date.now() - rangeMap[range as keyof typeof rangeMap]);

  try {
    const metrics = await prisma.systemMetric.groupBy({
      by: ['name', 'unit'],
      where: {
        timestamp: {
          gte: startDate,
        },
      },
    });

    const metricsData = await Promise.all(
      metrics.map(async (metric) => {
        const data = await prisma.systemMetric.findMany({
          where: {
            name: metric.name,
            timestamp: {
              gte: startDate,
            },
          },
          select: {
            timestamp: true,
            value: true,
          },
          orderBy: {
            timestamp: 'asc',
          },
        });

        return {
          name: metric.name,
          unit: metric.unit,
          data: data.map((d) => ({
            timestamp: d.timestamp.toISOString(),
            value: d.value,
          })),
        };
      })
    );

    return NextResponse.json(metricsData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}