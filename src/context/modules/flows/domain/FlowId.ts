import { ValidationError } from '@shared/domain/error/ValidationError';
import { UuidValueObject } from '@shared/domain/value-object/UuidValueObject';

export class FlowId extends UuidValueObject {
  constructor(value: string) {
    super(value);
  }

  static create(): FlowId {
    return this.random();
  }

  static fromString(value: string): FlowId {
    return new FlowId(value);
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new ValidationError([{ field: 'flowId', message: 'FlowId cannot be empty' }]);
    }
  }
}
