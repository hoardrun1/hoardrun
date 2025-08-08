import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { MastercardClient } from '@/lib/mastercard-client';
import { authOptions } from '@/lib/auth-config';
import { enforcePaymentRateLimit } from '@/lib/rate-limiter';
import { handlePaymentError } from '@/lib/error-handling';
import { logger } from '@/lib/logger';
import { COUNTRY_CODES, type CountryCode } from '@/lib/constants/country-codes';

const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  cardNumber: z.string(),
  description: z.string().optional(),
  country: z.string().refine((val): val is CountryCode => val in COUNTRY_CODES, {
    message: 'Invalid country code'
  }).optional(),
});

export async function POST(request: Request) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Rate limiting
    await enforcePaymentRateLimit(session.user.id);

    // Validate input
    const body = await request.json();
    const data = paymentSchema.parse(body);

    // Get user's country from database if not provided
    let country = data.country;
    if (!country) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { country: true }
      });
      country = (user?.country as CountryCode) || process.env.MASTERCARD_COUNTRY as CountryCode;
    }

    // Initialize client
    const mastercardClient = new MastercardClient({
      apiKey: process.env.MASTERCARD_API_KEY!,
      partnerId: process.env.MASTERCARD_PARTNER_ID!,
      environment: process.env.MASTERCARD_ENVIRONMENT as 'sandbox' | 'production',
      // certificatePath: process.env.MASTERCARD_CERT_PATH!, // Disabled for Vercel
      privateKeyPath: process.env.MASTERCARD_PRIVATE_KEY_PATH!,
      clientId: process.env.MASTERCARD_CLIENT_ID!,
      orgName: process.env.MASTERCARD_ORG_NAME!,
      country: country,
      certPassword: process.env.MASTERCARD_CERT_PASSWORD!,
    });

    const result = await mastercardClient.initiateTransfer({
      amount: data.amount,
      currency: data.currency,
      recipientCard: data.cardNumber,
      description: data.description,
    });

    return NextResponse.json(result);
  } catch (error) {
    const { error: responseError, statusCode } = handlePaymentError(error);
    return NextResponse.json(responseError, { status: statusCode });
  }
}




