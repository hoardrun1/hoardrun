// Domain Entity: User
// Represents the core business concept of a User in the financial system

import { Email } from '../value-objects/Email'
import { UserId } from '../value-objects/UserId'
import { Money } from '../value-objects/Money'
import { DomainEvent } from '../events/DomainEvent'
import { UserCreatedEvent } from '../events/UserCreatedEvent'
import { UserBalanceUpdatedEvent } from '../events/UserBalanceUpdatedEvent'

export interface UserProps {
  id: UserId
  email: Email
  name: string
  balance: Money
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export class User {
  private _id: UserId
  private _email: Email
  private _name: string
  private _balance: Money
  private _isEmailVerified: boolean
  private _createdAt: Date
  private _updatedAt: Date
  private _domainEvents: DomainEvent[] = []

  constructor(props: UserProps) {
    this._id = props.id
    this._email = props.email
    this._name = props.name
    this._balance = props.balance
    this._isEmailVerified = props.isEmailVerified
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  // Factory method for creating new users
  static create(props: {
    email: Email
    name: string
    initialBalance?: Money
  }): User {
    const user = new User({
      id: UserId.generate(),
      email: props.email,
      name: props.name,
      balance: props.initialBalance || Money.zero('USD'),
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    user.addDomainEvent(new UserCreatedEvent(user._id, user._email))
    return user
  }

  // Getters (following encapsulation principle)
  get id(): UserId { return this._id }
  get email(): Email { return this._email }
  get name(): string { return this._name }
  get balance(): Money { return this._balance }
  get isEmailVerified(): boolean { return this._isEmailVerified }
  get createdAt(): Date { return this._createdAt }
  get updatedAt(): Date { return this._updatedAt }
  get domainEvents(): DomainEvent[] { return [...this._domainEvents] }

  // Business methods
  verifyEmail(): void {
    if (this._isEmailVerified) {
      throw new Error('Email is already verified')
    }
    this._isEmailVerified = true
    this._updatedAt = new Date()
  }

  updateBalance(newBalance: Money): void {
    if (!newBalance.currency.equals(this._balance.currency)) {
      throw new Error('Currency mismatch in balance update')
    }

    const oldBalance = this._balance
    this._balance = newBalance
    this._updatedAt = new Date()

    this.addDomainEvent(new UserBalanceUpdatedEvent(
      this._id,
      oldBalance,
      newBalance
    ))
  }

  debit(amount: Money): void {
    if (!amount.currency.equals(this._balance.currency)) {
      throw new Error('Currency mismatch in debit operation')
    }

    if (this._balance.isLessThan(amount)) {
      throw new Error('Insufficient funds')
    }

    this.updateBalance(this._balance.subtract(amount))
  }

  credit(amount: Money): void {
    if (!amount.currency.equals(this._balance.currency)) {
      throw new Error('Currency mismatch in credit operation')
    }

    this.updateBalance(this._balance.add(amount))
  }

  changeName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long')
    }
    this._name = newName.trim()
    this._updatedAt = new Date()
  }

  // Domain event management
  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  clearDomainEvents(): void {
    this._domainEvents = []
  }

  // Equality check
  equals(other: User): boolean {
    return this._id.equals(other._id)
  }

  // Serialization for persistence
  toSnapshot(): UserSnapshot {
    return {
      id: this._id.value,
      email: this._email.value,
      name: this._name,
      balance: this._balance.amount,
      currency: this._balance.currency.code,
      isEmailVerified: this._isEmailVerified,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    }
  }

  static fromSnapshot(snapshot: UserSnapshot): User {
    return new User({
      id: new UserId(snapshot.id),
      email: new Email(snapshot.email),
      name: snapshot.name,
      balance: new Money(snapshot.balance, snapshot.currency),
      isEmailVerified: snapshot.isEmailVerified,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    })
  }
}

export interface UserSnapshot {
  id: string
  email: string
  name: string
  balance: number
  currency: string
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}
