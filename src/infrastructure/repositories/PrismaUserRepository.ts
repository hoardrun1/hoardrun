// Infrastructure: Prisma User Repository
// Concrete implementation of UserRepository using Prisma

import { PrismaClient } from '@prisma/client'
import { User, UserSnapshot } from '../../domain/entities/User'
import { UserId } from '../../domain/value-objects/UserId'
import { Email } from '../../domain/value-objects/Email'
import { UserRepository } from '../../domain/repositories/UserRepository'

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    const snapshot = user.toSnapshot()
    
    await this.prisma.user.upsert({
      where: { id: snapshot.id },
      update: {
        email: snapshot.email,
        name: snapshot.name,
        balance: snapshot.balance,
        currency: snapshot.currency,
        isEmailVerified: snapshot.isEmailVerified,
        updatedAt: snapshot.updatedAt
      },
      create: {
        id: snapshot.id,
        email: snapshot.email,
        name: snapshot.name,
        balance: snapshot.balance,
        currency: snapshot.currency,
        isEmailVerified: snapshot.isEmailVerified,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt
      }
    })
  }

  async findById(id: UserId): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id: id.value }
    })

    if (!userData) return null

    return User.fromSnapshot({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      balance: userData.balance.toNumber(),
      currency: userData.currency,
      isEmailVerified: userData.isEmailVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    })
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email: email.value }
    })

    if (!userData) return null

    return User.fromSnapshot({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      balance: userData.balance.toNumber(),
      currency: userData.currency,
      isEmailVerified: userData.isEmailVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    })
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.value }
    })
  }

  async findAll(limit = 100, offset = 0): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    })

    return users.map(userData => User.fromSnapshot({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      balance: userData.balance.toNumber(),
      currency: userData.currency,
      isEmailVerified: userData.isEmailVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    }))
  }

  async exists(id: UserId): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id: id.value }
    })
    return count > 0
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.value }
    })
    return count > 0
  }

  async findVerifiedUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { isEmailVerified: true },
      orderBy: { createdAt: 'desc' }
    })

    return users.map(userData => User.fromSnapshot({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      balance: userData.balance.toNumber(),
      currency: userData.currency,
      isEmailVerified: userData.isEmailVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    }))
  }

  async findUsersWithBalanceGreaterThan(amount: number, currency: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        balance: { gte: amount },
        currency: currency
      },
      orderBy: { balance: 'desc' }
    })

    return users.map(userData => User.fromSnapshot({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      balance: userData.balance.toNumber(),
      currency: userData.currency,
      isEmailVerified: userData.isEmailVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    }))
  }

  async findRecentUsers(days: number): Promise<User[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: { gte: cutoffDate }
      },
      orderBy: { createdAt: 'desc' }
    })

    return users.map(userData => User.fromSnapshot({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      balance: userData.balance.toNumber(),
      currency: userData.currency,
      isEmailVerified: userData.isEmailVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    }))
  }

  async saveMany(users: User[]): Promise<void> {
    const snapshots = users.map(user => user.toSnapshot())
    
    await this.prisma.$transaction(
      snapshots.map(snapshot => 
        this.prisma.user.upsert({
          where: { id: snapshot.id },
          update: {
            email: snapshot.email,
            name: snapshot.name,
            balance: snapshot.balance,
            currency: snapshot.currency,
            isEmailVerified: snapshot.isEmailVerified,
            updatedAt: snapshot.updatedAt
          },
          create: {
            id: snapshot.id,
            email: snapshot.email,
            name: snapshot.name,
            balance: snapshot.balance,
            currency: snapshot.currency,
            isEmailVerified: snapshot.isEmailVerified,
            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt
          }
        })
      )
    )
  }

  async findByIds(ids: UserId[]): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: ids.map(id => id.value) }
      }
    })

    return users.map(userData => User.fromSnapshot({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      balance: userData.balance.toNumber(),
      currency: userData.currency,
      isEmailVerified: userData.isEmailVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    }))
  }

  async withTransaction<T>(operation: (repo: UserRepository) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      const transactionalRepo = new PrismaUserRepository(tx as PrismaClient)
      return await operation(transactionalRepo)
    })
  }
}
