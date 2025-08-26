// Domain Event: User Created
// Fired when a new user is created

import { DomainEvent } from './DomainEvent'
import { UserId } from '../value-objects/UserId'
import { Email } from '../value-objects/Email'

export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: Email
  ) {
    super()
  }

  getEventName(): string {
    return 'UserCreated'
  }

  getAggregateId(): string {
    return this.userId.value
  }
}
