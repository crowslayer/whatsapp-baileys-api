import { v4 as uuidv4 } from 'uuid';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { ValueObject } from '@shared/domain/value-object/ValueObject';

export class EventId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(): EventId {
    return new EventId(uuidv4());
  }

  static fromString(value: string): EventId {
    return new EventId(value);
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new ValidationError([{ field: 'eventId', message: 'EventId cannot be empty' }]);
    }
  }
}
