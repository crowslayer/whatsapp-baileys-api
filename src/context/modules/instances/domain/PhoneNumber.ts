import { ValidationError } from '@shared/domain/error/ValidationError';
import { StringValueObject } from '@shared/domain/value-object/StringValueObject';

export class PhoneNumber extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): PhoneNumber {
    return new PhoneNumber(value);
  }

  protected validate(): void {
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(this._value)) {
      throw new ValidationError([
        { field: 'phonenumber', message: 'Invalid phone number format. Must be 10-15 digits' },
      ]);
    }
  }

  toWhatsAppFormat(): string {
    return `${this._value}@s.whatsapp.net`;
  }
}
