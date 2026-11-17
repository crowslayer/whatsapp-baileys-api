import { ValidationError } from '@shared/domain/error/ValidationError';
import { StringValueObject } from '@shared/domain/value-object/StringValueObject';

export class Description extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Description {
    return new Description(value);
  }

  private isNotEmpty(value: string): void {
    if (value === '') {
      throw new ValidationError([
        { field: 'description', message: 'La descripcion no debe ser vacio' },
      ]);
    }
  }

  private lengthIsFurtherOrLessThat(value: string): void {
    if (value.length < 2) {
      throw new ValidationError([
        { field: 'description', message: 'La descripcion debe tener minimo 2 caracteres' },
      ]);
    }
    if (value.length > 150) {
      throw new ValidationError([
        { field: 'description', message: 'La descripcion debe tener maximo 150 caracteres' },
      ]);
    }
  }

  protected validate(): void {
    this.isNotEmpty(this._value);
    this.lengthIsFurtherOrLessThat(this._value);
  }
}
