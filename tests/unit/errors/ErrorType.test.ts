import { ErrorType } from '../../../src/shared/infrastructure/errors/ErrorType';

describe('ErrorType', () => {
  test('should have AUTHENTICATION', () => {
    expect(ErrorType.AUTHENTICATION).toBe('authentication');
  });

  test('should have VALIDATION', () => {
    expect(ErrorType.VALIDATION).toBe('validation');
  });

  test('should have INTERNAL', () => {
    expect(ErrorType.INTERNAL).toBe('internal');
  });

  test('should have DATABASE', () => {
    expect(ErrorType.DATABASE).toBe('database');
  });

  test('should have NOT_FOUND', () => {
    expect(ErrorType.NOT_FOUND).toBe('not found');
  });

  test('should have FORBIDDEN', () => {
    expect(ErrorType.FORBIDDEN).toBe('forbidden');
  });
});
