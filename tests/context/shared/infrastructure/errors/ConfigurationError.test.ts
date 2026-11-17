import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';
import { ConfigurationError } from '@shared/infrastructure/errors/ConfigurationError';

describe('ConfigurationError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an infrastructure error', () => {
    const error = new ConfigurationError('missing field');

    expect(error).toBeInstanceOf(InfrastructureError);
    expect(error).toBeInstanceOf(Error);
  });

  it('uses the missing required fields error code', () => {
    const error = new ConfigurationError('missing field');

    expect(error.code).toBe(ErrorCode.MISSING_REQUIRED_FIELDS);
  });

  it('keeps the infrastructure error type', () => {
    const error = new ConfigurationError('missing field');

    expect(error.type).toBe(ErrorType.INFRASTRUCTURE);
  });

  it('stores the provided message', () => {
    const error = new ConfigurationError('missing field');

    expect(error.message).toBe('missing field');
  });

  it('uses the class name as error name', () => {
    const error = new ConfigurationError('missing field');

    expect(error.name).toBe('ConfigurationError');
  });

  it('supports an optional cause', () => {
    const cause = new Error('root cause');

    const error = new ConfigurationError('missing field', { cause });

    expect(error.cause).toBe(cause);
  });
});
