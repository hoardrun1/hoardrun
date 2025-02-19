import { Request, Response, NextFunction } from 'express'
import { logger } from '@/lib/logger'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

// Custom API Error class
export class APIError extends Error {
  statusCode: number
  code: string
  errors?: any[]

  constructor(
    statusCode: number,
    message: string,
    code: string = 'INTERNAL_SERVER_ERROR',
    errors?: any[]
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}

// Custom Validation Error class
export class ValidationError extends APIError {
  constructor(message: string, errors?: any[]) {
    super(400, message, 'VALIDATION_ERROR', errors)
  }
}

// Custom Authentication Error class
export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR')
  }
}

// Custom Authorization Error class
export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR')
  }
}

// Custom Not Found Error class
export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND_ERROR')
  }
}

// Custom Rate Limit Error class
export class RateLimitError extends APIError {
  constructor(message: string = 'Too many requests') {
    super(429, message, 'RATE_LIMIT_ERROR')
  }
}

// Error response interface
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    errors?: any[]
    stack?: string
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'],
  })

  // Default error response
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  }

  // Handle different types of errors
  if (err instanceof APIError) {
    response.error = {
      code: err.code,
      message: err.message,
      errors: err.errors,
    }
    res.status(err.statusCode)
  } else if (err instanceof ZodError) {
    response.error = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      errors: err.errors,
    }
    res.status(400)
  } else if (err.name === 'UnauthorizedError') {
    response.error = {
      code: 'AUTHENTICATION_ERROR',
      message: 'Invalid or expired token',
    }
    res.status(401)
  } else if (err.name === 'ValidationError') {
    response.error = {
      code: 'VALIDATION_ERROR',
      message: err.message,
    }
    res.status(400)
  } else {
    res.status(500)
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack
  }

  // Send error response
  res.json(response)
}

// Not found middleware
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const err = new NotFoundError(`Cannot ${req.method} ${req.path}`)
  next(err)
}

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        next(new ValidationError('Invalid request data', err.errors))
      } else {
        next(err)
      }
    }
  }
}

// Error logger middleware
export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  console.error('Error details:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    user: req.user?.id,
  })

  next(err)
}

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateRequest,
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  errorLogger,
} 