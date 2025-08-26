// Domain Error Classes
// Structured error handling following Clean Architecture

export abstract class DomainError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number

  constructor(message: string, public readonly details?: any) {
    super(message)
    this.name = this.constructor.name
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details
    }
  }
}

// Business Rule Violations
export class BusinessRuleViolationError extends DomainError {
  readonly code = 'BUSINESS_RULE_VIOLATION'
  readonly statusCode = 400
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND'
  readonly statusCode = 404
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT'
  readonly statusCode = 409
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED'
  readonly statusCode = 401
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN'
  readonly statusCode = 403
}

// Specific Domain Errors
export class UserAlreadyExistsError extends ConflictError {
  readonly code = 'USER_ALREADY_EXISTS'
  
  constructor(email: string) {
    super(`User with email ${email} already exists`, { email })
  }
}

export class UserNotFoundError extends NotFoundError {
  readonly code = 'USER_NOT_FOUND'
  
  constructor(identifier: string) {
    super(`User not found: ${identifier}`, { identifier })
  }
}

export class InsufficientFundsError extends BusinessRuleViolationError {
  readonly code = 'INSUFFICIENT_FUNDS'
  
  constructor(available: number, required: number, currency: string) {
    super(`Insufficient funds: ${available} ${currency} available, ${required} ${currency} required`, {
      available,
      required,
      currency
    })
  }
}

export class InvalidCurrencyError extends ValidationError {
  readonly code = 'INVALID_CURRENCY'
  
  constructor(currency: string) {
    super(`Invalid currency: ${currency}`, { currency })
  }
}

export class InvalidEmailError extends ValidationError {
  readonly code = 'INVALID_EMAIL'
  
  constructor(email: string) {
    super(`Invalid email format: ${email}`, { email })
  }
}

export class EmailAlreadyVerifiedError extends BusinessRuleViolationError {
  readonly code = 'EMAIL_ALREADY_VERIFIED'
  
  constructor() {
    super('Email is already verified')
  }
}

// Infrastructure Errors
export class DatabaseError extends DomainError {
  readonly code = 'DATABASE_ERROR'
  readonly statusCode = 500
}

export class ExternalServiceError extends DomainError {
  readonly code = 'EXTERNAL_SERVICE_ERROR'
  readonly statusCode = 502
}

export class ConfigurationError extends DomainError {
  readonly code = 'CONFIGURATION_ERROR'
  readonly statusCode = 500
}
