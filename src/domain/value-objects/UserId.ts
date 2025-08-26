// Value Object: UserId
// Represents a unique identifier for a User

import { v4 as uuidv4 } from 'uuid'

export class UserId {
  private readonly _value: string

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid UserId format')
    }
    this._value = value
  }

  static generate(): UserId {
    return new UserId(uuidv4())
  }

  get value(): string {
    return this._value
  }

  private isValid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
  }

  equals(other: UserId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
