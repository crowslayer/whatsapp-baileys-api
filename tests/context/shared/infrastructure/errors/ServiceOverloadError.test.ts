import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { ServiceOverloadedError } from '@shared/infrastructure/errors/ServiceOverloadError';

describe('ServiceOverloadedError', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('exposes retry metadata and preserves the original cause', () => {
    // Arrange
    const cause = new Error('queue full');

    // Act
    const error = new ServiceOverloadedError(12, cause);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Service temporarily overloaded');
    expect(error.retryAfter).toBe(12);
    expect(error.code).toBe(ErrorCode.LIMIT_EXCEEDED);
    expect(error.type).toBe(ErrorType.INFRASTRUCTURE);
    expect(error.cause).toBe(cause);
  });
});
