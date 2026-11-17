import { Primitives, ValueObject } from '@shared/domain/value-object/ValueObject';

export abstract class EnumValueObject<T extends Primitives> extends ValueObject<T> {
  protected constructor(value: T, validValues: readonly T[]) {
    super(value);
    this.checkValueIsValid(value, validValues);
  }

  public checkValueIsValid(value: T, validValues: readonly T[]): void {
    if (!validValues.includes(value)) {
      this.throwErrorForInvalidValue(value);
    }
  }

  protected abstract throwErrorForInvalidValue(value: T): void;
}
