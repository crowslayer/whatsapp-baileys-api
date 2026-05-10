import { DomainError } from '../../../src/shared/infrastructure/errors/DomainError';

class TestDomainError extends DomainError {
  constructor(message?: string) {
    super(message);
  }
}

describe('DomainError', () => {
  test('should create with message', () => {
    const error = new TestDomainError('test message');
    expect(error.message).toBe('test message');
  });

  test('should set name correctly', () => {
    const error = new TestDomainError('test');
    expect(error.name).toBe('TestDomainError');
  });

  test('should extend Error', () => {
    const error = new TestDomainError('test');
    expect(error).toBeInstanceOf(Error);
  });

  test('should work with instanceof', () => {
    const error = new TestDomainError('test');
    expect(error).toBeInstanceOf(TestDomainError);
    expect(error).toBeInstanceOf(DomainError);
  });
});
