export const momoErrorCodes = {
  API_KEY_GENERATION_FAILED: 'MOMO001',
  AUTH_TOKEN_FAILED: 'MOMO002',
  PAYMENT_REQUEST_FAILED: 'MOMO003',
  STATUS_CHECK_FAILED: 'MOMO004',
  BALANCE_CHECK_FAILED: 'MOMO005',
  NOTIFICATION_FAILED: 'MOMO006',
  VALIDATION_FAILED: 'MOMO007',
  INSUFFICIENT_FUNDS: 'MOMO008',
  INVALID_PHONE: 'MOMO009',
  USER_NOT_FOUND: 'MOMO010',
  SYSTEM_ERROR: 'MOMO999',
} as const;

export class MomoError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'MomoError';
  }
}
