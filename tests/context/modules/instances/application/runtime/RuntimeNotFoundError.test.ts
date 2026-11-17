import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';

import { RuntimeNotFoundError } from '@modules/instances/application/runtime/RuntimeNotFoundError';

describe('RuntimeNotFoundError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a domain error', () => {
    const error = new RuntimeNotFoundError('Runtime not found');

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
  });

  it('exposes the RESOURCE_NOT_FOUND error code', () => {
    const error = new RuntimeNotFoundError('Runtime not found');

    expect(error.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
  });

  it('exposes the DOMAIN_VIOLATION error type', () => {
    const error = new RuntimeNotFoundError('Runtime not found');

    expect(error.type).toBe(ErrorType.DOMAIN_VIOLATION);
  });

  it('keeps the provided message', () => {
    const error = new RuntimeNotFoundError('Runtime for instance 1 not found');

    expect(error.message).toBe('Runtime for instance 1 not found');
  });

  it('uses the class name as error name', () => {
    const error = new RuntimeNotFoundError('Runtime not found');

    expect(error.name).toBe('RuntimeNotFoundError');
  });
});
