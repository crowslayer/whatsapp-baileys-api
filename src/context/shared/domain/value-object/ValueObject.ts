export type Primitives = string | number | boolean | Date;

export abstract class ValueObject<T extends Primitives> {
  protected readonly _value: T;

  protected constructor(value: T) {
    this._value = value;
    this.validate();
  }

  get value(): T {
    return this._value;
  }

  protected abstract validate(): void;

  equals(other: ValueObject<T>): boolean {
    if (other === undefined || other === null) return false;
    if (other.constructor !== this.constructor) return false;

    if (this.value instanceof Date && other.value instanceof Date) {
      return this.value.getTime() === other.value.getTime();
    }

    return other.value === this.value;
  }

  toString(): string {
    if (this.value instanceof Date) {
      return this.value.toISOString();
    }

    return String(this.value);
  }

  toPrimitives(): T {
    return this._value;
  }
}
