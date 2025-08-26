// Infrastructure: In-Memory Event Publisher
// Simple implementation for domain event publishing

import { DomainEvent } from '../../domain/events/DomainEvent'
import { DomainEventPublisher } from '../../application/ports/DomainEventPublisher'
import { Logger } from '../../application/ports/Logger'

export class InMemoryEventPublisher implements DomainEventPublisher {
  private handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>()

  constructor(private readonly logger: Logger) {}

  async publish(event: DomainEvent): Promise<void> {
    const eventName = event.getEventName()
    const handlers = this.handlers.get(eventName) || []

    this.logger.info('Publishing domain event', {
      eventName,
      eventId: event.eventId,
      aggregateId: event.getAggregateId(),
      handlerCount: handlers.length
    })

    // Execute all handlers
    const promises = handlers.map(async (handler) => {
      try {
        await handler(event)
      } catch (error) {
        this.logger.error('Event handler failed', {
          eventName,
          eventId: event.eventId,
          error
        })
        // Don't rethrow - we don't want one handler failure to stop others
      }
    })

    await Promise.all(promises)
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    const promises = events.map(event => this.publish(event))
    await Promise.all(promises)
  }

  // Register event handlers
  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: (event: T) => Promise<void>
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, [])
    }
    this.handlers.get(eventName)!.push(handler as any)
  }

  // Unregister event handlers
  unsubscribe(eventName: string): void {
    this.handlers.delete(eventName)
  }

  // Clear all handlers
  clear(): void {
    this.handlers.clear()
  }
}
