import { prisma } from './prisma'
import { customAlphabet } from 'nanoid'
import { TransactionType, TransactionStatus } from '@prisma/client'

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
  type: TransactionType,
  amount: number,
  description?: string,
  beneficiaryId?: string
) {
  return await prisma.$transaction(async (prisma) => {
    // Get account and lock it for update
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    })

    if (!account) {
      throw new Error('Account not found')
    }

    // Check if account belongs to user
    if (account.userId !== userId) {
      throw new Error('Unauthorized')
    }

    // Check if account is active
    if (!account.isActive) {
      throw new Error('Account is inactive')
    }

    // Generate unique reference
    const reference = await generateTransactionReference()

    // Calculate new balance based on transaction type
    let newBalance = account.balance
    switch (type) {
      case 'DEPOSIT':
        newBalance += amount
        break
      case 'WITHDRAWAL':
      case 'TRANSFER':
      case 'PAYMENT':
        if (account.balance < amount) {
          throw new Error('Insufficient funds')
        }
        newBalance -= amount
        break
      case 'REFUND':
        newBalance += amount
        break
      default:
        throw new Error('Invalid transaction type')
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type,
        amount,
        description,
        reference,
        beneficiaryId,
        status: TransactionStatus.COMPLETED,
        currency: account.currency,
      },
    })

    // Update account balance
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance },
    })

    return {
      transaction,
      newBalance,
    }
  })
}

export async function validateTransactionAmount(amount: number): Promise<boolean> {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }
  if (amount > 1000000) {
    throw new Error('Amount exceeds maximum limit')
  }
  return true
}

export async function validateBeneficiary(
  userId: string,
  beneficiaryId: string
): Promise<boolean> {
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id: beneficiaryId },
  })

  if (!beneficiary) {
    throw new Error('Beneficiary not found')
  }

  if (beneficiary.userId !== userId) {
    throw new Error('Unauthorized beneficiary')
  }

  if (!beneficiary.isActive) {
    throw new Error('Beneficiary is inactive')
  }

  return true
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
  page = 1,
  limit = 10,
  type?: TransactionType,
  startDate?: Date,
  endDate?: Date
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
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  }
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function calculateTransactionFee(
  amount: number,
  type: TransactionType
): number {
  switch (type) {
    case 'TRANSFER':
      return Math.min(amount * 0.005, 10) // 0.5% with max $10
    case 'WITHDRAWAL':
      return Math.min(amount * 0.01, 5) // 1% with max $5
    default:
      return 0
  }
} 