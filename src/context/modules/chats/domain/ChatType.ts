import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';
import { ValueObject } from '@shared/domain/value-object/ValueObject';

export type ChatTypeValue = 'chat' | 'group';

export class ChatType extends ValueObject<ChatTypeValue> {
  private constructor(value: ChatTypeValue) {
    super(value);
  }

  static create(value: string): ChatType {
    if (value === 'chat') {
      return new ChatType('chat');
    }
    if (value === 'group') {
      return new ChatType('group');
    }

    throw new InvalidArgumentError('not type supported');
  }

  get value(): ChatTypeValue {
    return this._value;
  }
  protected validate(): void {
    if (this._value !== 'chat' && this._value !== 'group') {
      throw new InvalidArgumentError(
        `Invalid ChatType: "${this._value}". Must be "chat" or "group".`
      );
    }
  }
  isGroup(): boolean {
    return this._value === 'group';
  }

  isIndividual(): boolean {
    return this._value === 'chat';
  }

  //   equals(other: ChatType): boolean {
  //     return this._value === other._value;
  //   }

  toString(): string {
    return this._value;
  }
}
