import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BooleanValueObject } from '@shared/domain/value-object/BooleanValueObject';

class Flag extends BooleanValueObject {
  constructor(value: boolean) {
    super(value);
  }

  protected validate(): void {}
}

describe('BooleanValueObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps a true value', () => {
    const flag = new Flag(true);

    expect(flag.value).toBe(true);
    expect(flag.toPrimitives()).toBe(true);
  });

  it('keeps a false value', () => {
    const flag = new Flag(false);

    expect(flag.value).toBe(false);
    expect(flag.toPrimitives()).toBe(false);
  });

  it('compares instances with the same boolean value as equal', () => {
    const a = new Flag(true);
    const b = new Flag(true);

    expect(a.equals(b)).toBe(true);
  });

  it('compares instances with different boolean values as not equal', () => {
    const a = new Flag(true);
    const b = new Flag(false);

    expect(a.equals(b)).toBe(false);
  });

  it('converts the value to its string representation', () => {
    const flag = new Flag(true);

    expect(flag.toString()).toBe('true');
  });
});
