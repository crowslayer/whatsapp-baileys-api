import { ConflictError } from '../../../src/shared/infrastructure/errors/ConflictError';
import { DomainError } from '../../../src/shared/infrastructure/errors/DomainError';

describe('ConflictError', () => {
  test('should set message via constructor', () => {
    const error = new ConflictError('Resource already exists');
    expect(error.message).toBe('Resource already exists');
  });

  test('should extend DomainError', () => {
    const error = new ConflictError('test');
    expect(error).toBeInstanceOf(DomainError);
  });
});
