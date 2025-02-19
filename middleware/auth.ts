import { Request, Response, NextFunction } from 'express'
import { jwtVerify } from 'jose'
import { PrismaClient } from '@prisma/client'
import { cache } from '@/lib/cache'

const prisma = new PrismaClient()

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name?: string
      }
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    // Check token blacklist
    const isBlacklisted = await cache.get(`blacklist:${token}`)
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token has been revoked' })
    }

    // Verify token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    )

    if (!payload.sub) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    // Get user from cache or database
    const cacheKey = `user:${payload.sub}`
    let user = await cache.get(cacheKey)

    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: payload.sub as string },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })

      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }

      // Cache user for 5 minutes
      await cache.set(cacheKey, JSON.stringify(user), 300)
    } else {
      user = JSON.parse(user)
    }

    // Attach user to request
    req.user = user

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ message: 'Invalid token' })
  }
}

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' })
      }

      const userRoles = await prisma.userRole.findMany({
        where: { userId: req.user.id },
        select: { role: true },
      })

      const hasRole = userRoles.some(userRole => roles.includes(userRole.role))

      if (!hasRole) {
        return res.status(403).json({ message: 'Insufficient permissions' })
      }

      next()
    } catch (error) {
      console.error('Role middleware error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export const revokeToken = async (token: string) => {
  try {
    // Add token to blacklist with expiry matching token expiry
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    )

    if (payload.exp) {
      const ttl = payload.exp - Math.floor(Date.now() / 1000)
      await cache.set(`blacklist:${token}`, '1', ttl)
    }
  } catch (error) {
    console.error('Token revocation error:', error)
  }
}

export const refreshToken = async (userId: string) => {
  try {
    // Generate new token
    const token = await new jose.SignJWT({ sub: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET))

    return token
  } catch (error) {
    console.error('Token refresh error:', error)
    throw error
  }
}

export default auth 