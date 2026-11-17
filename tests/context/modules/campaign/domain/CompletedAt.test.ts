import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

import { CompletedAt } from '@modules/campaign/domain/CompletedAt';

const VALID_DATE = new Date('2024-05-10T12:00:00.000Z');

describe('CompletedAt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a completed date from a valid date', () => {
    const completedAt = CompletedAt.create(VALID_DATE);

    expect(completedAt.value).toEqual(VALID_DATE);
  });

  it('should not keep the same date reference', () => {
    const completedAt = CompletedAt.create(VALID_DATE);

    expect(completedAt.value).not.toBe(VALID_DATE);
  });

  it('should throw an InvalidArgumentError when the date is invalid', () => {
    expect(() => CompletedAt.create(new Date('invalid-date'))).toThrow(InvalidArgumentError);
  });

  it('should return the iso representation of the date', () => {
    const completedAt = CompletedAt.create(VALID_DATE);

    expect(completedAt.toISOString()).toBe('2024-05-10T12:00:00.000Z');
  });

  it('should be before an earlier date', () => {
    const completedAt = CompletedAt.create(VALID_DATE);
    const other = CompletedAt.create(new Date('2024-05-11T12:00:00.000Z'));

    expect(completedAt.isBefore(other)).toBe(true);
  });

  it('should not be before an equal date', () => {
    const completedAt = CompletedAt.create(VALID_DATE);
    const other = CompletedAt.create(new Date('2024-05-10T12:00:00.000Z'));

    expect(completedAt.isBefore(other)).toBe(false);
  });

  it('should be after a later date', () => {
    const completedAt = CompletedAt.create(VALID_DATE);
    const other = CompletedAt.create(new Date('2024-05-09T12:00:00.000Z'));

    expect(completedAt.isAfter(other)).toBe(true);
  });

  it('should not be after an equal date', () => {
    const completedAt = CompletedAt.create(VALID_DATE);
    const other = CompletedAt.create(new Date('2024-05-10T12:00:00.000Z'));

    expect(completedAt.isAfter(other)).toBe(false);
  });

  it('should be equal to another completed date with the same instant', () => {
    const completedAt = CompletedAt.create(VALID_DATE);
    const other = CompletedAt.create(new Date('2024-05-10T12:00:00.000Z'));

    expect(completedAt.equals(other)).toBe(true);
  });

  it('should not be equal to another completed date with a different instant', () => {
    const completedAt = CompletedAt.create(VALID_DATE);
    const other = CompletedAt.create(new Date('2024-05-11T12:00:00.000Z'));

    expect(completedAt.equals(other)).toBe(false);
  });
});
