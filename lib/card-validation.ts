import { z } from 'zod';

export const cardSchema = z.object({
  number: z.string()
    .regex(/^[0-9]{16}$/, 'Card number must be 16 digits')
    .refine((num) => luhnCheck(num), 'Invalid card number'),
  expiryMonth: z.number()
    .min(1)
    .max(12),
  expiryYear: z.number()
    .min(new Date().getFullYear())
    .max(new Date().getFullYear() + 10),
  cvv: z.string()
    .regex(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
});

// Luhn algorithm for card number validation
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export function isCardExpired(month: number, year: number): boolean {
  const now = new Date();
  const cardDate = new Date(year, month - 1);
  return cardDate < now;
}

export class CardValidation {
  static validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');

    // Check if it's 16 digits
    if (!/^[0-9]{16}$/.test(cleanNumber)) {
      return false;
    }

    // Use Luhn algorithm
    return luhnCheck(cleanNumber);
  }

  static validateExpiryDate(month: number, year: number): boolean {
    if (month < 1 || month > 12) {
      return false;
    }

    if (year < new Date().getFullYear()) {
      return false;
    }

    return !isCardExpired(month, year);
  }

  static validateCVV(cvv: string): boolean {
    return /^[0-9]{3,4}$/.test(cvv);
  }

  static getCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');

    if (/^4/.test(cleanNumber)) {
      return 'VISA';
    } else if (/^5[1-5]/.test(cleanNumber)) {
      return 'MASTERCARD';
    } else if (/^3[47]/.test(cleanNumber)) {
      return 'AMEX';
    } else if (/^6/.test(cleanNumber)) {
      return 'DISCOVER';
    }

    return 'UNKNOWN';
  }

  static validateCard(card: {
    number: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.validateCardNumber(card.number)) {
      errors.push('Invalid card number');
    }

    if (!this.validateExpiryDate(card.expiryMonth, card.expiryYear)) {
      errors.push('Invalid or expired card');
    }

    if (!this.validateCVV(card.cvv)) {
      errors.push('Invalid CVV');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

