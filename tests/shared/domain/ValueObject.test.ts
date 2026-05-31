import { ValueObject } from '../../../src/shared/domain/ValueObject';

class TestValueObject extends ValueObject<string> {
  protected validate(): void {}
}

class CustomGetterValueObject extends ValueObject<string> {
  protected validate(): void {}

  get value(): string {
    return `custom-${this._value}`;
  }
}

describe('ValueObject', () => {
  test('constructor calls validate', () => {
    const vo = new TestValueObject('test');
    expect(vo).toBeInstanceOf(ValueObject);
  });

  test('value getter returns the value', () => {
    const vo = new TestValueObject('hello');
    expect(vo.value).toBe('hello');
  });

  test('equals returns true for same value', () => {
    const a = new TestValueObject('same');
    const b = new TestValueObject('same');
    expect(a.equals(b)).toBe(true);
  });

  test('equals returns false for different value', () => {
    const a = new TestValueObject('alpha');
    const b = new TestValueObject('beta');
    expect(a.equals(b)).toBe(false);
  });

  test('equals returns false when compared to undefined/null', () => {
    const vo = new TestValueObject('test');
    expect(vo.equals(undefined)).toBe(false);
    expect(vo.equals(null as unknown as TestValueObject)).toBe(false);
  });

  test('subclasses can override value getter', () => {
    const vo = new CustomGetterValueObject('test');
    expect(vo.value).toBe('custom-test');
  });
});
