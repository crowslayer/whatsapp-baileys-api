import { ValueObject } from '@shared/domain/ValueObject';
import { ValidationError } from '@shared/infrastructure/errors/ValidationError';

export class Name extends ValueObject<string> {
  private constructor(value: string) {
    value.trim().toUpperCase();
    super(value);
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
