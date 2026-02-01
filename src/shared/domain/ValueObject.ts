export abstract class ValueObject<T> {
    protected readonly _value: T;
  
    constructor(value: T) {
      this._value = value;
      this.validate();
    }
  
    get value(): T {
      return this._value;
    }
  
    protected abstract validate(): void;
  
    public equals(vo?: ValueObject<T>): boolean {
      if (!vo) return false;
      return JSON.stringify(this._value) === JSON.stringify(vo._value);
    }
  }