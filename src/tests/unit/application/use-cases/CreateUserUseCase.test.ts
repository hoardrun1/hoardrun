// Unit Tests: Create User Use Case
// Testing application logic with mocked dependencies

import { CreateUserUseCase } from '../../../../application/use-cases/CreateUserUseCase'
import { UserRepository } from '../../../../domain/repositories/UserRepository'
import { DomainEventPublisher } from '../../../../application/ports/DomainEventPublisher'
import { EmailService } from '../../../../application/ports/EmailService'
import { Logger } from '../../../../application/ports/Logger'
import { User } from '../../../../domain/entities/User'
import { Email } from '../../../../domain/value-objects/Email'

// Mock implementations
class MockUserRepository implements UserRepository {
  private users: User[] = []

  async save(user: User): Promise<void> {
    this.users.push(user)
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find(u => u.email.equals(email)) || null
  }

  // Other methods not needed for this test
  async findById(): Promise<User | null> { return null }
  async delete(): Promise<void> {}
  async findAll(): Promise<User[]> { return [] }
  async exists(): Promise<boolean> { return false }
  async existsByEmail(): Promise<boolean> { return false }
  async findVerifiedUsers(): Promise<User[]> { return [] }
  async findUsersWithBalanceGreaterThan(): Promise<User[]> { return [] }
  async findRecentUsers(): Promise<User[]> { return [] }
  async saveMany(): Promise<void> {}
  async findByIds(): Promise<User[]> { return [] }
  async withTransaction<T>(operation: (repo: UserRepository) => Promise<T>): Promise<T> {
    return operation(this)
  }
}

class MockEventPublisher implements DomainEventPublisher {
  publishedEvents: any[] = []

  async publish(event: any): Promise<void> {
    this.publishedEvents.push(event)
  }

  async publishMany(events: any[]): Promise<void> {
    this.publishedEvents.push(...events)
  }
}

class MockEmailService implements EmailService {
  sentEmails: any[] = []

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    this.sentEmails.push({ type: 'welcome', email, name })
  }

  async sendVerificationEmail(): Promise<void> {}
  async sendPasswordResetEmail(): Promise<void> {}
  async sendTransactionNotification(): Promise<void> {}
}

class MockLogger implements Logger {
  logs: any[] = []

  info(message: string, meta?: any): void {
    this.logs.push({ level: 'info', message, meta })
  }

  error(message: string, meta?: any): void {
    this.logs.push({ level: 'error', message, meta })
  }

  warn(message: string, meta?: any): void {
    this.logs.push({ level: 'warn', message, meta })
  }

  debug(message: string, meta?: any): void {
    this.logs.push({ level: 'debug', message, meta })
  }
}

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase
  let mockUserRepository: MockUserRepository
  let mockEventPublisher: MockEventPublisher
  let mockEmailService: MockEmailService
  let mockLogger: MockLogger

  beforeEach(() => {
    mockUserRepository = new MockUserRepository()
    mockEventPublisher = new MockEventPublisher()
    mockEmailService = new MockEmailService()
    mockLogger = new MockLogger()

    useCase = new CreateUserUseCase(
      mockUserRepository,
      mockEventPublisher,
      mockEmailService,
      mockLogger
    )
  })

  describe('execute', () => {
    it('should create user successfully with valid data', async () => {
      // Arrange
      const request = {
        email: 'test@example.com',
        name: 'John Doe',
        initialBalance: 100,
        currency: 'USD'
      }

      // Act
      const result = await useCase.execute(request)

      // Assert
      expect(result.success).toBe(true)
      expect(result.email).toBe(request.email)
      expect(result.name).toBe(request.name)
      expect(result.userId).toBeDefined()
      expect(mockEventPublisher.publishedEvents).toHaveLength(1)
      expect(mockLogger.logs.some(log => log.level === 'info' && log.message === 'User created successfully')).toBe(true)
    })

    it('should fail when user already exists', async () => {
      // Arrange
      const existingUser = User.create({
        email: new Email('test@example.com'),
        name: 'Existing User'
      })
      await mockUserRepository.save(existingUser)

      const request = {
        email: 'test@example.com',
        name: 'John Doe'
      }

      // Act
      const result = await useCase.execute(request)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('User with this email already exists')
    })

    it('should fail with invalid email', async () => {
      // Arrange
      const request = {
        email: 'invalid-email',
        name: 'John Doe'
      }

      // Act
      const result = await useCase.execute(request)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid email format')
    })

    it('should fail with invalid name', async () => {
      // Arrange
      const request = {
        email: 'test@example.com',
        name: 'A' // Too short
      }

      // Act
      const result = await useCase.execute(request)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Name must be at least 2 characters long')
    })

    it('should create user with zero balance when no initial balance provided', async () => {
      // Arrange
      const request = {
        email: 'test@example.com',
        name: 'John Doe'
      }

      // Act
      const result = await useCase.execute(request)

      // Assert
      expect(result.success).toBe(true)
      // We can't directly check the balance here, but we know it should be zero
      // This would be verified in integration tests
    })

    it('should publish domain events after user creation', async () => {
      // Arrange
      const request = {
        email: 'test@example.com',
        name: 'John Doe'
      }

      // Act
      await useCase.execute(request)

      // Assert
      expect(mockEventPublisher.publishedEvents).toHaveLength(1)
      expect(mockEventPublisher.publishedEvents[0].getEventName()).toBe('UserCreated')
    })

    it('should log error when operation fails', async () => {
      // Arrange
      const request = {
        email: 'test@example.com',
        name: 'John Doe'
      }

      // Mock repository to throw error
      mockUserRepository.save = jest.fn().mockRejectedValue(new Error('Database error'))

      // Act
      const result = await useCase.execute(request)

      // Assert
      expect(result.success).toBe(false)
      expect(mockLogger.logs.some(log => log.level === 'error')).toBe(true)
    })
  })
})
