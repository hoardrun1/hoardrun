// Repository Interface (Port)
// Defines the contract for user data persistence

import { User } from '../entities/User'
import { UserId } from '../value-objects/UserId'
import { Email } from '../value-objects/Email'

export interface UserRepository {
  // Basic CRUD operations
  save(user: User): Promise<void>
  findById(id: UserId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  delete(id: UserId): Promise<void>
  
  // Query operations
  findAll(limit?: number, offset?: number): Promise<User[]>
  exists(id: UserId): Promise<boolean>
  existsByEmail(email: Email): Promise<boolean>
  
  // Business-specific queries
  findVerifiedUsers(): Promise<User[]>
  findUsersWithBalanceGreaterThan(amount: number, currency: string): Promise<User[]>
  findRecentUsers(days: number): Promise<User[]>
  
  // Batch operations
  saveMany(users: User[]): Promise<void>
  findByIds(ids: UserId[]): Promise<User[]>
  
  // Transaction support
  withTransaction<T>(operation: (repo: UserRepository) => Promise<T>): Promise<T>
}
