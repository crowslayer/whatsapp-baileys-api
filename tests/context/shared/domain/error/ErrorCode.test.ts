import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';

describe('ErrorCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes identity and session codes in the 1000 range', () => {
    expect(ErrorCode.UNAUTHENTICATED).toBe(1001);
    expect(ErrorCode.UNAUTHORIZED).toBe(1002);
    expect(ErrorCode.INVALID_CREDENTIALS).toBe(1003);
    expect(ErrorCode.TOKEN_EXPIRED).toBe(1004);
    expect(ErrorCode.TOKEN_MALFORMED).toBe(1005);
    expect(ErrorCode.ACCOUNT_DISABLED).toBe(1006);
    expect(ErrorCode.SESSION_ALREADY_EXISTS).toBe(1007);
  });

  it('exposes validation codes in the 2000 range', () => {
    expect(ErrorCode.VALIDATION_FAILED).toBe(2001);
    expect(ErrorCode.MISSING_REQUIRED_FIELDS).toBe(2002);
    expect(ErrorCode.INVALID_DATA_TYPE).toBe(2003);
    expect(ErrorCode.PAYLOAD_TOO_LARGE).toBe(2004);
  });

  it('exposes persistence codes in the 3000 range', () => {
    expect(ErrorCode.DATABASE_ERROR).toBe(3000);
    expect(ErrorCode.DB_CONNECTION_FAILED).toBe(3001);
    expect(ErrorCode.DB_DUPLICATE_KEY).toBe(3002);
    expect(ErrorCode.DB_FOREIGN_KEY_VIOLATION).toBe(3003);
    expect(ErrorCode.DB_TRANSACTION_FAILED).toBe(3004);
    expect(ErrorCode.DB_CONCURRENCY_CONFLICT).toBe(3005);
  });

  it('exposes flow control codes in the 4000 range', () => {
    expect(ErrorCode.TOO_MANY_REQUESTS).toBe(4001);
    expect(ErrorCode.THIRD_PARTY_PROVIDER_DOWN).toBe(4002);
    expect(ErrorCode.THIRD_PARTY_API_ERROR).toBe(4003);
  });

  it('exposes internal system codes in the 5000 range', () => {
    expect(ErrorCode.INTERNAL_ERROR).toBe(5000);
    expect(ErrorCode.NOT_IMPLEMENTED).toBe(5001);
    expect(ErrorCode.SERVICE_UNAVAILABLE).toBe(5002);
  });

  it('exposes business rule codes in the 6000 range', () => {
    expect(ErrorCode.RESOURCE_NOT_FOUND).toBe(6001);
    expect(ErrorCode.BUSINESS_RULE_VIOLATION).toBe(6002);
    expect(ErrorCode.INSUFFICIENT_FUNDS).toBe(6003);
    expect(ErrorCode.LIMIT_EXCEEDED).toBe(6004);
    expect(ErrorCode.INVALID_STATE_TRANSITION).toBe(6005);
    expect(ErrorCode.BATCH_PROCESSING_PARTIAL).toBe(6006);
  });

  it('exposes event and CQRS codes in the 7000 range', () => {
    expect(ErrorCode.EVENT_ERROR).toBe(7000);
    expect(ErrorCode.EVENT_HANDLER_NOT_FOUND).toBe(7001);
    expect(ErrorCode.EVENT_PUBLISH_FAILED).toBe(7002);
    expect(ErrorCode.EVENT_SUBSCRIPTION_FAILED).toBe(7003);
    expect(ErrorCode.EVENT_SERIALIZATION_FAILED).toBe(7004);
    expect(ErrorCode.EVENT_DESERIALIZATION_FAILED).toBe(7005);
    expect(ErrorCode.EVENT_PROCESSING_TIMEOUT).toBe(7006);
    expect(ErrorCode.COMMAND_HANDLER_NOT_FOUND).toBe(7007);
    expect(ErrorCode.QUERY_HANDLER_NOT_FOUND).toBe(7008);
    expect(ErrorCode.COMMAND_VALIDATION_FAILED).toBe(7009);
    expect(ErrorCode.QUERY_VALIDATION_FAILED).toBe(7010);
    expect(ErrorCode.BUS_DISPATCH_FAILED).toBe(7011);
    expect(ErrorCode.BUS_MIDDLEWARE_ERROR).toBe(7012);
  });

  it('maps numeric values back to their member names', () => {
    expect(ErrorCode[ErrorCode.VALIDATION_FAILED]).toBe('VALIDATION_FAILED');
    expect(ErrorCode[ErrorCode.INTERNAL_ERROR]).toBe('INTERNAL_ERROR');
  });

  it('does not assign the same numeric code to two members', () => {
    const values = Object.values(ErrorCode).filter((value) => typeof value === 'number');

    expect(new Set(values).size).toBe(values.length);
  });
});
