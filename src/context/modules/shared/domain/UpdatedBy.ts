import { UuidValueObject } from '@shared/domain/value-object/UuidValueObject';

export class UpdatedBy extends UuidValueObject {
  constructor(value: string) {
    super(value);
  }

  static create(): UpdatedBy {
    return this.random();
  }

  static fromString(value: string): UpdatedBy {
    return new UpdatedBy(value);
  }

  protected validate(): void {
    this.ensureIsValidUuid(this._value);
  }
}
