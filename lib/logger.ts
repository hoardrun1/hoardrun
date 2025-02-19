import winston from 'winston'
import { format } from 'winston'
const { combine, timestamp, printf, colorize, errors } = format

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Level colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Add colors to Winston
winston.addColors(colors)

// Custom format for development
const developmentFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`
  
  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`
  }
  
  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`
  }
  
  return msg
})

// Custom format for production
const productionFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...metadata,
  })
})

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'production'
      ? productionFormat
      : combine(colorize({ all: true }), developmentFormat)
  ),
  transports: [
    // Write all logs to console
    new winston.transports.Console(),
    
    // Write all errors to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), format.json()),
    }),
    
    // Write all logs to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), format.json()),
    }),
  ],
})

// Create a stream object for Morgan HTTP logger
export const stream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}

// Add request context middleware
export const addRequestContext = (req: any, _res: any, next: () => void) => {
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7)
  const context = {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  }
  
  logger.defaultMeta = {
    ...logger.defaultMeta,
    ...context,
  }
  
  next()
}

// Security event logging
export const logSecurityEvent = (event: {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  userId?: string
  metadata?: Record<string, any>
}) => {
  const logLevel = {
    low: 'info',
    medium: 'warn',
    high: 'error',
    critical: 'error',
  }[event.severity]

  logger[logLevel]({
    message: event.message,
    event_type: event.type,
    severity: event.severity,
    user_id: event.userId,
    ...event.metadata,
  })
}

// Performance logging
export const logPerformance = (
  operation: string,
  durationMs: number,
  metadata?: Record<string, any>
) => {
  const threshold = process.env.PERFORMANCE_THRESHOLD_MS || 1000

  if (durationMs > threshold) {
    logger.warn({
      message: `Slow operation detected: ${operation}`,
      duration_ms: durationMs,
      ...metadata,
    })
  } else {
    logger.debug({
      message: `Performance measurement: ${operation}`,
      duration_ms: durationMs,
      ...metadata,
    })
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