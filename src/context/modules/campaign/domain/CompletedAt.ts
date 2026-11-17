import { DateValueObject } from '@shared/domain/value-object/DateValueObject';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

export class CompletedAt extends DateValueObject {
  private constructor(value: Date) {
    super(value);
  }

  protected validate(): void {
    if (!(this.value instanceof Date) || isNaN(this.value.getTime())) {
      throw new InvalidArgumentError('Invalid Date value');
    }
  }

  static create(value: Date): CompletedAt {
    return new CompletedAt(value);
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  isBefore(other: CompletedAt): boolean {
    return this.value < other.value;
  }

  isAfter(other: CompletedAt): boolean {
    return this.value > other.value;
  }
}
