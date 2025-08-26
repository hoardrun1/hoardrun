// Value Object: Money
// Represents monetary amounts with currency

import { Currency } from './Currency'

export class Money {
  private readonly _amount: number
  private readonly _currency: Currency

  constructor(amount: number, currencyCode: string) {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative')
    }
    if (!Number.isFinite(amount)) {
      throw new Error('Money amount must be a finite number')
    }
    
    this._amount = Math.round(amount * 100) / 100 // Round to 2 decimal places
    this._currency = new Currency(currencyCode)
  }

  static zero(currencyCode: string): Money {
    return new Money(0, currencyCode)
  }

  get amount(): number {
    return this._amount
  }

  get currency(): Currency {
    return this._currency
  }

  // Arithmetic operations
  add(other: Money): Money {
    this.ensureSameCurrency(other)
    return new Money(this._amount + other._amount, this._currency.code)
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other)
    const result = this._amount - other._amount
    if (result < 0) {
      throw new Error('Subtraction would result in negative amount')
    }
    return new Money(result, this._currency.code)
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Cannot multiply money by negative factor')
    }
    return new Money(this._amount * factor, this._currency.code)
  }

  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new Error('Cannot divide money by zero or negative number')
    }
    return new Money(this._amount / divisor, this._currency.code)
  }

  // Comparison operations
  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency.equals(other._currency)
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other)
    return this._amount > other._amount
  }

  isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other)
    return this._amount < other._amount
  }

  isGreaterThanOrEqual(other: Money): boolean {
    this.ensureSameCurrency(other)
    return this._amount >= other._amount
  }

  isLessThanOrEqual(other: Money): boolean {
    this.ensureSameCurrency(other)
    return this._amount <= other._amount
  }

  isZero(): boolean {
    return this._amount === 0
  }

  isPositive(): boolean {
    return this._amount > 0
  }

  // Utility methods
  private ensureSameCurrency(other: Money): void {
    if (!this._currency.equals(other._currency)) {
      throw new Error(`Currency mismatch: ${this._currency.code} vs ${other._currency.code}`)
    }
  }

  // Formatting
  toString(): string {
    return `${this._currency.symbol}${this._amount.toFixed(2)}`
  }

  toJSON(): { amount: number; currency: string } {
    return {
      amount: this._amount,
      currency: this._currency.code
    }
  }

  // Percentage calculations
  percentage(percent: number): Money {
    if (percent < 0 || percent > 100) {
      throw new Error('Percentage must be between 0 and 100')
    }
    return this.multiply(percent / 100)
  }

  // Allocation (for splitting money)
  allocate(ratios: number[]): Money[] {
    if (ratios.length === 0) {
      throw new Error('At least one ratio must be provided')
    }

    const totalRatio = ratios.reduce((sum, ratio) => sum + ratio, 0)
    if (totalRatio <= 0) {
      throw new Error('Total ratio must be positive')
    }

    const totalCents = Math.round(this._amount * 100)
    let allocatedCents = 0
    const results: Money[] = []

    for (let i = 0; i < ratios.length - 1; i++) {
      const cents = Math.floor((totalCents * ratios[i]) / totalRatio)
      results.push(new Money(cents / 100, this._currency.code))
      allocatedCents += cents
    }

    // Last allocation gets the remainder to avoid rounding errors
    const remainingCents = totalCents - allocatedCents
    results.push(new Money(remainingCents / 100, this._currency.code))

    return results
  }
}
