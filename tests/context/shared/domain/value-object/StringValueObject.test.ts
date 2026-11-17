import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';
import { StringValueObject } from '@shared/domain/value-object/StringValueObject';

class Name extends StringValueObject {
  protected validate(): void {}
}

describe('StringValueObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps a non-empty value', () => {
    const name = new Name('Alexander');

    expect(name.value).toBe('Alexander');
    expect(name.toPrimitives()).toBe('Alexander');
  });

  it('keeps a value that only contains surrounding whitespace and content', () => {
    const name = new Name('  content  ');

    expect(name.value).toBe('  content  ');
  });

  it('throws InvalidArgumentError for an empty string', () => {
    expect(() => new Name('')).toThrow(InvalidArgumentError);
    expect(() => new Name('')).toThrow('String value cannot be empty');
  });

  it('throws InvalidArgumentError for a whitespace-only string', () => {
    expect(() => new Name('   ')).toThrow('String value cannot be empty');
  });

  it('throws InvalidArgumentError for a tab and newline only string', () => {
    expect(() => new Name('\t\n')).toThrow(InvalidArgumentError);
  });

  it('compares instances by value', () => {
    const a = new Name('same');
    const b = new Name('same');
    const c = new Name('other');

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
