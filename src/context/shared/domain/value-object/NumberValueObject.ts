import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';
import { ValueObject } from '@shared/domain/value-object/ValueObject';

export abstract class NumberValueObject extends ValueObject<number> {
  constructor(value: number) {
    super(value);

    if (Number.isNaN(value)) {
      throw new InvalidArgumentError('Number value not supported');
    }
  }

  isBiggerThan(other: NumberValueObject): boolean {
    return this.value > other.value;
  }

  isLowerThan(other: NumberValueObject): boolean {
    return this.value < other.value;
  }
}
