import winston from 'winston';
import { prisma } from './prisma';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/transactions.log' }),
    new winston.transports.Console()
  ]
});

export async function logTransaction(data: {
  userId: string;
  type: string;
  amount: number;
  status: string;
  provider: string;
  error?: string;
}) {
  // Log to file
  logger.info('Transaction processed', {
    ...data,
    timestamp: new Date().toISOString()
  });

  // Store in database
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
}