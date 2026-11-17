import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

import { RuntimeError } from '@modules/instances/application/runtime/RuntimeError';

describe('RuntimeError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an infrastructure error', () => {
    const error = new RuntimeError('Runtime failure');

    expect(error).toBeInstanceOf(InfrastructureError);
    expect(error).toBeInstanceOf(Error);
  });

  it('exposes the INTERNAL_ERROR error code', () => {
    const error = new RuntimeError('Runtime failure');

    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
  });

  it('exposes the INTERNAL error type', () => {
    const error = new RuntimeError('Runtime failure');

    expect(error.type).toBe(ErrorType.INTERNAL);
  });

  it('keeps the provided message', () => {
    const error = new RuntimeError('Runtime failure');

    expect(error.message).toBe('Runtime failure');
  });

  it('uses the class name as error name', () => {
    const error = new RuntimeError('Runtime failure');

    expect(error.name).toBe('RuntimeError');
  });
});
