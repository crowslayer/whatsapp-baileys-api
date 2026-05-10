import { v4 as uuidv4 } from 'uuid';

import { ValueObject } from '@shared/domain/ValueObject';
import { ValidationError } from '@shared/infrastructure/errors/ValidationError';

export class FlowId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(): FlowId {
    return new FlowId(uuidv4());
  }

  static fromString(value: string): FlowId {
    return new FlowId(value);
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new ValidationError([{ field: 'instanceId', message: 'InstanceId cannot be empty' }]);
    }
  }
}
