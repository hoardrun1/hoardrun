import { RateLimiterMemory } from 'rate-limiter-flexible';
// import { AppError, ErrorCode } from '@/lib/error-handling';

const visaRateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.VISA_RATE_LIMIT || '100'),
  duration: 60 * 15, // 15 minutes
});

export async function enforceVisaRateLimit(userId: string): Promise<void> {
  try {
    await visaRateLimiter.consume(`visa:${userId}`);
  } catch (error) {
    throw new Error('Too many Visa transactions. Please try again later.');
  }
}