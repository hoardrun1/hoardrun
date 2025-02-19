import { Request, Response, NextFunction } from 'express'
import { securityService } from '@/lib/security'
import { APIError } from '@/middleware/error-handler'
import { RateLimiter } from '@/lib/rate-limiter'

// Security middleware stack
export const securityMiddleware = [
  validateRequest,
  validateSession,
  rateLimiter,
  validateCSRF,
  sanitizeInput,
  validateContentType,
  validateOrigin,
]

// Validate request security
async function validateRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const isValid = await securityService.validateRequest(req)
    if (!isValid) {
      throw new APIError(403, 'Request validation failed', 'SECURITY_VALIDATION_FAILED')
    }
    next()
  } catch (error) {
    next(error)
  }
}

// Session validation
async function validateSession(req: Request, res: Response, next: NextFunction) {
  try {
    const isValid = await securityService.validateSession(req)
    if (!isValid) {
      throw new APIError(401, 'Invalid or expired session', 'INVALID_SESSION')
    }
    next()
  } catch (error) {
    next(error)
  }
}

// Rate limiting
function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = `rate-limit:${req.ip}:${req.path}`
  if (!RateLimiter.checkLimit(key, 100)) { // 100 requests per minute
    throw new APIError(429, 'Too many requests', 'RATE_LIMIT_EXCEEDED')
  }
  next()
}

// CSRF protection
function validateCSRF(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const token = req.headers['x-csrf-token']
    const cookie = req.cookies['csrf-token']

    if (!token || !cookie || token !== cookie) {
      throw new APIError(403, 'Invalid CSRF token', 'INVALID_CSRF_TOKEN')
    }
  }
  next()
}

// Input sanitization
function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body)
  }
  if (req.query) {
    req.query = sanitizeObject(req.query)
  }
  if (req.params) {
    req.params = sanitizeObject(req.params)
  }
  next()
}

// Content type validation
function validateContentType(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const contentType = req.headers['content-type']
    if (!contentType || !contentType.includes('application/json')) {
      throw new APIError(415, 'Unsupported content type', 'INVALID_CONTENT_TYPE')
    }
  }
  next()
}

// Origin validation
function validateOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

  if (origin && !allowedOrigins.includes(origin)) {
    throw new APIError(403, 'Invalid origin', 'INVALID_ORIGIN')
  }
  next()
}

// Helper functions
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeValue(obj)
  }

  return Object.keys(obj).reduce((sanitized: any, key) => {
    sanitized[key] = sanitizeValue(obj[key])
    return sanitized
  }, {})
}

function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // Remove potentially dangerous characters
    value = value.replace(/[<>]/g, '')
    // Prevent SQL injection
    value = value.replace(/['";]/g, '')
    // Prevent script injection
    value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Prevent XSS
    value = value.replace(/on\w+="[^"]*"/g, '')
  }
  return value
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // HSTS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '))
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Frame Options
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Feature Policy
  res.setHeader('Permissions-Policy', [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=(self)',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
  ].join(', '))

  next()
}

// Transaction security middleware
export function transactionSecurity(req: Request, res: Response, next: NextFunction) {
  const amount = parseFloat(req.body.amount)
  const HIGH_RISK_THRESHOLD = 10000

  if (amount > HIGH_RISK_THRESHOLD) {
    // Require additional verification for high-value transactions
    if (!req.body.mfaCode) {
      throw new APIError(403, 'MFA required for high-value transaction', 'MFA_REQUIRED')
    }

    // Validate MFA code
    if (!securityService.validateMFA(req.user!.id, req.body.mfaCode)) {
      throw new APIError(401, 'Invalid MFA code', 'INVALID_MFA')
    }
  }

  next()
}

// Device trust middleware
export async function deviceTrust(req: Request, res: Response, next: NextFunction) {
  const deviceInfo = req.headers['x-device-info']
  if (!deviceInfo) {
    throw new APIError(400, 'Device info required', 'DEVICE_INFO_REQUIRED')
  }

  const device = JSON.parse(deviceInfo as string)
  if (!await securityService.isDeviceTrusted(device.id)) {
    // Require additional verification for untrusted devices
    if (!req.body.mfaCode) {
      throw new APIError(403, 'MFA required for untrusted device', 'MFA_REQUIRED')
    }

    // Validate MFA code
    if (!await securityService.validateMFA(req.user!.id, req.body.mfaCode)) {
      throw new APIError(401, 'Invalid MFA code', 'INVALID_MFA')
    }

    // Trust device after successful verification
    await securityService.trustDevice(req.user!.id, device)
  }

  next()
}

export default {
  securityMiddleware,
  securityHeaders,
  transactionSecurity,
  deviceTrust,
} 