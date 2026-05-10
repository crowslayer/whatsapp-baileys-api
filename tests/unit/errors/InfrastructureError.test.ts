import { InfrastructureError } from '../../../src/shared/infrastructure/errors/InfrastructureError';
import { ApplicationError } from '../../../src/shared/infrastructure/errors/ApplicationError';
import { ErrorCode } from '../../../src/shared/infrastructure/errors/ErrorCode';
import { ErrorType } from '../../../src/shared/infrastructure/errors/ErrorType';

describe('InfrastructureError', () => {
  test('should set message via constructor', () => {
    const error = new InfrastructureError('Something went wrong');
    expect(error.message).toBe('Something went wrong');
  });

  test('should extend ApplicationError', () => {
    const error = new InfrastructureError('test');
    expect(error).toBeInstanceOf(ApplicationError);
  });

  test('should have code INTERNAL_ERROR (5000)', () => {
    const error = new InfrastructureError('test');
    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
  });

  test('should have type ErrorType.INTERNAL', () => {
    const error = new InfrastructureError('test');
    expect(error.type).toBe(ErrorType.INTERNAL);
  });

  test('should pass original error as cause', () => {
    const cause = new Error('original');
    const error = new InfrastructureError('test', cause);
    expect(error.cause).toBe(cause);
  });
});
