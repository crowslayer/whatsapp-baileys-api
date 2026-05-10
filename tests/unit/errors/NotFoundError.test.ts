import { NotFoundError } from '../../../src/shared/infrastructure/errors/NotFoundError';
import { DomainError } from '../../../src/shared/infrastructure/errors/DomainError';

describe('NotFoundError', () => {
  test('should set message via constructor', () => {
    const error = new NotFoundError('Resource not found');
    expect(error.message).toBe('Resource not found');
  });

  test('should extend DomainError', () => {
    const error = new NotFoundError('test');
    expect(error).toBeInstanceOf(DomainError);
  });
});
