// Use Case: Create User
// Application service that orchestrates user creation

import { User } from '../../domain/entities/User'
import { Email } from '../../domain/value-objects/Email'
import { Money } from '../../domain/value-objects/Money'
import { UserRepository } from '../../domain/repositories/UserRepository'
import { DomainEventPublisher } from '../ports/DomainEventPublisher'
import { EmailService } from '../ports/EmailService'
import { Logger } from '../ports/Logger'

export interface CreateUserRequest {
  email: string
  name: string
  initialBalance?: number
  currency?: string
}

export interface CreateUserResponse {
  userId: string
  email: string
  name: string
  success: boolean
  message: string
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: DomainEventPublisher,
    private readonly emailService: EmailService,
    private readonly logger: Logger
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      // Validate input
      const email = new Email(request.email)
      
      if (!request.name || request.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long')
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email)
      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Create user entity
      const initialBalance = request.initialBalance 
        ? new Money(request.initialBalance, request.currency || 'USD')
        : undefined

      const user = User.create({
        email,
        name: request.name.trim(),
        initialBalance
      })

      // Save user
      await this.userRepository.save(user)

      // Publish domain events
      const events = user.domainEvents
      for (const event of events) {
        await this.eventPublisher.publish(event)
      }
      user.clearDomainEvents()

      // Send welcome email (async, don't wait)
      this.emailService.sendWelcomeEmail(email.value, user.name)
        .catch(error => this.logger.error('Failed to send welcome email', { error, userId: user.id.value }))

      this.logger.info('User created successfully', { 
        userId: user.id.value, 
        email: user.email.value 
      })

      return {
        userId: user.id.value,
        email: user.email.value,
        name: user.name,
        success: true,
        message: 'User created successfully'
      }

    } catch (error) {
      this.logger.error('Failed to create user', { error, request })
      
      return {
        userId: '',
        email: request.email,
        name: request.name,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create user'
      }
    }
  }
}
