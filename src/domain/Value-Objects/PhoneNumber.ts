import { ValueObject } from "@shared/domain/ValueObject";

export class PhoneNumber extends ValueObject<string> {
    private constructor(value: string) {
      super(value);
    }
  
    static create(value: string): PhoneNumber {
      return new PhoneNumber(value);
    }
  
    protected validate(): void {
      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(this._value)) {
        throw new Error('Invalid phone number format. Must be 10-15 digits');
      }
    }
  
    toWhatsAppFormat(): string {
      return `${this._value}@s.whatsapp.net`;
    }
  }