// Infrastructure: Logger Implementation
// Concrete implementation using Winston (or console for serverless)

import { Logger } from '../../application/ports/Logger'

export class WinstonLogger implements Logger {
  private readonly isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  info(message: string, meta?: any): void {
    const logData = this.formatLog('INFO', message, meta)
    console.info(logData)
  }

  error(message: string, meta?: any): void {
    const logData = this.formatLog('ERROR', message, meta)
    console.error(logData)
  }

  warn(message: string, meta?: any): void {
    const logData = this.formatLog('WARN', message, meta)
    console.warn(logData)
  }

  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      const logData = this.formatLog('DEBUG', message, meta)
      console.debug(logData)
    }
  }

  private formatLog(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString()
    const logObject = {
      timestamp,
      level,
      message,
      ...(meta && { meta })
    }
    
    return JSON.stringify(logObject)
  }
}
