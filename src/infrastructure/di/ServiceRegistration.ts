// Service Registration
// Configure all dependencies in the container

import { PrismaClient } from '@prisma/client'
import { Container, TOKENS } from './Container'

// Domain
import { UserRepository } from '../../domain/repositories/UserRepository'

// Application
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase'
import { EmailService } from '../../application/ports/EmailService'
import { Logger } from '../../application/ports/Logger'
import { DomainEventPublisher } from '../../application/ports/DomainEventPublisher'

// Infrastructure
import { PrismaUserRepository } from '../repositories/PrismaUserRepository'
import { NodemailerEmailService } from '../services/NodemailerEmailService'
import { WinstonLogger } from '../services/WinstonLogger'
import { InMemoryEventPublisher } from '../services/InMemoryEventPublisher'

export function registerServices(container: Container): void {
  // Configuration
  container.registerSingleton(TOKENS.APP_CONFIG, () => ({
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    databaseUrl: process.env.DATABASE_URL || '',
  }))

  container.registerSingleton(TOKENS.EMAIL_CONFIG, () => ({
    smtpHost: process.env.SMTP_HOST || 'localhost',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@hoardrun.com',
    fromName: process.env.FROM_NAME || 'HoardRun',
  }))

  // External Services
  container.registerSingleton(TOKENS.PRISMA_CLIENT, () => {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  })

  // Infrastructure Services
  container.registerSingleton<Logger>(TOKENS.LOGGER, () => new WinstonLogger())

  container.registerSingleton<EmailService>(TOKENS.EMAIL_SERVICE, () => {
    const logger = container.resolve<Logger>(TOKENS.LOGGER)
    const emailConfig = container.resolve(TOKENS.EMAIL_CONFIG)
    return new NodemailerEmailService(logger, emailConfig)
  })

  container.registerSingleton<DomainEventPublisher>(TOKENS.DOMAIN_EVENT_PUBLISHER, () => {
    const logger = container.resolve<Logger>(TOKENS.LOGGER)
    return new InMemoryEventPublisher(logger)
  })

  // Repositories
  container.registerSingleton<UserRepository>(TOKENS.USER_REPOSITORY, () => {
    const prisma = container.resolve<PrismaClient>(TOKENS.PRISMA_CLIENT)
    return new PrismaUserRepository(prisma)
  })

  // Use Cases
  container.registerTransient<CreateUserUseCase>(TOKENS.CREATE_USER_USE_CASE, () => {
    const userRepository = container.resolve<UserRepository>(TOKENS.USER_REPOSITORY)
    const eventPublisher = container.resolve<DomainEventPublisher>(TOKENS.DOMAIN_EVENT_PUBLISHER)
    const emailService = container.resolve<EmailService>(TOKENS.EMAIL_SERVICE)
    const logger = container.resolve<Logger>(TOKENS.LOGGER)

    return new CreateUserUseCase(userRepository, eventPublisher, emailService, logger)
  })
}

// Helper function to get configured container
export function getContainer(): Container {
  const container = new Container()
  registerServices(container)
  return container
}
