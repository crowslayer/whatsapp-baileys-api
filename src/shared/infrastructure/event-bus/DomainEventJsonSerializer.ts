import { DomainEvent } from '@shared/domain/DomainEvent';

export class DomainEventJsonSerializer {
  static serialize(event: DomainEvent<string, unknown>): string {
    return JSON.stringify({
      data: event.toPrimitives(),
    });
  }
}
