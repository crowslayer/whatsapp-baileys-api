import { DateValueObject } from '@shared/domain/value-object/DateValueObject';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

export class UpdatedAt extends DateValueObject {
  private constructor(value: Date) {
    super(value);
  }

  protected validate(): void {
    if (!(this.value instanceof Date) || isNaN(this.value.getTime())) {
      throw new InvalidArgumentError('Invalid Date value');
    }
  }

  static create(value: Date): UpdatedAt {
    return new UpdatedAt(value);
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  isBefore(other: UpdatedAt): boolean {
    return this.value < other.value;
  }

  isAfter(other: UpdatedAt): boolean {
    return this.value > other.value;
  }
}
