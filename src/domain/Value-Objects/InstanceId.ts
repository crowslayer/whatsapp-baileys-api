import { ValueObject } from '@shared/domain/ValueObject';
import { v4 as uuidv4 } from 'uuid';

export class InstanceId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): InstanceId {
    return new InstanceId(value || uuidv4());
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new Error('InstanceId cannot be empty');
    }
  }
}