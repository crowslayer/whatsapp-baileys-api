import { ValidationError } from '@shared/domain/error/ValidationError';
import { UuidValueObject } from '@shared/domain/value-object/UuidValueObject';

export class InstanceId extends UuidValueObject {
  constructor(value: string) {
    super(value);
  }

  static create(): InstanceId {
    return this.random();
  }

  static fromString(value: string): InstanceId {
    return new InstanceId(value);
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new ValidationError([{ field: 'instanceId', message: 'InstanceId cannot be empty' }]);
    }
  }
}
