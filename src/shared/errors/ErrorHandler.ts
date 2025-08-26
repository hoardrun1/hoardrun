// Global Error Handler
// Centralized error handling and logging

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { DomainError } from './DomainError'
import { Logger } from '../../application/ports/Logger'

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
  requestId?: string
}

export class ErrorHandler {
  constructor(private readonly logger: Logger) {}

  handleError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
    const timestamp = new Date().toISOString()

    // Domain errors (business logic errors)
    if (error instanceof DomainError) {
      this.logger.warn('Domain error occurred', {
        error: error.toJSON(),
        requestId
      })

      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        },
        timestamp,
        requestId
      }, { status: error.statusCode })
    }

    // Validation errors (Zod)
    if (error instanceof ZodError) {
      this.logger.warn('Validation error occurred', {
        errors: error.errors,
        requestId
      })

      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          details: error.errors
        },
        timestamp,
        requestId
      }, { status: 400 })
    }

    // Unexpected errors
    this.logger.error('Unexpected error occurred', {
      error: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      requestId
    })

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      },
      timestamp,
      requestId
    }, { status: 500 })
  }

  // Helper method for async error handling
  async handleAsync<T>(
    operation: () => Promise<T>,
    requestId?: string
  ): Promise<T | NextResponse<ErrorResponse>> {
    try {
      return await operation()
    } catch (error) {
      return this.handleError(error, requestId)
    }
  }

  // Wrapper for API route handlers
  wrapApiHandler<T extends any[], R>(
    handler: (...args: T) => Promise<R>
  ): (...args: T) => Promise<R | NextResponse<ErrorResponse>> {
    return async (...args: T) => {
      try {
        return await handler(...args)
      } catch (error) {
        return this.handleError(error)
      }
    }
  }
}
