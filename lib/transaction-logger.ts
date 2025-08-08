// Browser-compatible transaction logger
const isBrowser = typeof window !== 'undefined';

// Simple logger interface
interface Logger {
  info: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
}

// Create logger based on environment
let logger: Logger;

if (isBrowser) {
  // Browser console logger
  logger = {
    info: (message: string, meta?: any) => console.log(`[TRANSACTION-INFO] ${message}`, meta || ''),
    error: (message: string, meta?: any) => console.error(`[TRANSACTION-ERROR] ${message}`, meta || ''),
    warn: (message: string, meta?: any) => console.warn(`[TRANSACTION-WARN] ${message}`, meta || ''),
  };
} else {
  // Server-side console logger (Winston disabled for Vercel)
  logger = {
    info: (message: string, meta?: any) => console.log(`[TRANSACTION-INFO] ${message}`, meta || ''),
    error: (message: string, meta?: any) => console.error(`[TRANSACTION-ERROR] ${message}`, meta || ''),
    warn: (message: string, meta?: any) => console.warn(`[TRANSACTION-WARN] ${message}`, meta || ''),
  };
}

// Import prisma only on server side
let prisma: any = null;
if (!isBrowser) {
  try {
    prisma = require('./prisma').prisma;
  } catch (error) {
    console.warn('Prisma not available:', error);
  }
}

export async function logTransaction(data: {
  userId: string;
  type: string;
  amount: number;
  status: string;
  provider: string;
  error?: string;
}) {
  try {
    // Log to console/winston
    logger.info('Transaction processed', {
      ...data,
      timestamp: new Date().toISOString()
    });

    // Store in database (server-side only)
    if (!isBrowser && prisma) {
      await prisma.transactionLog.create({
        data: {
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          status: data.status,
          provider: data.provider,
          error: data.error,
        }
      });
    } else if (isBrowser) {
      // In browser, could send to API endpoint instead
      console.log('Transaction logged (client-side):', data);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to log transaction', { error: errorMessage, data });
  }
}