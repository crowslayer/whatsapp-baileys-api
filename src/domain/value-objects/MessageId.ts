import { v4 as uuidv4 } from 'uuid';

import { ValueObject } from '@shared/domain/ValueObject';
import { ValidationError } from '@shared/infrastructure/errors/ValidationError';

export class MessageId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(): MessageId {
    return new MessageId(uuidv4());
  }

  static fromString(value: string): MessageId {
    return new MessageId(value);
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new ValidationError([{ field: 'messageId', message: 'messageId cannot be empty' }]);
    }
  }
}
