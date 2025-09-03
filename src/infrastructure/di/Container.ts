// Dependency Injection Container
// Simple IoC container for managing dependencies

type Constructor<T = {}> = new (...args: any[]) => T
type Factory<T> = () => T
type ServiceDefinition<T> = Constructor<T> | Factory<T> | T

interface ServiceRegistration<T> {
  definition: ServiceDefinition<T>
  singleton: boolean
  instance?: T
}

export class Container {
  private services = new Map<string | symbol, ServiceRegistration<any>>()

  // Register a service
  register<T>(
    token: string | symbol,
    definition: ServiceDefinition<T>,
    options: { singleton?: boolean } = {}
  ): void {
    this.services.set(token, {
      definition,
      singleton: options.singleton ?? true,
    })
  }

  // Register a singleton service
  registerSingleton<T>(token: string | symbol, definition: ServiceDefinition<T>): void {
    this.register(token, definition, { singleton: true })
  }

  // Register a transient service
  registerTransient<T>(token: string | symbol, definition: ServiceDefinition<T>): void {
    this.register(token, definition, { singleton: false })
  }

  // Resolve a service
  resolve<T>(token: string | symbol): T {
    const registration = this.services.get(token)
    
    if (!registration) {
      throw new Error(`Service not registered: ${String(token)}`)
    }

    // Return cached instance for singletons
    if (registration.singleton && registration.instance) {
      return registration.instance
    }

    // Create new instance
    const instance = this.createInstance(registration.definition)

    // Cache singleton instances
    if (registration.singleton) {
      registration.instance = instance
    }

    return instance
  }

  // Check if a service is registered
  has(token: string | symbol): boolean {
    return this.services.has(token)
  }

  // Clear all registrations
  clear(): void {
    this.services.clear()
  }

  // Create instance from definition
  private createInstance<T>(definition: ServiceDefinition<T>): T {
    if (typeof definition === 'function') {
      // Check if it's a constructor or factory function
      if (this.isConstructor(definition)) {
        return new (definition as Constructor<T>)()
      } else {
        return (definition as Factory<T>)()
      }
    } else {
      // It's already an instance
      return definition
    }
  }

  // Check if a function is a constructor
  private isConstructor(func: Function): boolean {
    return func.prototype && func.prototype.constructor === func
  }

  // Create a child container (for scoped dependencies)
  createChild(): Container {
    const child = new Container()
    // Copy parent registrations
    this.services.forEach((registration, token) => {
      child.services.set(token, { ...registration })
    })
    return child
  }
}

// Service tokens (symbols for type safety)
export const TOKENS = {
  // Repositories
  USER_REPOSITORY: Symbol('UserRepository'),
  TRANSACTION_REPOSITORY: Symbol('TransactionRepository'),
  INVESTMENT_REPOSITORY: Symbol('InvestmentRepository'),

  // Services
  EMAIL_SERVICE: Symbol('EmailService'),
  LOGGER: Symbol('Logger'),
  DOMAIN_EVENT_PUBLISHER: Symbol('DomainEventPublisher'),
  CACHE_SERVICE: Symbol('CacheService'),

  // Use Cases
  CREATE_USER_USE_CASE: Symbol('CreateUserUseCase'),
  UPDATE_USER_BALANCE_USE_CASE: Symbol('UpdateUserBalanceUseCase'),
  VERIFY_USER_EMAIL_USE_CASE: Symbol('VerifyUserEmailUseCase'),

  // External Services
  PRISMA_CLIENT: Symbol('PrismaClient'),
  REDIS_CLIENT: Symbol('RedisClient'),

  // Configuration
  DATABASE_CONFIG: Symbol('DatabaseConfig'),
  EMAIL_CONFIG: Symbol('EmailConfig'),
  APP_CONFIG: Symbol('AppConfig'),
} as const

// Global container instance
export const container = new Container()
