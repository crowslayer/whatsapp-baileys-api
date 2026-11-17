import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';

import { FlowNotFoundError } from '@modules/flows/domain/FlowNotFoundError';

describe('FlowNotFoundError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a domain error and an instance of Error', () => {
    const error = new FlowNotFoundError('Flow not found');

    expect(error).toBeInstanceOf(FlowNotFoundError);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
  });

  it('exposes the RESOURCE_NOT_FOUND error code', () => {
    const error = new FlowNotFoundError('Flow not found');

    expect(error.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
    expect(error.code).toBe(6001);
  });

  it('exposes the DOMAIN_VIOLATION error type', () => {
    const error = new FlowNotFoundError('Flow not found');

    expect(error.type).toBe(ErrorType.DOMAIN_VIOLATION);
  });

  it('keeps the provided message', () => {
    const error = new FlowNotFoundError('Flow not found');

    expect(error.message).toBe('Flow not found');
  });

  it('uses the class name as error name', () => {
    const error = new FlowNotFoundError('Flow not found');

    expect(error.name).toBe('FlowNotFoundError');
  });

  it('supports an optional cause', () => {
    const cause = new Error('root cause');
    const error = new FlowNotFoundError('Flow not found', { cause });

    expect(error.cause).toBe(cause);
  });

  it('can be thrown and caught as FlowNotFoundError', () => {
    const thrower = (): never => {
      throw new FlowNotFoundError('Flow not found');
    };

    expect(thrower).toThrow(FlowNotFoundError);
    expect(thrower).toThrow('Flow not found');
  });

  it('does not lose the error code after being wrapped by a generic error', () => {
    let caught: unknown;

    try {
      throw new FlowNotFoundError('Flow not found');
    } catch (error) {
      caught = error;
    }

    expect((caught as FlowNotFoundError).code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
  });
});
