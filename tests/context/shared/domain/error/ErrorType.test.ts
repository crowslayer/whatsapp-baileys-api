import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorType } from '@shared/domain/error/ErrorType';

describe('ErrorType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes domain and business violation types', () => {
    expect(ErrorType.DOMAIN_VIOLATION).toBe('domain_business_violation');
    expect(ErrorType.VALIDATION).toBe('validation_error');
    expect(ErrorType.NOT_FOUND).toBe('resource_not_found');
  });

  it('exposes security and access control types', () => {
    expect(ErrorType.UNAUTHENTICATED).toBe('unauthenticated');
    expect(ErrorType.UNAUTHORIZED).toBe('unauthorized_permission');
  });

  it('exposes infrastructure types', () => {
    expect(ErrorType.DATABASE).toBe('database_failure');
    expect(ErrorType.INFRASTRUCTURE).toBe('infrastructure_failure');
    expect(ErrorType.EVENT).toBe('event_bus_failure');
  });

  it('exposes system and entrypoint types', () => {
    expect(ErrorType.RATE_LIMIT).toBe('rate_limit_exceeded');
    expect(ErrorType.INTERNAL).toBe('internal_server_error');
  });

  it('does not assign the same string value to two members', () => {
    const values = Object.values(ErrorType);

    expect(new Set(values).size).toBe(values.length);
  });
});
