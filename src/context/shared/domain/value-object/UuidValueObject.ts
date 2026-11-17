import { validate as uuidValidate, v7 as uuidv7 } from 'uuid';

import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';
import { ValueObject } from '@shared/domain/value-object/ValueObject';

export abstract class UuidValueObject extends ValueObject<string> {
  protected constructor(value: string) {
    super(value);
    this.ensureIsValidUuid(value);
  }

  static random<T extends UuidValueObject>(this: new (value: string) => T): T {
    return new this(uuidv7());
  }

  protected ensureIsValidUuid(id: string): void {
    if (!uuidValidate(id)) {
      throw new InvalidArgumentError(`<${this.constructor.name}> does not allow the value <${id}>`);
    }
  }
}
