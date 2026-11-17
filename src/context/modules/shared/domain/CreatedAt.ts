import { DateValueObject } from '@shared/domain/value-object/DateValueObject';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

export class CreatedAt extends DateValueObject {
  protected validate(): void {
    if (!(this.value instanceof Date) || isNaN(this.value.getTime())) {
      throw new InvalidArgumentError('Invalid Date value');
    }
  }

  private constructor(value: Date) {
    super(value);
  }

  static create(value: Date): CreatedAt {
    return new CreatedAt(value);
  }

  toISOString(): string {
    return this.value.toDateString();
  }

  isBefore(other: CreatedAt): boolean {
    return this.value < other.value;
  }

  isAfter(other: CreatedAt): boolean {
    return this.value > other.value;
  }
}
