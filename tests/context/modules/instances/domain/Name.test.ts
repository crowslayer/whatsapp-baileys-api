import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

import { Name } from '@modules/instances/domain/Name';

describe('Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a name trimming the surrounding whitespace', () => {
    const name = Name.create('  WhatsApp Principal  ');

    expect(name.value).toBe('WhatsApp Principal');
  });

  it('creates a name with exactly two characters', () => {
    const name = Name.create('ab');

    expect(name.value).toBe('ab');
  });

  it('creates a name with exactly fifty characters', () => {
    const name = Name.create('a'.repeat(50));

    expect(name.value).toHaveLength(50);
  });

  it('throws ValidationError when the value is empty', () => {
    expect(() => Name.create('')).toThrow(ValidationError);
  });

  it('throws ValidationError when the value is only whitespace', () => {
    expect(() => Name.create('    ')).toThrow(ValidationError);
  });

  it('never reaches the base class empty check because validation runs first', () => {
    expect(() => Name.create('')).not.toThrow(InvalidArgumentError);
  });

  it('throws ValidationError when the value has less than two characters', () => {
    expect(() => Name.create('a')).toThrow(ValidationError);
  });

  it('throws ValidationError when the value has more than fifty characters', () => {
    expect(() => Name.create('a'.repeat(51))).toThrow(ValidationError);
  });

  it('exposes the validation errors with the name field', () => {
    try {
      Name.create('a');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).errors[0].field).toBe('name');
    }
  });

  it('returns true when comparing two names with the same value', () => {
    const first = Name.create('Primary');
    const second = Name.create('Primary');

    expect(first.equals(second)).toBe(true);
  });

  it('returns false when comparing two names with different values', () => {
    const first = Name.create('Primary');
    const second = Name.create('Secondary');

    expect(first.equals(second)).toBe(false);
  });

  it('converts the name to its string representation', () => {
    const name = Name.create('Primary');

    expect(name.toString()).toBe('Primary');
  });
});
