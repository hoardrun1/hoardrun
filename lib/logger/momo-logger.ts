// Browser-compatible logger that doesn't use file system
const isBrowser = typeof window !== 'undefined';

// Simple logger interface for browser compatibility
interface Logger {
  info: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
}

// Create a simple console-based logger for browser environments
const createBrowserLogger = (): Logger => ({
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta || '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta || '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta || '');
  },
  debug: (message: string, meta?: any) => {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
});

// Create logger based on environment
let logger: Logger;

if (isBrowser) {
  // Use simple console logger in browser
  logger = createBrowserLogger();
} else {
  // Use console logger in Node.js environment (Winston disabled for Vercel)
  logger = createBrowserLogger();
}

export class MomoLogger {
  static logTransaction(data: {
    type: string;
    status: string;
    amount?: number;
    userId?: string;
    referenceId?: string;
    metadata?: any;
    timestamp?: Date;
  }) {
    const logData = {
      ...data,
      timestamp: data.timestamp?.toISOString() || new Date().toISOString(),
    };
    logger.info('MOMO Transaction', logData);
  }

  static logError(error: Error, context?: any) {
    const errorData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
    };
    logger.error('MOMO Error', errorData);
  }

  static logBackup(data: {
    type: string;
    status: string;
    path?: string;
    error?: string;
    timestamp: Date;
  }) {
    const logData = {
      ...data,
      timestamp: data.timestamp.toISOString(),
    };
    logger.info('MOMO Backup', logData);
  }

  static logInfo(message: string, metadata?: any) {
    logger.info(message, {
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  static logWarning(message: string, metadata?: any) {
    logger.warn(message, {
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  static logDebug(message: string, metadata?: any) {
    logger.debug(message, {
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }
}
