export interface MomoTransaction {
  id: string;
  amount: number;
  currency: string;
  status: MomoTransactionStatus;
  referenceId: string;
  phone: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MomoTransactionStatus = 
  | 'PENDING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'TIMEOUT'
  | 'REJECTED';

export interface MomoPaymentRequest {
  amount: number;
  phone: string;
  message: string;
  currency?: string;
}

export interface MomoPaymentResponse {
  referenceId: string;
  status: MomoTransactionStatus;
  message?: string;
}