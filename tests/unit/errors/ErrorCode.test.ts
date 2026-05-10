import { ErrorCode } from '../../../src/shared/infrastructure/errors/ErrorCode';

describe('ErrorCode', () => {
  test('should have UNAUTHORIZED = 1001', () => {
    expect(ErrorCode.UNAUTHORIZED).toBe(1001);
  });

  test('should have FORBIDDEN = 1002', () => {
    expect(ErrorCode.FORBIDDEN).toBe(1002);
  });

  test('should have VALIDATION_FAILED = 2001', () => {
    expect(ErrorCode.VALIDATION_FAILED).toBe(2001);
  });

  test('should have DB_CONNECTION_FAILED = 3001', () => {
    expect(ErrorCode.DB_CONNECTION_FAILED).toBe(3001);
  });

  test('should have DB_CONSTRAINT_VIOLATION = 3002', () => {
    expect(ErrorCode.DB_CONSTRAINT_VIOLATION).toBe(3002);
  });

  test('should have DB_PERSISTENCE_ERROR = 3003', () => {
    expect(ErrorCode.DB_PERSISTENCE_ERROR).toBe(3003);
  });

  test('should have INTERNAL_ERROR = 5000', () => {
    expect(ErrorCode.INTERNAL_ERROR).toBe(5000);
  });

  test('should have CONFLICT = 6002', () => {
    expect(ErrorCode.CONFLICT).toBe(6002);
  });
});
