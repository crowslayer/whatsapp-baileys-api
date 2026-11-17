import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';

import { Description } from '@modules/campaign/domain/Description';

describe('Description', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a description with the given value', () => {
    const description = Description.create('Monthly promotional campaign');

    expect(description.value).toBe('Monthly promotional campaign');
  });

  it('should keep the surrounding whitespace of the value', () => {
    const description = Description.create('  padded  ');

    expect(description.value).toBe('  padded  ');
  });

  it('should throw a ValidationError when the value is empty', () => {
    expect(() => Description.create('')).toThrow(ValidationError);
  });

  it('should throw a ValidationError when the value has less than two characters', () => {
    expect(() => Description.create('a')).toThrow(ValidationError);
  });

  it('should throw a ValidationError when the value is a single space', () => {
    expect(() => Description.create(' ')).toThrow(ValidationError);
  });

  it('should accept a value with exactly two characters', () => {
    const description = Description.create('ab');

    expect(description.value).toBe('ab');
  });

  it('should accept a value with exactly one hundred and fifty characters', () => {
    const description = Description.create('a'.repeat(150));

    expect(description.value).toHaveLength(150);
  });

  it('should throw a ValidationError when the value exceeds one hundred and fifty characters', () => {
    expect(() => Description.create('a'.repeat(151))).toThrow(ValidationError);
  });

  it('should be equal to another description with the same value', () => {
    const first = Description.create('Monthly promotional campaign');
    const second = Description.create('Monthly promotional campaign');

    expect(first.equals(second)).toBe(true);
  });

  it('should not be equal to another description with a different value', () => {
    const first = Description.create('Monthly promotional campaign');
    const second = Description.create('Weekly promotional campaign');

    expect(first.equals(second)).toBe(false);
  });
});
