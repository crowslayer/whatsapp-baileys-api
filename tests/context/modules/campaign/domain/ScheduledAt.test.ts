import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

import { ScheduledAt } from '@modules/campaign/domain/ScheduledAt';

const VALID_DATE = new Date('2024-06-01T08:00:00.000Z');

describe('ScheduledAt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a scheduled date from a valid date', () => {
    const scheduledAt = ScheduledAt.create(VALID_DATE);

    expect(scheduledAt.value).toEqual(VALID_DATE);
  });

  it('should not keep the same date reference', () => {
    const scheduledAt = ScheduledAt.create(VALID_DATE);

    expect(scheduledAt.value).not.toBe(VALID_DATE);
  });

  it('should throw an InvalidArgumentError when the date is invalid', () => {
    expect(() => ScheduledAt.create(new Date('invalid-date'))).toThrow(InvalidArgumentError);
  });

  it('should return the iso representation of the date', () => {
    const scheduledAt = ScheduledAt.create(VALID_DATE);

    expect(scheduledAt.toISOString()).toBe('2024-06-01T08:00:00.000Z');
  });

  it('should be before an earlier date', () => {
    const scheduledAt = ScheduledAt.create(VALID_DATE);
    const other = ScheduledAt.create(new Date('2024-06-02T08:00:00.000Z'));

    expect(scheduledAt.isBefore(other)).toBe(true);
  });

  it('should be after a later date', () => {
    const scheduledAt = ScheduledAt.create(VALID_DATE);
    const other = ScheduledAt.create(new Date('2024-05-31T08:00:00.000Z'));

    expect(scheduledAt.isAfter(other)).toBe(true);
  });

  it('should not be before an equal date', () => {
    const scheduledAt = ScheduledAt.create(VALID_DATE);
    const other = ScheduledAt.create(new Date('2024-06-01T08:00:00.000Z'));

    expect(scheduledAt.isBefore(other)).toBe(false);
  });

  it('should be equal to another scheduled date with the same instant', () => {
    const scheduledAt = ScheduledAt.create(VALID_DATE);
    const other = ScheduledAt.create(new Date('2024-06-01T08:00:00.000Z'));

    expect(scheduledAt.equals(other)).toBe(true);
  });

  it('should not be equal to another scheduled date with a different instant', () => {
    const scheduledAt = ScheduledAt.create(VALID_DATE);
    const other = ScheduledAt.create(new Date('2024-06-02T08:00:00.000Z'));

    expect(scheduledAt.equals(other)).toBe(false);
  });
});
