import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';
import { ValueObject } from '@shared/domain/value-object/ValueObject';

export abstract class StringValueObject extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    if (value.trim().length === 0) {
      throw new InvalidArgumentError('String value cannot be empty');
    }
  }
}
