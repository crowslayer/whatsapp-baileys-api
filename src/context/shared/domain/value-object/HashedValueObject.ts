import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';
import { ValueObject } from '@shared/domain/value-object/ValueObject';

export abstract class HashedValueObject extends ValueObject<string> {
  constructor(value: string) {
    if (!HashedValueObject.isHashedValue(value)) {
      throw new InvalidArgumentError('Value must be a valid Hashed Value');
    }
    super(value);
  }

  /**
   * Verifica si el valor proporcionado tiene formato de hash bcrypt válido.
   * No lanza error, solo devuelve un booleano.
   */
  static isHashedValue(value: string): boolean {
    return /^\$2[aby]\$[0-9]{2}\$.{53}$/.test(value); // patrón para hash bcrypt
  }

  ensureIsHasValue(value: string): boolean {
    return value.length === 60;
  }
}
