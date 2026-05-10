import { ValueObject } from '@shared/domain/ValueObject';

export class ChatId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static fromString(value: string): ChatId {
    return new ChatId(value.trim());
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new Error('ChatId cannot be empty.');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: ChatId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
