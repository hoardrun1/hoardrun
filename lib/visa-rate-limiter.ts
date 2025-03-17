import { RateLimiterMemory } from 'rate-limiter-flexible';
import { APIError } from '@/middleware/error-handler';

const visaRateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.VISA_RATE_LIMIT || '100'),
  duration: 60 * 15, // 15 minutes
});

export async function enforceVisaRateLimit(userId: string): Promise<void> {
  try {
    await visaRateLimiter.consume(`visa:${userId}`);
  } catch (error) {
    throw new APIError(
      429,
      'Too many Visa transactions. Please try again later.',
      'VISA_RATE_LIMIT_EXCEEDED'
    );
  }
}