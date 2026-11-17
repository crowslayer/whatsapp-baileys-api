import { DateValueObject } from '@shared/domain/value-object/DateValueObject';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

export class LockExpiresAt extends DateValueObject {
  private constructor(value: Date) {
    super(value);
  }

  protected validate(): void {
    if (!(this.value instanceof Date) || isNaN(this.value.getTime())) {
      throw new InvalidArgumentError('Invalid Date value');
    }
  }

  static create(value: Date): LockExpiresAt {
    return new LockExpiresAt(value);
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  isBefore(other: LockExpiresAt): boolean {
    return this.value < other.value;
  }

  isAfter(other: LockExpiresAt): boolean {
    return this.value > other.value;
  }
}
