import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MastercardClient } from '@/lib/mastercard-client';
import { COUNTRY_CODES, type CountryCode } from '@/lib/constants/country-codes';
import { prisma } from '@/lib/prisma';
import { getCustomSession } from '@/lib/auth-session'

const linkSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().optional(),
  country: z.string().refine((val): val is CountryCode => val in COUNTRY_CODES, {
    message: 'Invalid country code'
  }).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getCustomSession();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const data = linkSchema.parse(body);

    // Get user's country from database if not provided
    let country = data.country;
    if (!country) {
      // User model doesn't have country field, use default
      country = process.env.MASTERCARD_COUNTRY as CountryCode || 'US';
    }

    const mastercardClient = new MastercardClient({
      apiKey: process.env.MASTERCARD_API_KEY!,
      partnerId: process.env.MASTERCARD_PARTNER_ID!,
      environment: process.env.MASTERCARD_ENVIRONMENT as 'sandbox' | 'production',
      // certificatePath: process.env.MASTERCARD_CERT_PATH!, // Disabled for Vercel
      // privateKeyPath: process.env.MASTERCARD_PRIVATE_KEY_PATH!, // Not in interface
      clientId: process.env.MASTERCARD_CLIENT_ID!,
      orgName: process.env.MASTERCARD_ORG_NAME!,
      country: country,
      // certPassword: process.env.MASTERCARD_CERT_PASSWORD!, // Not in interface
    });

    const result = await mastercardClient.generatePaymentLink({
      amount: data.amount,
      currency: data.currency,
      description: data.description,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment link generation failed' },
      { status: 500 }
    );
  }
}


