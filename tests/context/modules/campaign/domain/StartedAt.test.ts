import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

import { StartedAt } from '@modules/campaign/domain/StartedAt';

const VALID_DATE = new Date('2024-06-01T08:00:00.000Z');

describe('StartedAt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a started date from a valid date', () => {
    const startedAt = StartedAt.create(VALID_DATE);

    expect(startedAt.value).toEqual(VALID_DATE);
  });

  it('should not keep the same date reference', () => {
    const startedAt = StartedAt.create(VALID_DATE);

    expect(startedAt.value).not.toBe(VALID_DATE);
  });

  it('should throw an InvalidArgumentError when the date is invalid', () => {
    expect(() => StartedAt.create(new Date('invalid-date'))).toThrow(InvalidArgumentError);
  });

  it('should return the iso representation of the date', () => {
    const startedAt = StartedAt.create(VALID_DATE);

    expect(startedAt.toISOString()).toBe('2024-06-01T08:00:00.000Z');
  });

  it('should be before an earlier date', () => {
    const startedAt = StartedAt.create(VALID_DATE);
    const other = StartedAt.create(new Date('2024-06-02T08:00:00.000Z'));

    expect(startedAt.isBefore(other)).toBe(true);
  });

  it('should be after a later date', () => {
    const startedAt = StartedAt.create(VALID_DATE);
    const other = StartedAt.create(new Date('2024-05-31T08:00:00.000Z'));

    expect(startedAt.isAfter(other)).toBe(true);
  });

  it('should be equal to another started date with the same instant', () => {
    const startedAt = StartedAt.create(VALID_DATE);
    const other = StartedAt.create(new Date('2024-06-01T08:00:00.000Z'));

    expect(startedAt.equals(other)).toBe(true);
  });

  it('should not be equal to another started date with a different instant', () => {
    const startedAt = StartedAt.create(VALID_DATE);
    const other = StartedAt.create(new Date('2024-06-02T08:00:00.000Z'));

    expect(startedAt.equals(other)).toBe(false);
  });
});
