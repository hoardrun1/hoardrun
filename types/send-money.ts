// Transaction types
export interface Transaction {
  id: string
  userId: string
  accountId: string
  type: TransactionType
  amount: number
  currency: string
  description?: string
  status: TransactionStatus
  beneficiaryId?: string
  createdAt: string
  updatedAt: string
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT' | 'REFUND'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'

export interface CreateTransactionData {
  accountId: string
  type: TransactionType
  amount: number
  description?: string
  beneficiaryId?: string
}

// Preview interface for transaction details
export interface TransactionPreview {
  amount: number
  fee: number
  total: number
  estimatedTime: string
}

// Beneficiary types
export interface Beneficiary {
  id: string
  userId: string
  name: string
  accountNumber: string
  bankName: string
  bankCode?: string
  email?: string
  phoneNumber?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBeneficiaryData {
  name: string
  accountNumber: string
  bankName: string
  bankCode?: string
  email?: string
  phoneNumber?: string
}

// Account types
export interface Account {
  id: string
  userId: string
  type: AccountType
  number: string
  balance: number
  currency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AccountType = 'SAVINGS' | 'CHECKING' | 'INVESTMENT'

// Error types
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
}

// Component Props
export interface SendMoneyFormProps {
  onSubmit: (data: CreateTransactionData) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export interface BeneficiaryListProps {
  beneficiaries: Beneficiary[]
  selectedId?: string
  onSelect: (id: string) => void
  isLoading?: boolean
  error?: string | null
}

export interface TransactionPreviewProps {
  preview: TransactionPreview
  currency?: string
}

// Loading and Error States
export interface LoadingState {
  isLoading: boolean
  error: string | null
} 