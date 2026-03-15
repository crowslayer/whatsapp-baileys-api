import { v4 as uuidv4 } from 'uuid';

import { ValueObject } from '@shared/domain/ValueObject';
import { ValidationError } from '@shared/infrastructure/errors/ValidationError';

export class InstanceId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(): InstanceId {
    return new InstanceId(uuidv4());
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
