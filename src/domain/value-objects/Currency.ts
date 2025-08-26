// Value Object: Currency
// Represents a currency with validation and formatting

export class Currency {
  private readonly _code: string
  private readonly _symbol: string
  private readonly _name: string

  private static readonly SUPPORTED_CURRENCIES = {
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar' },
    AUD: { symbol: 'A$', name: 'Australian Dollar' },
    CHF: { symbol: 'CHF', name: 'Swiss Franc' },
    CNY: { symbol: '¥', name: 'Chinese Yuan' },
    INR: { symbol: '₹', name: 'Indian Rupee' },
    BTC: { symbol: '₿', name: 'Bitcoin' },
    ETH: { symbol: 'Ξ', name: 'Ethereum' }
  }

  constructor(code: string) {
    const upperCode = code.toUpperCase()
    if (!this.isSupported(upperCode)) {
      throw new Error(`Unsupported currency: ${code}`)
    }

    this._code = upperCode
    this._symbol = Currency.SUPPORTED_CURRENCIES[upperCode].symbol
    this._name = Currency.SUPPORTED_CURRENCIES[upperCode].name
  }

  get code(): string {
    return this._code
  }

  get symbol(): string {
    return this._symbol
  }

  get name(): string {
    return this._name
  }

  private isSupported(code: string): code is keyof typeof Currency.SUPPORTED_CURRENCIES {
    return code in Currency.SUPPORTED_CURRENCIES
  }

  equals(other: Currency): boolean {
    return this._code === other._code
  }

  toString(): string {
    return this._code
  }

  // Business methods
  isCrypto(): boolean {
    return ['BTC', 'ETH'].includes(this._code)
  }

  isFiat(): boolean {
    return !this.isCrypto()
  }

  static getSupportedCurrencies(): string[] {
    return Object.keys(Currency.SUPPORTED_CURRENCIES)
  }

  static isSupported(code: string): boolean {
    return code.toUpperCase() in Currency.SUPPORTED_CURRENCIES
  }
}
