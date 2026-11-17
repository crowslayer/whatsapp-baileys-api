import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

import { LockedAt } from '@modules/campaign/domain/LockedAt';

const VALID_DATE = new Date('2024-05-10T12:00:00.000Z');

describe('LockedAt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a locked date from a valid date', () => {
    const lockedAt = LockedAt.create(VALID_DATE);

    expect(lockedAt.value).toEqual(VALID_DATE);
  });

  it('should not keep the same date reference', () => {
    const lockedAt = LockedAt.create(VALID_DATE);

    expect(lockedAt.value).not.toBe(VALID_DATE);
  });

  it('should throw an InvalidArgumentError when the date is invalid', () => {
    expect(() => LockedAt.create(new Date('invalid-date'))).toThrow(InvalidArgumentError);
  });

  it('should return the iso representation of the date', () => {
    const lockedAt = LockedAt.create(VALID_DATE);

    expect(lockedAt.toISOString()).toBe('2024-05-10T12:00:00.000Z');
  });

  it('should be before an earlier date', () => {
    const lockedAt = LockedAt.create(VALID_DATE);
    const other = LockedAt.create(new Date('2024-05-11T12:00:00.000Z'));

    expect(lockedAt.isBefore(other)).toBe(true);
  });

  it('should be after a later date', () => {
    const lockedAt = LockedAt.create(VALID_DATE);
    const other = LockedAt.create(new Date('2024-05-09T12:00:00.000Z'));

    expect(lockedAt.isAfter(other)).toBe(true);
  });

  it('should not be after an equal date', () => {
    const lockedAt = LockedAt.create(VALID_DATE);
    const other = LockedAt.create(new Date('2024-05-10T12:00:00.000Z'));

    expect(lockedAt.isAfter(other)).toBe(false);
  });

  it('should be equal to another locked date with the same instant', () => {
    const lockedAt = LockedAt.create(VALID_DATE);
    const other = LockedAt.create(new Date('2024-05-10T12:00:00.000Z'));

    expect(lockedAt.equals(other)).toBe(true);
  });

  it('should not be equal to another locked date with a different instant', () => {
    const lockedAt = LockedAt.create(VALID_DATE);
    const other = LockedAt.create(new Date('2024-05-11T12:00:00.000Z'));

    expect(lockedAt.equals(other)).toBe(false);
  });
});
