import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { dedupe } from '@shared/infrastructure/utils/arrayUtils';

describe('dedupe', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('preserves first occurrence order while removing duplicates', () => {
    // Arrange
    const values = [1, 2, 1, 3, 2];

    // Act
    const result = dedupe(values);

    // Assert
    expect(result).toEqual([1, 2, 3]);
  });

  it('returns an empty array for empty input', () => {
    // Arrange
    const values: string[] = [];

    // Act
    const result = dedupe(values);

    // Assert
    expect(result).toEqual([]);
  });
});
