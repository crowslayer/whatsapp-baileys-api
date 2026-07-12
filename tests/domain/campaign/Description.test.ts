import { describe, expect } from 'vitest';
import { Description } from '../../../src/domain/campaign/Description';
import { ValidationError } from '../../../src/shared/infrastructure/errors/ValidationError';

describe('Description', () => {
  test('should create with valid description', () => {
    const desc = Description.create('Campaign description');
    expect(desc.value).toBe('Campaign description');
  });

  test('should throw for empty string', () => {
    expect(() => Description.create('')).toThrow(ValidationError);
  });

  test('should throw for less than 2 chars', () => {
    expect(() => Description.create('A')).toThrow(ValidationError);
  });

  test('should throw for more than 150 chars', () => {
    expect(() => Description.create('A'.repeat(151))).toThrow(ValidationError);
  });

  test('equals returns true for same description', () => {
    expect(Description.create('Hello').equals(Description.create('Hello'))).toBe(true);
  });
});
