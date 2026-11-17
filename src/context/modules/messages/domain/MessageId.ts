import { ValidationError } from '@shared/domain/error/ValidationError';
import { UuidValueObject } from '@shared/domain/value-object/UuidValueObject';

export class MessageId extends UuidValueObject {
  constructor(value: string) {
    super(value);
  }

  static create(): MessageId {
    return this.random();
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
