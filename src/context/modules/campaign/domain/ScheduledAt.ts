import { DateValueObject } from '@shared/domain/value-object/DateValueObject';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

export class ScheduledAt extends DateValueObject {
  private constructor(value: Date) {
    super(value);
  }

  protected validate(): void {
    if (!(this.value instanceof Date) || isNaN(this.value.getTime())) {
      throw new InvalidArgumentError('Invalid Date value');
    }
  }

  static create(value: Date): ScheduledAt {
    return new ScheduledAt(value);
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  isBefore(other: ScheduledAt): boolean {
    return this.value < other.value;
  }

  isAfter(other: ScheduledAt): boolean {
    return this.value > other.value;
  }
}
