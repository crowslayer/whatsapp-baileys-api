import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HashedValueObject } from '@shared/domain/value-object/HashedValueObject';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

class Password extends HashedValueObject {
  protected validate(): void {}
}

const BCRYPT_HASH = `$2b$10$${'a'.repeat(53)}`;
const BCRYPT_HASH_2A = `$2a$12$${'b'.repeat(53)}`;
const BCRYPT_HASH_2Y = `$2y$05$${'c'.repeat(53)}`;

describe('HashedValueObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects a valid bcrypt hash with the 2b prefix', () => {
    expect(HashedValueObject.isHashedValue(BCRYPT_HASH)).toBe(true);
  });

  it('detects a valid bcrypt hash with the 2a prefix', () => {
    expect(HashedValueObject.isHashedValue(BCRYPT_HASH_2A)).toBe(true);
  });

  it('detects a valid bcrypt hash with the 2y prefix', () => {
    expect(HashedValueObject.isHashedValue(BCRYPT_HASH_2Y)).toBe(true);
  });

  it('rejects a plain text password', () => {
    expect(HashedValueObject.isHashedValue('plain-password')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(HashedValueObject.isHashedValue('')).toBe(false);
  });

  it('rejects a hash with an unsupported prefix', () => {
    expect(HashedValueObject.isHashedValue(`$2x$10$${'a'.repeat(53)}`)).toBe(false);
  });

  it('rejects a hash with a non numeric cost factor', () => {
    expect(HashedValueObject.isHashedValue(`$2b$ab$${'a'.repeat(53)}`)).toBe(false);
  });

  it('rejects a hash with an invalid payload length', () => {
    expect(HashedValueObject.isHashedValue(`$2b$10$${'a'.repeat(52)}`)).toBe(false);
  });

  it('keeps a valid hashed value', () => {
    const password = new Password(BCRYPT_HASH);

    expect(password.value).toBe(BCRYPT_HASH);
    expect(password.toPrimitives()).toBe(BCRYPT_HASH);
  });

  it('throws InvalidArgumentError when the value is not hashed', () => {
    expect(() => new Password('plain-password')).toThrow(InvalidArgumentError);
    expect(() => new Password('plain-password')).toThrow('Value must be a valid Hashed Value');
  });

  it('throws InvalidArgumentError when the value is empty', () => {
    expect(() => new Password('')).toThrow('Value must be a valid Hashed Value');
  });

  it('returns true from ensureIsHasValue when the length is 60', () => {
    const password = new Password(BCRYPT_HASH);

    expect(password.ensureIsHasValue(BCRYPT_HASH)).toBe(true);
  });

  it('returns false from ensureIsHasValue when the length is not 60', () => {
    const password = new Password(BCRYPT_HASH);

    expect(password.ensureIsHasValue('short')).toBe(false);
    expect(password.ensureIsHasValue('')).toBe(false);
  });
});
