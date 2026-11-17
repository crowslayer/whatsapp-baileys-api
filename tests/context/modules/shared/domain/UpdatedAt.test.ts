import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UpdatedAt } from '@modules/shared/domain/UpdatedAt';

describe('UpdatedAt', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('compares update dates and formats the timestamp', () => {
    // Arrange
    const earlier = UpdatedAt.create(new Date('2025-01-01T00:00:00.000Z'));
    const later = UpdatedAt.create(new Date('2025-01-02T00:00:00.000Z'));

    // Act / Assert
    expect(earlier.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(earlier.isBefore(later)).toBe(true);
    expect(later.isAfter(earlier)).toBe(true);
    expect(() => UpdatedAt.create(new Date(Number.NaN))).toThrow('Invalid Date value');
  });
});
