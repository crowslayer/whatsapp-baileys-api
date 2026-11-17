import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValueObject } from '@shared/domain/value-object/ValueObject';

class TestStringValue extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(): void {
    TestStringValue.validationCalls.push(this._value);
  }

  static validationCalls: string[] = [];
}

class TestDateValue extends ValueObject<Date> {
  constructor(value: Date) {
    super(value);
  }

  protected validate(): void {}
}

class OtherStringValue extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(): void {}
}

describe('ValueObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestStringValue.validationCalls = [];
  });

  it('exposes the wrapped value through the value getter', () => {
    const vo = new TestStringValue('hello');

    expect(vo.value).toBe('hello');
  });

  it('returns the raw primitive through toPrimitives', () => {
    const vo = new TestStringValue('hello');

    expect(vo.toPrimitives()).toBe('hello');
  });

  it('invokes validate during construction', () => {
    const vo = new TestStringValue('validated');

    expect(TestStringValue.validationCalls).toEqual(['validated']);
    expect(vo.value).toBe('validated');
  });

  it('propagates errors thrown by validate', () => {
    class FailingValue extends ValueObject<string> {
      constructor(value: string) {
        super(value);
      }

      protected validate(): void {
        throw new Error('invalid value');
      }
    }

    expect(() => new FailingValue('boom')).toThrow('invalid value');
  });

  it('returns true when comparing two instances of the same class with the same value', () => {
    const a = new TestStringValue('same');
    const b = new TestStringValue('same');

    expect(a.equals(b)).toBe(true);
  });

  it('returns false when comparing two instances of the same class with different values', () => {
    const a = new TestStringValue('one');
    const b = new TestStringValue('two');

    expect(a.equals(b)).toBe(false);
  });

  it('returns false when comparing instances of different classes', () => {
    const a = new TestStringValue('same');
    const b = new OtherStringValue('same');

    expect(a.equals(b)).toBe(false);
  });

  it('returns false when comparing against undefined', () => {
    const a = new TestStringValue('same');

    expect(a.equals(undefined as unknown as ValueObject<string>)).toBe(false);
  });

  it('returns false when comparing against null', () => {
    const a = new TestStringValue('same');

    expect(a.equals(null as unknown as ValueObject<string>)).toBe(false);
  });

  it('compares Date values by timestamp', () => {
    const time = new Date('2024-01-01T00:00:00.000Z');
    const a = new TestDateValue(new Date(time.getTime()));
    const b = new TestDateValue(new Date(time.getTime() + 1000));

    expect(a.equals(b)).toBe(false);
  });

  it('returns true for Date values sharing the same timestamp', () => {
    const time = new Date('2024-01-01T00:00:00.000Z');
    const a = new TestDateValue(new Date(time.getTime()));
    const b = new TestDateValue(new Date(time.getTime()));

    expect(a.equals(b)).toBe(true);
  });

  it('converts a string value to its string representation', () => {
    const vo = new TestStringValue('text');

    expect(vo.toString()).toBe('text');
  });

  it('converts a Date value to its ISO representation', () => {
    const vo = new TestDateValue(new Date('2024-05-06T07:08:09.000Z'));

    expect(vo.toString()).toBe('2024-05-06T07:08:09.000Z');
  });
});
