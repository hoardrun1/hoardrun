// Value Object: Email
// Represents a valid email address with business rules

export class Email {
  private readonly _value: string

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email format')
    }
    this._value = value.toLowerCase().trim()
  }

  get value(): string {
    return this._value
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  equals(other: Email): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }

  // Business methods
  getDomain(): string {
    return this._value.split('@')[1]
  }

  getLocalPart(): string {
    return this._value.split('@')[0]
  }

  isFromDomain(domain: string): boolean {
    return this.getDomain() === domain.toLowerCase()
  }
}
