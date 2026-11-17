import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';
import { QueueFullError } from '@shared/infrastructure/concurrency/QueueFullError';

describe('QueueFullError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an infrastructure error', () => {
    const error = new QueueFullError('Queue is full');

    expect(error).toBeInstanceOf(QueueFullError);
    expect(error).toBeInstanceOf(InfrastructureError);
    expect(error).toBeInstanceOf(Error);
  });

  it('exposes the LIMIT_EXCEEDED error code', () => {
    const error = new QueueFullError('Queue is full');

    expect(error.code).toBe(ErrorCode.LIMIT_EXCEEDED);
  });

  it('exposes the infrastructure error type', () => {
    const error = new QueueFullError('Queue is full');

    expect(error.type).toBe(ErrorType.INFRASTRUCTURE);
  });

  it('keeps the provided message', () => {
    const error = new QueueFullError('Queue is full');

    expect(error.message).toBe('Queue is full');
  });

  it('uses the class name as error name', () => {
    const error = new QueueFullError('Queue is full');

    expect(error.name).toBe('QueueFullError');
  });

  it('supports the cause option', () => {
    const cause = new Error('root cause');

    const error = new QueueFullError('Queue is full', { cause });

    expect(error.cause).toBe(cause);
  });
});
