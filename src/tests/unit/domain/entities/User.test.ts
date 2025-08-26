// Unit Tests: User Entity
// Testing domain logic in isolation

import { User } from '../../../../domain/entities/User'
import { Email } from '../../../../domain/value-objects/Email'
import { Money } from '../../../../domain/value-objects/Money'
import { UserId } from '../../../../domain/value-objects/UserId'
import { UserCreatedEvent } from '../../../../domain/events/UserCreatedEvent'
import { UserBalanceUpdatedEvent } from '../../../../domain/events/UserBalanceUpdatedEvent'

describe('User Entity', () => {
  describe('User.create', () => {
    it('should create a new user with valid data', () => {
      // Arrange
      const email = new Email('test@example.com')
      const name = 'John Doe'
      const initialBalance = new Money(100, 'USD')

      // Act
      const user = User.create({ email, name, initialBalance })

      // Assert
      expect(user.email).toEqual(email)
      expect(user.name).toBe(name)
      expect(user.balance).toEqual(initialBalance)
      expect(user.isEmailVerified).toBe(false)
      expect(user.domainEvents).toHaveLength(1)
      expect(user.domainEvents[0]).toBeInstanceOf(UserCreatedEvent)
    })

    it('should create user with zero balance when no initial balance provided', () => {
      // Arrange
      const email = new Email('test@example.com')
      const name = 'John Doe'

      // Act
      const user = User.create({ email, name })

      // Assert
      expect(user.balance).toEqual(Money.zero('USD'))
    })
  })

  describe('verifyEmail', () => {
    it('should verify email when not already verified', () => {
      // Arrange
      const user = User.create({
        email: new Email('test@example.com'),
        name: 'John Doe'
      })

      // Act
      user.verifyEmail()

      // Assert
      expect(user.isEmailVerified).toBe(true)
    })

    it('should throw error when email is already verified', () => {
      // Arrange
      const user = User.create({
        email: new Email('test@example.com'),
        name: 'John Doe'
      })
      user.verifyEmail()

      // Act & Assert
      expect(() => user.verifyEmail()).toThrow('Email is already verified')
    })
  })

  describe('updateBalance', () => {
    it('should update balance and emit domain event', () => {
      // Arrange
      const user = User.create({
        email: new Email('test@example.com'),
        name: 'John Doe',
        initialBalance: new Money(100, 'USD')
      })
      user.clearDomainEvents() // Clear creation event
      const newBalance = new Money(200, 'USD')

      // Act
      user.updateBalance(newBalance)

      // Assert
      expect(user.balance).toEqual(newBalance)
      expect(user.domainEvents).toHaveLength(1)
      expect(user.domainEvents[0]).toBeInstanceOf(UserBalanceUpdatedEvent)
    })

    it('should throw error when currency mismatch', () => {
      // Arrange
      const user = User.create({
        email: new Email('test@example.com'),
        name: 'John Doe',
        initialBalance: new Money(100, 'USD')
      })
      const newBalance = new Money(200, 'EUR')

      // Act & Assert
      expect(() => user.updateBalance(newBalance)).toThrow('Currency mismatch')
    })
  })

  describe('debit', () => {
    it('should debit amount from balance', () => {
      // Arrange
      const user = User.create({
        email: new Email('test@example.com'),
        name: 'John Doe',
        initialBalance: new Money(100, 'USD')
      })
      const debitAmount = new Money(30, 'USD')

      // Act
      user.debit(debitAmount)

      // Assert
      expect(user.balance).toEqual(new Money(70, 'USD'))
    })

    it('should throw error when insufficient funds', () => {
      // Arrange
      const user = User.create({
        email: new Email('test@example.com'),
        name: 'John Doe',
        initialBalance: new Money(50, 'USD')
      })
      const debitAmount = new Money(100, 'USD')

      // Act & Assert
      expect(() => user.debit(debitAmount)).toThrow('Insufficient funds')
    })
  })

  describe('credit', () => {
    it('should credit amount to balance', () => {
      // Arrange
      const user = User.create({
        email: new Email('test@example.com'),
        name: 'John Doe',
        initialBalance: new Money(100, 'USD')
      })
      const creditAmount = new Money(50, 'USD')

      // Act
      user.credit(creditAmount)

      // Assert
      expect(user.balance).toEqual(new Money(150, 'USD'))
    })
  })

  describe('changeName', () => {
    it('should change name when valid', () => {
      // Arrange
      const user = User.create({
        email: new Email('test@example.com'),
        name: 'John Doe'
      })

      // Act
      user.changeName('Jane Smith')

      // Assert
      expect(user.name).toBe('Jane Smith')
    })

    it('should throw error when name is too short', () => {
      // Arrange
      const user = User.create({
        email: new Email('test@example.com'),
        name: 'John Doe'
      })

      // Act & Assert
      expect(() => user.changeName('A')).toThrow('Name must be at least 2 characters long')
    })
  })

  describe('equals', () => {
    it('should return true for users with same ID', () => {
      // Arrange
      const userId = UserId.generate()
      const user1 = new User({
        id: userId,
        email: new Email('test@example.com'),
        name: 'John Doe',
        balance: Money.zero('USD'),
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      const user2 = new User({
        id: userId,
        email: new Email('different@example.com'),
        name: 'Different Name',
        balance: new Money(100, 'USD'),
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Act & Assert
      expect(user1.equals(user2)).toBe(true)
    })

    it('should return false for users with different IDs', () => {
      // Arrange
      const user1 = User.create({
        email: new Email('test1@example.com'),
        name: 'John Doe'
      })
      const user2 = User.create({
        email: new Email('test2@example.com'),
        name: 'Jane Smith'
      })

      // Act & Assert
      expect(user1.equals(user2)).toBe(false)
    })
  })

  describe('serialization', () => {
    it('should serialize to snapshot and deserialize correctly', () => {
      // Arrange
      const originalUser = User.create({
        email: new Email('test@example.com'),
        name: 'John Doe',
        initialBalance: new Money(100, 'USD')
      })
      originalUser.verifyEmail()

      // Act
      const snapshot = originalUser.toSnapshot()
      const deserializedUser = User.fromSnapshot(snapshot)

      // Assert
      expect(deserializedUser.id.value).toBe(originalUser.id.value)
      expect(deserializedUser.email.value).toBe(originalUser.email.value)
      expect(deserializedUser.name).toBe(originalUser.name)
      expect(deserializedUser.balance.amount).toBe(originalUser.balance.amount)
      expect(deserializedUser.isEmailVerified).toBe(originalUser.isEmailVerified)
    })
  })
})
