import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createClient } from '@prisma/client'
import { logger } from '../logger'

const prisma = createClient()

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        role: string
      }
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      role: string
    }

    // Check if token is blacklisted
    const isBlacklisted = await prisma.tokenBlacklist.findUnique({
      where: { token }
    })
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token is invalid' })
    }

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }

    req.user = decoded
    next()
  } catch (error) {
    logger.error('Authentication failed', { error })
    return res.status(401).json({ error: 'Invalid token' })
  }
} 