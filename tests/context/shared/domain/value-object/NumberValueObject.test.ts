import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';
import { NumberValueObject } from '@shared/domain/value-object/NumberValueObject';

class Amount extends NumberValueObject {
  protected validate(): void {}
}

describe('NumberValueObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps a valid numeric value', () => {
    const amount = new Amount(42);

    expect(amount.value).toBe(42);
    expect(amount.toPrimitives()).toBe(42);
  });

  it('keeps zero as a valid value', () => {
    const amount = new Amount(0);

    expect(amount.value).toBe(0);
  });

  it('keeps negative numbers as valid values', () => {
    const amount = new Amount(-15);

    expect(amount.value).toBe(-15);
  });

  it('keeps Infinity as a valid value', () => {
    const amount = new Amount(Infinity);

    expect(amount.value).toBe(Infinity);
  });

  it('throws InvalidArgumentError when the value is NaN', () => {
    expect(() => new Amount(NaN)).toThrow(InvalidArgumentError);
    expect(() => new Amount(NaN)).toThrow('Number value not supported');
  });

  it('returns true when the current value is bigger than the other one', () => {
    const bigger = new Amount(10);
    const smaller = new Amount(5);

    expect(bigger.isBiggerThan(smaller)).toBe(true);
  });

  it('returns false when the current value is not bigger than the other one', () => {
    const smaller = new Amount(5);
    const bigger = new Amount(10);

    expect(smaller.isBiggerThan(bigger)).toBe(false);
  });

  it('returns false when comparing equal values with isBiggerThan', () => {
    const a = new Amount(7);
    const b = new Amount(7);

    expect(a.isBiggerThan(b)).toBe(false);
  });

  it('returns true when the current value is lower than the other one', () => {
    const smaller = new Amount(5);
    const bigger = new Amount(10);

    expect(smaller.isLowerThan(bigger)).toBe(true);
  });

  it('returns false when the current value is not lower than the other one', () => {
    const bigger = new Amount(10);
    const smaller = new Amount(5);

    expect(bigger.isLowerThan(smaller)).toBe(false);
  });

  it('returns false when comparing equal values with isLowerThan', () => {
    const a = new Amount(7);
    const b = new Amount(7);

    expect(a.isLowerThan(b)).toBe(false);
  });
});
