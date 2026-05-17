import { ValueObject } from '@shared/domain/ValueObject';

export type ChatTypeValue = 'chat' | 'group';

export class ChatType extends ValueObject<ChatTypeValue> {
  private constructor(value: ChatTypeValue) {
    super(value);
  }

  static readonly INDIVIDUAL = new ChatType('chat');
  static readonly GROUP = new ChatType('group');

  static create(value: string): ChatType {
    return new ChatType(value as ChatTypeValue);
  }

  get value(): ChatTypeValue {
    return this._value;
  }
  protected validate(): void {
    if (this._value !== 'chat' && this._value !== 'group') {
      throw new Error(`Invalid ChatType: "${this._value}". Must be "chat" or "group".`);
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
