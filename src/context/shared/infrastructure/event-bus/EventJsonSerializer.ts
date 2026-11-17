import { Event } from '@shared/domain/event/Event';

export class EventJsonSerializer {
  static serialize(event: Event<string, unknown>): string {
    return JSON.stringify({
      data: event.toPrimitives(),
    });
  }
}
