// Client-safe logger that works in both browser and Node.js environments
interface Logger {
  error: (message: string | object, meta?: any) => void;
  warn: (message: string | object, meta?: any) => void;
  info: (message: string | object, meta?: any) => void;
  debug: (message: string | object, meta?: any) => void;
  http: (message: string) => void;
  defaultMeta?: any;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create a browser-compatible logger
const createLogger = (): Logger => {
  const formatMessage = (level: string, message: string | object, meta?: any) => {
    const timestamp = new Date().toISOString();
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level.toUpperCase()}]: ${messageStr}${metaStr}`;
  };

  const logger: Logger = {
    error: (message: string | object, meta?: any) => {
      console.error(formatMessage('error', message, meta));
    },
    warn: (message: string | object, meta?: any) => {
      console.warn(formatMessage('warn', message, meta));
    },
    info: (message: string | object, meta?: any) => {
      console.info(formatMessage('info', message, meta));
    },
    debug: (message: string | object, meta?: any) => {
      console.debug(formatMessage('debug', message, meta));
    },
    http: (message: string) => {
      console.log(formatMessage('http', message));
    },
  };

  return logger;
};

export const logger = createLogger();

// Create a stream object for Morgan HTTP logger
export const stream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}

// Add request context middleware (no-op in browser)
export const addRequestContext = (req: any, _res: any, next: () => void) => {
  if (typeof next === 'function') {
    next()
  }
}

// Security event logging
export const logSecurityEvent = (event: {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  userId?: string
  metadata?: Record<string, any>
}) => {
  const logLevel = event.severity === 'low' ? 'info' :
                   event.severity === 'medium' ? 'warn' : 'error';

  const logData = {
    message: event.message,
    event_type: event.type,
    severity: event.severity,
    user_id: event.userId,
    ...event.metadata,
  };

  if (logLevel === 'info') {
    logger.info(logData);
  } else if (logLevel === 'warn') {
    logger.warn(logData);
  } else {
    logger.error(logData);
  }
}

// Performance logging
export const logPerformance = (
  operation: string,
  durationMs: number,
  metadata?: Record<string, any>
) => {
  const threshold = 1000; // Default threshold

  const logData = {
    message: durationMs > threshold
      ? `Slow operation detected: ${operation}`
      : `Performance measurement: ${operation}`,
    duration_ms: durationMs,
    ...metadata,
  };

  if (durationMs > threshold) {
    logger.warn(logData);
  } else {
    logger.debug(logData);
  }
}

// Error logging with stack trace
export const logError = (error: Error, metadata?: Record<string, any>) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...metadata,
  })
}

// Audit logging
export const logAudit = (
  action: string,
  userId: string,
  details: Record<string, any>
) => {
  logger.info({
    message: `Audit: ${action}`,
    audit_action: action,
    user_id: userId,
    ...details,
  })
}

export default logger