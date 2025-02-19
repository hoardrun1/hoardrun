import express from 'express'
import next from 'next'
import http from 'http'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { createClient } from '@prisma/client'
import { Queue } from 'bull'
import winston from 'winston'
import FinanceWebSocketServer from './websocket-server'
import { authMiddleware } from './middleware/auth'
import { errorHandler } from './middleware/error-handler'
import { setupMonitoring } from './monitoring'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const prisma = createClient()

// Setup Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

// Setup transaction queue
const transactionQueue = new Queue('transactions', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
})

// Process transactions in queue
transactionQueue.process(async (job) => {
  const { userId, type, amount } = job.data
  
  try {
    await prisma.$transaction(async (tx) => {
      // Update user balance
      const user = await tx.user.findUnique({ where: { id: userId } })
      if (!user) throw new Error('User not found')

      const newBalance = type === 'deposit' 
        ? user.balance + amount 
        : user.balance - amount

      if (newBalance < 0) throw new Error('Insufficient funds')

      await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance }
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type,
          amount,
          status: 'completed'
        }
      })

      logger.info('Transaction processed', { userId, type, amount, newBalance })
      return newBalance
    })
  } catch (error) {
    logger.error('Transaction failed', { userId, type, amount, error })
    throw error
  }
})

app.prepare().then(() => {
  const server = express()
  const httpServer = http.createServer(server)

  // Setup WebSocket server
  const wss = new FinanceWebSocketServer(httpServer)

  // Security middleware
  server.use(helmet())
  server.use(express.json())
  server.use(express.urlencoded({ extended: true }))

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  })
  server.use('/api/', limiter)

  // Authentication middleware
  server.use('/api/', authMiddleware)

  // Setup monitoring
  setupMonitoring(server)

  // API routes
  server.post('/api/balance/update', async (req, res) => {
    try {
      const { userId } = req.user
      const { amount, type } = req.body

      // Add job to queue
      await transactionQueue.add({
        userId,
        type,
        amount,
        timestamp: new Date()
      })

      res.json({ status: 'pending', message: 'Transaction queued' })
    } catch (error) {
      logger.error('Balance update failed', { error })
      res.status(500).json({ error: 'Failed to update balance' })
    }
  })

  // Error handling
  server.use(errorHandler)

  // Handle Next.js requests
  server.all('*', (req, res) => {
    return handle(req, res)
  })

  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
  })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Starting graceful shutdown...')
  
  await Promise.all([
    new Promise(resolve => transactionQueue.close().then(resolve)),
    new Promise(resolve => prisma.$disconnect().then(resolve)),
    new Promise(resolve => httpServer.close(resolve))
  ])
  
  logger.info('Graceful shutdown completed')
  process.exit(0)
}) 