import winston from 'winston';
import { rotatingFileTransport, errorRotatingFileTransport } from '../../config/winston-daily-rotate';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'momo-service' },
  transports: [
    errorRotatingFileTransport,
    rotatingFileTransport
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export class MomoLogger {
  static logTransaction(data: {
    type: string;
    status: string;
    amount: number;
    userId: string;
    referenceId: string;
    metadata?: any;
  }) {
    logger.info('MOMO Transaction', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  static logError(error: Error, context?: any) {
    logger.error('MOMO Error', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
    });
  }
}
