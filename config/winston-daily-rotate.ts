import winston from 'winston';
import 'winston-daily-rotate-file';

const logPath = process.env.LOG_PATH || '/var/log/vogood';
const maxFiles = process.env.LOG_MAX_FILES || '5';
const maxSize = process.env.LOG_MAX_SIZE || '100m';

export const rotatingFileTransport = new winston.transports.DailyRotateFile({
  dirname: logPath,
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize,
  maxFiles,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

export const errorRotatingFileTransport = new winston.transports.DailyRotateFile({
  dirname: logPath,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize,
  maxFiles,
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});