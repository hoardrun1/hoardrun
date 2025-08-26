import { prisma } from './prisma'
import { customAlphabet } from 'nanoid'

// Define transaction types - compatible with Prisma schema
export type TransactionType = 'SEND' | 'RECEIVE' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT' | 'REFUND' | 'FEE'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

// Generate account number using nanoid
const generateNumericId = customAlphabet('0123456789', 10)

export async function generateAccountNumber(): Promise<string> {
  let accountNumber: string
  let isUnique = false

  while (!isUnique) {
    accountNumber = generateNumericId()
    const existingAccount = await prisma.account.findUnique({
      where: { number: accountNumber },
    })
    if (!existingAccount) {
      isUnique = true
      return accountNumber
    }
  }

  throw new Error('Failed to generate unique account number')
}

export async function generateTransactionReference(): Promise<string> {
  const prefix = 'TRX'
  const timestamp = Date.now().toString(36)
  const randomPart = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8)()
  return `${prefix}${timestamp}${randomPart}`
}

export async function processTransaction(
  userId: string,
  accountId: string,
  type: string,
  amount: number,
  description?: string,
  beneficiaryId?: string,
) {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
      isActive: true,
    },
  })

  if (!account) {
    throw new Error('Invalid account')
  }

  if (type !== 'DEPOSIT' && amount > account.balance) {
    throw new Error('Insufficient funds')
  }

  const fee = calculateTransactionFee(amount, type)
  const totalAmount = amount + fee

  const transaction = await prisma.$transaction(async (tx: any) => {
    // Create transaction record
    const newTransaction = await tx.transaction.create({
      data: {
        userId,
        type: type as any,
        amount,
        description,
        beneficiaryId,
        status: 'COMPLETED',
        fee,
      },
    })

    // Update account balance
    const updatedAccount = await tx.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: type === 'DEPOSIT' ? amount : -totalAmount,
        },
      },
    })

    // Update beneficiary account if it's a transfer
    if (type === 'TRANSFER' && beneficiaryId) {
      await tx.beneficiary.update({
        where: { id: beneficiaryId },
        data: {
          lastTransactionDate: new Date(),
          transactionCount: {
            increment: 1,
          },
        },
      })
    }

    return {
      transaction: newTransaction,
      newBalance: updatedAccount.balance,
    }
  })

  return transaction
}

export async function validateTransactionAmount(amount: number): Promise<void> {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Invalid amount format');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  if (amount > 1000000) {
    throw new Error('Amount exceeds maximum transaction limit');
  }
}

export async function validateBeneficiary(userId: string, beneficiaryId: string): Promise<void> {
  const beneficiary = await prisma.beneficiary.findFirst({
    where: {
      id: beneficiaryId,
      userId,
      isActive: true,
    },
  })

  if (!beneficiary) {
    throw new Error('Invalid beneficiary')
  }
}

export async function getAccountBalance(accountId: string): Promise<number> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { balance: true },
  })

  if (!account) {
    throw new Error('Account not found')
  }

  return account.balance
}

export async function getTransactionHistory(
  accountId: string,
  userId: string,
  page: number = 1,
  limit: number = 10,
  type?: string,
  startDate?: Date,
  endDate?: Date,
) {
  const where = {
    accountId,
    userId,
    ...(type && { type }),
    ...(startDate && endDate && {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }),
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        beneficiary: {
          select: {
            name: true,
            accountNumber: true,
            bankName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ])

  return {
    transactions,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: page,
      limit,
    },
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function calculateTransactionFee(amount: number, type: string): number {
  const feeRates = {
    TRANSFER: 0.001, // 0.1%
    WITHDRAWAL: 0.002, // 0.2%
    INVESTMENT: 0.0015, // 0.15%
  }

  const rate = feeRates[type as keyof typeof feeRates] || 0
  return Math.round((amount * rate) * 100) / 100
}

export function calculateInterestRate(balance: number): number {
  // Progressive interest rates based on balance
  if (balance >= 100000) return 0.03 // 3%
  if (balance >= 50000) return 0.025 // 2.5%
  if (balance >= 10000) return 0.02 // 2%
  return 0.015 // 1.5%
}

export function calculateMonthlyInterest(balance: number, rate: number): number {
  return balance * (rate / 12)
}

export function calculateCompoundInterest(
  principal: number,
  rate: number,
  years: number,
  compoundingFrequency: number = 12
): number {
  return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * years)
}

export function calculateSavingsGoal(
  targetAmount: number,
  currentAmount: number,
  monthlyContribution: number,
  annualRate: number = 0.02
): number {
  const monthlyRate = annualRate / 12
  const remainingAmount = targetAmount - currentAmount
  
  // Calculate number of months needed to reach goal
  return Math.ceil(
    Math.log(1 + (remainingAmount * monthlyRate) / monthlyContribution) /
    Math.log(1 + monthlyRate)
  )
}

export function validateAccountNumber(accountNumber: string): boolean {
  // Basic account number validation (example format: 16 digits)
  const accountNumberRegex = /^\d{16}$/
  return accountNumberRegex.test(accountNumber)
}

export function validateRoutingNumber(routingNumber: string): boolean {
  // Basic routing number validation (example format: 9 digits)
  const routingNumberRegex = /^\d{9}$/
  return routingNumberRegex.test(routingNumber)
}

export function calculateTransactionLimit(
  accountType: string,
  accountAge: number,
  creditScore?: number
): number {
  let baseLimit = 0

  switch (accountType.toUpperCase()) {
    case 'SAVINGS':
      baseLimit = 10000
      break
    case 'CHECKING':
      baseLimit = 5000
      break
    case 'INVESTMENT':
      baseLimit = 50000
      break
    default:
      baseLimit = 1000
  }

  // Adjust limit based on account age (in months)
  const ageMultiplier = Math.min(accountAge / 12, 2) // Cap at 2x after 2 years
  baseLimit *= (1 + ageMultiplier)

  // Adjust limit based on credit score if available
  if (creditScore) {
    const creditMultiplier = creditScore >= 700 ? 1.5 : creditScore >= 650 ? 1.2 : 1
    baseLimit *= creditMultiplier
  }

  return Math.round(baseLimit)
}

export function calculateSavingsProjection(
  currentAmount: number,
  monthlyContribution: number,
  annualInterestRate: number,
  years: number,
): number[] {
  const monthlyRate = annualInterestRate / 12 / 100
  const months = years * 12
  const projection: number[] = []

  let balance = currentAmount
  for (let i = 1; i <= months; i++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution
    if (i % 12 === 0) {
      projection.push(Math.round(balance * 100) / 100)
    }
  }

  return projection
}

export function calculateInvestmentReturns(
  principal: number,
  annualReturn: number,
  years: number,
  compoundingFrequency: 'monthly' | 'quarterly' | 'annually' = 'annually',
): number {
  const frequencyMap = {
    monthly: 12,
    quarterly: 4,
    annually: 1,
  }

  const n = frequencyMap[compoundingFrequency]
  const r = annualReturn / 100
  const t = years

  const amount = principal * Math.pow(1 + r/n, n * t)
  return Math.round(amount * 100) / 100
}

export function calculateLoanPayment(
  principal: number,
  annualInterestRate: number,
  years: number,
): {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
} {
  const monthlyRate = annualInterestRate / 12 / 100
  const numberOfPayments = years * 12

  const monthlyPayment = 
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

  const totalPayment = monthlyPayment * numberOfPayments
  const totalInterest = totalPayment - principal

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
  }
} 
