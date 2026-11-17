import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreatedAt } from '@modules/shared/domain/CreatedAt';

describe('CreatedAt', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('compares date values and formats them as a date string', () => {
    // Arrange
    const earlier = CreatedAt.create(new Date(2025, 0, 1));
    const later = CreatedAt.create(new Date(2025, 0, 2));

    // Act / Assert
    expect(earlier.toISOString()).toBe(new Date(2025, 0, 1).toDateString());
    expect(earlier.isBefore(later)).toBe(true);
    expect(later.isAfter(earlier)).toBe(true);
  });

  it('rejects an invalid date', () => {
    // Arrange / Act / Assert
    expect(() => CreatedAt.create(new Date(Number.NaN))).toThrow('Invalid Date value');
  });
});
