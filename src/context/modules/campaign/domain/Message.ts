import { ValidationError } from '@shared/domain/error/ValidationError';
import { StringValueObject } from '@shared/domain/value-object/StringValueObject';

export class Message extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Message {
    return new Message(value);
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
        { field: 'message', message: 'El mens0aje debe tener minimo 2 caracteres' },
      ]);
    }
    if (value.length > 1000) {
      throw new ValidationError([
        { field: 'message', message: 'El mensage debe tener maximo 1000 caracteres' },
      ]);
    }
  }

  protected validate(): void {
    this.isNotEmpty(this._value);
    this.lengthIsFurtherOrLessThat(this._value);
  }
}
