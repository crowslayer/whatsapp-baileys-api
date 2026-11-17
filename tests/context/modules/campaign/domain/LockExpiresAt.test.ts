import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

import { LockExpiresAt } from '@modules/campaign/domain/LockExpiresAt';

const VALID_DATE = new Date('2024-05-10T12:01:00.000Z');

describe('LockExpiresAt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a lock expiration date from a valid date', () => {
    const lockExpiresAt = LockExpiresAt.create(VALID_DATE);

    expect(lockExpiresAt.value).toEqual(VALID_DATE);
  });

  it('should not keep the same date reference', () => {
    const lockExpiresAt = LockExpiresAt.create(VALID_DATE);

    expect(lockExpiresAt.value).not.toBe(VALID_DATE);
  });

  it('should throw an InvalidArgumentError when the date is invalid', () => {
    expect(() => LockExpiresAt.create(new Date('invalid-date'))).toThrow(InvalidArgumentError);
  });

  it('should return the iso representation of the date', () => {
    const lockExpiresAt = LockExpiresAt.create(VALID_DATE);

    expect(lockExpiresAt.toISOString()).toBe('2024-05-10T12:01:00.000Z');
  });

  it('should be before an earlier date', () => {
    const lockExpiresAt = LockExpiresAt.create(VALID_DATE);
    const other = LockExpiresAt.create(new Date('2024-05-10T12:02:00.000Z'));

    expect(lockExpiresAt.isBefore(other)).toBe(true);
  });

  it('should be after a later date', () => {
    const lockExpiresAt = LockExpiresAt.create(VALID_DATE);
    const other = LockExpiresAt.create(new Date('2024-05-10T12:00:00.000Z'));

    expect(lockExpiresAt.isAfter(other)).toBe(true);
  });

  it('should be equal to another lock expiration date with the same instant', () => {
    const lockExpiresAt = LockExpiresAt.create(VALID_DATE);
    const other = LockExpiresAt.create(new Date('2024-05-10T12:01:00.000Z'));

    expect(lockExpiresAt.equals(other)).toBe(true);
  });

  it('should not be equal to another lock expiration date with a different instant', () => {
    const lockExpiresAt = LockExpiresAt.create(VALID_DATE);
    const other = LockExpiresAt.create(new Date('2024-05-11T12:01:00.000Z'));

    expect(lockExpiresAt.equals(other)).toBe(false);
  });
});
