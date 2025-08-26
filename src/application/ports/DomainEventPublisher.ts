// Port: Domain Event Publisher
// Interface for publishing domain events

import { DomainEvent } from '../../domain/events/DomainEvent'

export interface DomainEventPublisher {
  publish(event: DomainEvent): Promise<void>
  publishMany(events: DomainEvent[]): Promise<void>
}
