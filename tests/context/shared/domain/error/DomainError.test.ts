import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseError } from '@shared/domain/error/BaseError';
import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';

class BusinessRuleError extends DomainError {
  readonly code: ErrorCode = ErrorCode.BUSINESS_RULE_VIOLATION;
}

describe('DomainError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an instance of BaseError', () => {
    const error = new BusinessRuleError('rule broken');

    expect(error).toBeInstanceOf(BaseError);
    expect(error).toBeInstanceOf(DomainError);
  });

  it('stores the provided message', () => {
    const error = new BusinessRuleError('rule broken');

    expect(error.message).toBe('rule broken');
  });

  it('uses the domain violation error type', () => {
    const error = new BusinessRuleError('rule broken');

    expect(error.type).toBe(ErrorType.DOMAIN_VIOLATION);
  });

  it('exposes the code declared by the concrete class', () => {
    const error = new BusinessRuleError('rule broken');

    expect(error.code).toBe(ErrorCode.BUSINESS_RULE_VIOLATION);
  });

  it('uses the concrete class name as error name', () => {
    const error = new BusinessRuleError('rule broken');

    expect(error.name).toBe('BusinessRuleError');
  });

  it('supports a cause through the base constructor', () => {
    const cause = new Error('root cause');
    const error = new BusinessRuleError('rule broken', { cause });

    expect(error.cause).toBe(cause);
  });
});
