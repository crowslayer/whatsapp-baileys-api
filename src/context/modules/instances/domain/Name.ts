import { ValidationError } from '@shared/domain/error/ValidationError';
import { StringValueObject } from '@shared/domain/value-object/StringValueObject';

export class Name extends StringValueObject {
  private constructor(value: string) {
    super(value.trim());
  }

  static create(value: string): Name {
    return new Name(value);
  }

  private isNotEmpty(value: string): void {
    if (value === '') {
      throw new ValidationError([
        { field: 'name', message: 'El nombre de departmento no debe ser vacio' },
      ]);
    }
  }

  private lengthIsFurtherOrLessThat(value: string): void {
    if (value.length < 2) {
      throw new ValidationError([
        { field: 'name', message: 'El nombre de departmento debe tener minimo 2 caracteres' },
      ]);
    }
    if (value.length > 50) {
      throw new ValidationError([
        { field: 'name', message: 'El nombre de departmento debe tener maximo 50 caracteres' },
      ]);
    }
  }

  protected validate(): void {
    this.isNotEmpty(this._value);
    this.lengthIsFurtherOrLessThat(this._value);
  }
}
