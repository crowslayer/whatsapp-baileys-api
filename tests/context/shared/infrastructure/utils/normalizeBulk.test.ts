import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { normalizeBulk } from '@shared/infrastructure/utils/normalizeBulk';

describe('normalizeBulk', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('deduplicates valid JIDs and returns invalid inputs', () => {
    // Arrange
    const input = ['5512345678', '5512345678', 'invalid', '12345@g.us'];

    // Act
    const result = normalizeBulk(input);

    // Assert
    expect(result.valid).toEqual(['5215512345678@s.whatsapp.net', '12345@g.us']);
    expect(result.invalid).toEqual(['invalid']);
  });

  it('handles an empty batch', () => {
    // Arrange
    const input: string[] = [];

    // Act
    const result = normalizeBulk(input);

    // Assert
    expect(result).toEqual({ valid: [], invalid: [] });
  });
});
