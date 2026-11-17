import { UuidValueObject } from '@shared/domain/value-object/UuidValueObject';

export class CreatedBy extends UuidValueObject {
  constructor(value: string) {
    super(value);
  }

  static create(): CreatedBy {
    return this.random();
  }

  static fromString(value: string): CreatedBy {
    return new CreatedBy(value);
  }

  protected validate(): void {
    this.ensureIsValidUuid(this._value);
  }
}
