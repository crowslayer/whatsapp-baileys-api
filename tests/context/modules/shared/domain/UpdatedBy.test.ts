import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UpdatedBy } from '@modules/shared/domain/UpdatedBy';

describe('UpdatedBy', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('creates valid identifiers from strings', () => {
    // Arrange
    const value = '018f6c2a-1b2c-7def-89ab-0123456789ab';

    // Act
    const updatedBy = UpdatedBy.fromString(value);

    // Assert
    expect(updatedBy.value).toBe(value);
    expect(updatedBy.toPrimitives()).toBe(value);
  });

  it('rejects invalid UUID values', () => {
    // Arrange / Act / Assert
    expect(() => UpdatedBy.fromString('not-a-uuid')).toThrow();
  });
});
