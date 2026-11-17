import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';
import { ValueObject } from '@shared/domain/value-object/ValueObject';

export abstract class DateValueObject extends ValueObject<Date> {
  constructor(value: Date) {
    super(new Date(value.getTime()));
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new InvalidArgumentError('Invalid Date value');
    }
  }

  toDate(): Date {
    return new Date(this.value.getTime());
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  isBefore(other: DateValueObject): boolean {
    return this.value.getTime() < other.value.getTime();
  }

  isAfter(other: DateValueObject): boolean {
    return this.value.getTime() > other.value.getTime();
  }

  override equals(other: DateValueObject): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
