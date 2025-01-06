import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Test database connection with retries
const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds

async function connectWithRetry(retries = MAX_RETRIES) {
  try {
    await prisma.$connect()
    console.log('Successfully connected to the database')
  } catch (error) {
    console.error(`Failed to connect to the database (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error)
    
    if (retries > 1) {
      console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return connectWithRetry(retries - 1)
    } else {
      console.error('Max retries reached. Could not connect to the database.')
      // Don't exit the process, let the application handle the error
      return false
    }
  }
  return true
}

// Initialize connection
connectWithRetry()
  .catch(console.error)

export default prisma 