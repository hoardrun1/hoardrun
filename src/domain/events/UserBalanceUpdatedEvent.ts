// Domain Event: User Balance Updated
// Fired when a user's balance changes

import { DomainEvent } from './DomainEvent'
import { UserId } from '../value-objects/UserId'
import { Money } from '../value-objects/Money'

export class UserBalanceUpdatedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly previousBalance: Money,
    public readonly newBalance: Money
  ) {
    super()
  }

  getEventName(): string {
    return 'UserBalanceUpdated'
  }

  getAggregateId(): string {
    return this.userId.value
  }

  getBalanceChange(): Money {
    return this.newBalance.subtract(this.previousBalance)
  }
}
