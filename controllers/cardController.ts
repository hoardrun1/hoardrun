import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { APIError } from '@/middleware/error-handler'
import { generateCardNumber, encryptCardData, decryptCardData } from '@/lib/card'
import { sendCardNotification } from '@/lib/notifications'
import { RateLimiter } from '@/lib/rate-limiter'

const prisma = new PrismaClient()

// Input validation schemas
const createCardSchema = z.object({
  type: z.enum(['VISA', 'MASTERCARD', 'AMEX']),
  name: z.string().min(1).max(100),
  limit: z.number().positive().optional(),
})

const updateCardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  limit: z.number().positive().optional(),
})

const cardPinSchema = z.object({
  pin: z.string().length(4).regex(/^\d+$/),
})

export const getCards = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    // Try to get from cache first
    const cacheKey = `cards:${userId}`
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      return res.json(JSON.parse(cachedData))
    }

    // Get cards with transactions count
    const cards = await prisma.card.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Mask sensitive data
    const result = cards.map(card => ({
      id: card.id,
      type: card.type,
      number: `**** **** **** ${card.number.slice(-4)}`,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      name: card.name,
      isActive: card.isActive,
      limit: card.limit,
      balance: card.balance,
      transactionCount: card._count.transactions,
    }))

    // Cache for 5 minutes
    await cache.set(cacheKey, JSON.stringify(result), 300)

    res.json(result)
  } catch (error) {
    throw error
  }
}

export const createCard = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const data = createCardSchema.parse(req.body)

    // Check rate limiting
    if (!RateLimiter.checkLimit(`card-creation:${userId}`, 3)) {
      throw new APIError(429, 'Too many card creation attempts', 'RATE_LIMIT_EXCEEDED')
    }

    // Generate card details
    const cardNumber = generateCardNumber(data.type)
    const expiryDate = calculateExpiryDate()
    const cvv = generateCVV()

    // Encrypt sensitive data
    const encryptedData = encryptCardData({
      number: cardNumber,
      cvv,
    })

    // Create card
    const card = await prisma.card.create({
      data: {
        userId,
        type: data.type,
        number: encryptedData.number,
        expiryMonth: expiryDate.month,
        expiryYear: expiryDate.year,
        cvv: encryptedData.cvv,
        name: data.name,
        limit: data.limit,
        isActive: true,
      },
    })

    // Send notification
    await sendCardNotification(userId, {
      type: 'CARD_CREATED',
      cardType: data.type,
      lastFour: cardNumber.slice(-4),
    })

    // Return masked data
    const result = {
      ...card,
      number: `**** **** **** ${cardNumber.slice(-4)}`,
      cvv: '***',
    }

    // Invalidate cache
    await cache.delPattern(`cards:${userId}*`)

    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid card data', 'VALIDATION_ERROR', error.errors)
    }
    throw error
  }
}

export const updateCard = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const cardId = req.params.id
    const data = updateCardSchema.parse(req.body)

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId,
      },
    })

    if (!card) {
      throw new APIError(404, 'Card not found', 'NOT_FOUND')
    }

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data,
    })

    // Invalidate cache
    await cache.delPattern(`cards:${userId}*`)

    // Send notification if card status changed
    if (data.isActive !== undefined && data.isActive !== card.isActive) {
      await sendCardNotification(userId, {
        type: data.isActive ? 'CARD_ACTIVATED' : 'CARD_DEACTIVATED',
        cardType: card.type,
        lastFour: card.number.slice(-4),
      })
    }

    // Return masked data
    const result = {
      ...updatedCard,
      number: `**** **** **** ${card.number.slice(-4)}`,
      cvv: '***',
    }

    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid card data', 'VALIDATION_ERROR', error.errors)
    }
    throw error
  }
}

export const getCardDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const cardId = req.params.id

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId,
      },
    })

    if (!card) {
      throw new APIError(404, 'Card not found', 'NOT_FOUND')
    }

    // Decrypt sensitive data
    const decryptedData = decryptCardData({
      number: card.number,
      cvv: card.cvv,
    })

    // Return full card details (for secure contexts only)
    const result = {
      ...card,
      number: decryptedData.number,
      cvv: decryptedData.cvv,
    }

    res.json(result)
  } catch (error) {
    throw error
  }
}

export const setCardPin = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const cardId = req.params.id
    const { pin } = cardPinSchema.parse(req.body)

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId,
      },
    })

    if (!card) {
      throw new APIError(404, 'Card not found', 'NOT_FOUND')
    }

    // Encrypt PIN
    const encryptedPin = encryptCardData({ pin }).pin

    // Update card PIN
    await prisma.card.update({
      where: { id: cardId },
      data: {
        pin: encryptedPin,
      },
    })

    // Send notification
    await sendCardNotification(userId, {
      type: 'PIN_CHANGED',
      cardType: card.type,
      lastFour: card.number.slice(-4),
    })

    res.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(400, 'Invalid PIN', 'VALIDATION_ERROR', error.errors)
    }
    throw error
  }
}

export const lockCard = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const cardId = req.params.id

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId,
      },
    })

    if (!card) {
      throw new APIError(404, 'Card not found', 'NOT_FOUND')
    }

    await prisma.card.update({
      where: { id: cardId },
      data: {
        isActive: false,
      },
    })

    // Invalidate cache
    await cache.delPattern(`cards:${userId}*`)

    // Send notification
    await sendCardNotification(userId, {
      type: 'CARD_LOCKED',
      cardType: card.type,
      lastFour: card.number.slice(-4),
    })

    res.json({ success: true })
  } catch (error) {
    throw error
  }
}

export const unlockCard = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const cardId = req.params.id

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId,
      },
    })

    if (!card) {
      throw new APIError(404, 'Card not found', 'NOT_FOUND')
    }

    await prisma.card.update({
      where: { id: cardId },
      data: {
        isActive: true,
      },
    })

    // Invalidate cache
    await cache.delPattern(`cards:${userId}*`)

    // Send notification
    await sendCardNotification(userId, {
      type: 'CARD_UNLOCKED',
      cardType: card.type,
      lastFour: card.number.slice(-4),
    })

    res.json({ success: true })
  } catch (error) {
    throw error
  }
}

// Helper functions
const calculateExpiryDate = () => {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear() + 4, // 4 years validity
  }
}

const generateCVV = () => {
  return Math.floor(Math.random() * 900 + 100).toString()
}

export default {
  getCards,
  createCard,
  updateCard,
  getCardDetails,
  setCardPin,
  lockCard,
  unlockCard,
} 