import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreatedBy } from '@modules/shared/domain/CreatedBy';

describe('CreatedBy', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('creates valid identifiers from strings', () => {
    // Arrange
    const value = '018f6c2a-1b2c-7def-89ab-0123456789ab';

    // Act
    const createdBy = CreatedBy.fromString(value);

    // Assert
    expect(createdBy.value).toBe(value);
    expect(createdBy.toPrimitives()).toBe(value);
  });

  it('rejects invalid UUID values', () => {
    // Arrange / Act / Assert
    expect(() => CreatedBy.fromString('not-a-uuid')).toThrow();
  });
});
