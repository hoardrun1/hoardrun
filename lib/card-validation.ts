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

