import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

import { CreatedAt } from '@modules/shared/domain/CreatedAt';
import { LastConnectedAt } from '@modules/instances/domain/LastConnectedAt';

describe('LastConnectedAt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a last connected at from a valid date', () => {
    const date = new Date('2024-03-10T10:00:00.000Z');

    const lastConnectedAt = LastConnectedAt.create(date);

    expect(lastConnectedAt.value.getTime()).toBe(date.getTime());
  });

  it('throws InvalidArgumentError when the date is invalid', () => {
    expect(() => LastConnectedAt.create(new Date('invalid-date'))).toThrow(InvalidArgumentError);
  });

  it('clones the given date so external mutations do not affect it', () => {
    const date = new Date('2024-03-10T10:00:00.000Z');

    const lastConnectedAt = LastConnectedAt.create(date);
    date.setFullYear(2030);

    expect(lastConnectedAt.value.getFullYear()).toBe(2024);
  });

  it('returns the date as a date string', () => {
    const lastConnectedAt = LastConnectedAt.create(new Date('2024-03-10T10:00:00.000Z'));

    expect(lastConnectedAt.toISOString()).toBe(new Date('2024-03-10T10:00:00.000Z').toDateString());
  });

  it('returns true when the date is before another date', () => {
    const lastConnectedAt = LastConnectedAt.create(new Date('2024-01-01T00:00:00.000Z'));
    const other = CreatedAt.create(new Date('2024-06-01T00:00:00.000Z'));

    expect(lastConnectedAt.isBefore(other)).toBe(true);
  });

  it('returns false when the date is before an earlier date', () => {
    const lastConnectedAt = LastConnectedAt.create(new Date('2024-06-01T00:00:00.000Z'));
    const other = CreatedAt.create(new Date('2024-01-01T00:00:00.000Z'));

    expect(lastConnectedAt.isBefore(other)).toBe(false);
  });

  it('returns true when the date is after another date', () => {
    const lastConnectedAt = LastConnectedAt.create(new Date('2024-06-01T00:00:00.000Z'));
    const other = CreatedAt.create(new Date('2024-01-01T00:00:00.000Z'));

    expect(lastConnectedAt.isAfter(other)).toBe(true);
  });

  it('returns false when the date is after a later date', () => {
    const lastConnectedAt = LastConnectedAt.create(new Date('2024-01-01T00:00:00.000Z'));
    const other = CreatedAt.create(new Date('2024-06-01T00:00:00.000Z'));

    expect(lastConnectedAt.isAfter(other)).toBe(false);
  });

  it('returns true when comparing two last connected at with the same timestamp', () => {
    const first = LastConnectedAt.create(new Date('2024-01-01T00:00:00.000Z'));
    const second = LastConnectedAt.create(new Date('2024-01-01T00:00:00.000Z'));

    expect(first.equals(second)).toBe(true);
  });

  it('returns false when comparing two last connected at with different timestamps', () => {
    const first = LastConnectedAt.create(new Date('2024-01-01T00:00:00.000Z'));
    const second = LastConnectedAt.create(new Date('2024-01-02T00:00:00.000Z'));

    expect(first.equals(second)).toBe(false);
  });
});
