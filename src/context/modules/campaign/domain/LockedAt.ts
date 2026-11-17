import { DateValueObject } from '@shared/domain/value-object/DateValueObject';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

export class LockedAt extends DateValueObject {
  private constructor(value: Date) {
    super(value);
  }

  protected validate(): void {
    if (!(this.value instanceof Date) || isNaN(this.value.getTime())) {
      throw new InvalidArgumentError('Invalid Date value');
    }
  }

  static create(value: Date): LockedAt {
    return new LockedAt(value);
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  isBefore(other: LockedAt): boolean {
    return this.value < other.value;
  }

  isAfter(other: LockedAt): boolean {
    return this.value > other.value;
  }
}
